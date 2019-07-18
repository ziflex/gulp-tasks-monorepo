import Symbol from 'es6-symbol';
import PackageManager from './packages/manager';
import TaskManager from './tasks/manager';
import Logger from './logger';
import getOptions from './options';

const FIELDS = {
    packages: Symbol('packages'),
    tasks: Symbol('tasks'),
    logger: Symbol('logger'),
};

class Manager {
    constructor(...args) {
        const options = getOptions(...args);

        this[FIELDS.logger] = Logger(options.logging);
        this[FIELDS.packages] = PackageManager(
            this[FIELDS.logger],
            options.packages,
        );
        this[FIELDS.tasks] = TaskManager(
            this[FIELDS.logger],
            this[FIELDS.packages],
            options.tasks,
        );
    }

    task(...args) {
        this[FIELDS.tasks].add(...args);
        return this;
    }
}

module.exports = function create(...args) {
    return new Manager(...args);
};
