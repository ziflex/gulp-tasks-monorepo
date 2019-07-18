/* eslint-disable global-require, import/no-dynamic-require */
import Symbol from 'es6-symbol';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import glob from 'glob';
import _ from 'lodash';
import Package from './package';
import required from '../utils/required';

const INITIALIZER_NOT_FOUND_CODE = 'INITIALIZER_NOT_FOUND';
const asyncGlob = Promise.promisify(glob);

const FIELDS = {
    logger: Symbol('logger'),
    location: Symbol('location'),
    pattern: Symbol('pattern'),
};

class PackageManager {
    constructor(logger, options) {
        this[FIELDS.logger] = logger;
        this[FIELDS.location] = _.get(options, 'location', null);
        this[FIELDS.pattern] = _.get(options, 'pattern', null);

        required(this[FIELDS.logger], 'Logger');
        required(this[FIELDS.location], 'Packages location');
        required(this[FIELDS.pattern], 'Package initializer name pattern');
    }

    get(location) {
        return Promise.try(() => {
            const fileLocation = path.join(location, this[FIELDS.pattern]);

            return Promise.fromCallback((done) => fs.lstat(location, done))
                .then(() => {
                    return Promise.fromCallback((done) =>
                        fs.lstat(fileLocation, done),
                    )
                        .then((stats) => {
                            return stats.isFile();
                        })
                        .catch((reason) => {
                            if (reason.code === 'ENOENT') {
                                return Promise.resolve(false);
                            }

                            return Promise.reject(reason);
                        });
                })
                .then((exists) => {
                    let module = null;
                    let initializer = null;
                    const pkg = Package({
                        name: path.basename(location),
                        location,
                    });

                    if (exists) {
                        module = require(fileLocation);
                    }

                    // initializer not defined
                    if (_.isNil(module)) {
                        return pkg;
                    }

                    if (_.isFunction(module)) {
                        initializer = module;
                    } else if (_.isFunction(module.default)) {
                        initializer = module.default;
                    }

                    if (!_.isFunction(initializer)) {
                        const err = new Error(
                            'Initialization file must export function',
                        );
                        err.code = INITIALIZER_NOT_FOUND_CODE;
                        return Promise.reject(err);
                    }

                    // async initializer
                    if (initializer.length === 2) {
                        return Promise.fromCallback((done) =>
                            initializer(pkg, done),
                        ).then(() => pkg);
                    }

                    initializer(pkg);

                    return pkg;
                });
        });
    }

    find(criteria) {
        return Promise.try(() => {
            if (_.isString(criteria)) {
                return asyncGlob(path.join(this[FIELDS.location], criteria));
            }

            if (_.isArray(criteria)) {
                const pattern = `/{${criteria.join(',')}}/`;
                return asyncGlob(path.join(this[FIELDS.location], pattern));
            }

            if (_.isFunction(criteria)) {
                return asyncGlob(path.join(this[FIELDS.location], '/*/')).then(
                    (paths) => {
                        return _.filter(paths, criteria);
                    },
                );
            }

            return asyncGlob(path.join(this[FIELDS.location], '/*/'));
        }).then((paths) => {
            return Promise.map(paths, (currentPath) => this.get(currentPath));
        });
    }
}

export default function create(...args) {
    return new PackageManager(...args);
}
