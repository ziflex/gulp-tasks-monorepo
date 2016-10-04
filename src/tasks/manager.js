/* eslint-disable global-require */
import Symbol from 'es6-symbol';
import Promise from 'bluebird';
import _ from 'lodash';
import Pipeline from 'piperline';
import Runner from './runner';
import required from '../utils/required';

const FIELDS = {
    logger: Symbol('logger'),
    engine: Symbol('engine'),
    packages: Symbol('packages'),
    target: Symbol('target')
};

function getEngine(options) {
    let engine = _.get(options, 'gulp');

    if (!_.isNil(engine)) {
        return engine;
    }

    try {
        engine = require('gulp');
    } catch (e) {
        throw new Error('Can not load gulp');
    }

    return engine;
}

function getTargetName(options) {
    const target = _.get(options, 'package');

    if (_.isNil(target)) {
        return null;
    }

    if (_.isArray(target)) {
        return target;
    }

    if (_.isString(target) && !_.isEmpty(target)) {
        const arr = target.split(',');

        if (arr.length > 1) {
            return _.map(arr, i => _.trim(i));
        }

        return _.trim(_.first(arr));
    }

    return null;
}

function parseArgs(args) {
    const [name, dependencies, handler] = args;
    const result = { name, dependencies: null, handler: null };

    if (_.isArray(dependencies)) {
        result.dependencies = dependencies;
        result.handler = handler;
    } else if (_.isFunction(dependencies)) {
        result.handler = dependencies;
    }

    return result;
}

function runPipeline(pipes) {
    return Promise.fromCallback(done => Pipeline.create(pipes).run(null, done));
}

class TasksManager {
    constructor(logger, packages, options) {
        this[FIELDS.logger] = logger;
        this[FIELDS.packages] = packages;
        this[FIELDS.engine] = getEngine(options);
        this[FIELDS.target] = getTargetName(options);

        required(this[FIELDS.logger], 'Logger');
        required(this[FIELDS.packages], 'Package Manager');
        required(this[FIELDS.engine], 'Gulp');
    }

    add(...args) {
        const { name, dependencies, handler } = parseArgs(args);

        // looks like it's grouping task
        if (_.isNil(handler)) {
            // if it has dependencies, register
            if (!_.isEmpty(dependencies)) {
                this[FIELDS.engine].task(name, dependencies);
            }

            return;
        }

        const logger = this[FIELDS.logger];
        const criteria = this[FIELDS.target];
        const task = Runner(logger, dependencies, handler);

        this[FIELDS.engine].task(name, (complete) => {
            this[FIELDS.packages].find(criteria).then((foundPackages) => {
                const pipes = _.map(foundPackages, (pkg) => {
                    return (ignore, next, done) => {
                        task(pkg, next, done);
                    };
                });

                return runPipeline(pipes).then(() => {
                    complete();
                    logger.success('Task succeeded');
                }).catch((reason) => {
                    complete(reason);

                    logger.error('Task failed');
                });
            }).catch((err) => {
                logger.error('Could not find packages');
                logger.error(err.stack);
                return complete(err);
            });
        });
    }
}

export default function create(...args) {
    return new TasksManager(...args);
}
