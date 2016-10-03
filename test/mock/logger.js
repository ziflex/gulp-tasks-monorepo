import _ from 'lodash';

export default function create() {
    return {
        log: _.noop,
        warning: _.noop,
        info: _.noop,
        error: _.noop,
        success: _.noop
    };
}
