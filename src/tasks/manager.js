/* eslint-disable global-require */
import Symbol from 'es6-symbol';
import Promise from 'bluebird';
import _ from 'lodash';
import Pipeline from 'piperline';
import Task from './task';

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

    if (_.isString(target)) {
        return _.map(target.split(','), i => _.trim(i));
    }

    return null;
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
    }

    task(name, ...args) {
        let deps = null;
        let handler = null;

        if (args.length === 2) {
            [deps, handler] = args;
        } else if (args.length === 1) {
            [handler] = args;
        }

        const logger = this[FIELDS.logger];
        const criteria = this[FIELDS.target];
        const task = Task(logger, deps, handler);

        this[FIELDS.engine].task(name, (complete) => {
            this[FIELDS.packages].find(criteria).then((foundPackages) => {
                const pipes = _.map(foundPackages, (pkg) => {
                    return (data, next, done) => {
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
