import _ from 'lodash';
import path from 'path';

export default function getOptions(params) {
    const options = {
        packages: {
            location: _.get(params, 'dir', path.join(process.cwd(), 'packages')),
            pattern: _.get(params, 'file', 'package.js')
        },
        tasks: {
            gulp: _.get(params, 'gulp', null),
            target: _.get(params, 'package', null)
        }
    };

    return options;
}
