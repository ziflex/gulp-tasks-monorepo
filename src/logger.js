import gutil from 'gulp-util';

const DEFAULT_OUTPUT = console;

function log(instance, color, ...msg) {
    if (!instance._quiet) {
        instance._output.log(color(...msg));
    }

    return instance;
}

class Logger {
    constructor(params = {}) {
        this._output = params.output || DEFAULT_OUTPUT;
        this._quiet = params.quiet === true;
    }

    log(...args) {
        return log(this, gutil.colors.white, ...args);
    }

    warning(...args) {
        return log(this, gutil.colors.yellow, ...args);
    }

    info(...args) {
        return log(this, gutil.colors.magenta, ...args);
    }

    error(...args) {
        return log(this, gutil.colors.red, ...args);
    }

    success(...args) {
        return log(this, gutil.colors.green, ...args);
    }
}

export default function create(params) {
    return new Logger(params);
}
