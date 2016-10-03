import gutil from 'gulp-util';

class Logger {
    log(...args) {
        gutil.log(...args);
    }

    warning(...args) {
        gutil.log(gutil.colors.yellow(...args));
    }

    info(...args) {
        gutil.log(gutil.colors.magenta(...args));
    }

    error(...args) {
        gutil.log(gutil.colors.red(...args));
    }

    success(...args) {
        gutil.log(gutil.colors.green(...args));
    }
}

export default function create() {
    return new Logger();
}
