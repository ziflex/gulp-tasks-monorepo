import _ from 'lodash';
import eos from 'end-of-stream';
import consume from 'stream-consume';
import assert from 'assert';
import required from '../utils/required';

function complete(logger, pkg, done, err) {
    if (err) {
        logger.error('Failed to process package', pkg.name());
        return done(err);
    }

    logger.success('Successfully processed package', pkg.name());
    return done();
}

function execute(logger, pkg, task, done) {
    const finish = _.once(_.partial(complete, logger, pkg, done));
    let out = null;

    try {
        out = task(pkg, finish);
    } catch (e) {
        finish(e);
    }

    if (!_.isNil(out) && _.isFunction(out.then)) {
        out.then(() => finish()).catch(finish);
    } else if (!_.isNil(out) && _.isFunction(out.pipe)) {
        // wait for stream to end
        eos(
            out,
            {
                error: true,
                readable: out.readable,
                writable: out.writable && !out.readable,
            },
            finish,
        );

        consume(out);
    } else if (task.length < 2) {
        finish();
    }
}

export default function create(logger, handler) {
    required(logger, 'Logger');
    required(handler, 'handler');
    assert(_.isFunction(handler), 'Task handler must be a function');

    return function taskRunner(pkg, next) {
        if (_.isNil(pkg)) {
            return next();
        }

        logger.info('Started processing package', pkg.name());

        return execute(logger, pkg, handler, next);
    };
}
