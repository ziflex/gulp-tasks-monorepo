import _ from 'lodash';
import path from 'path';

export default function getOptions(params) {
    const options = {
        logging: {
            quiet: _.get(params, 'quiet', false),
        },
        packages: {
            location: _.get(params, 'dir', path.join(process.cwd(), 'packages')),
            pattern: _.get(params, 'file', 'package.js')
        },
        tasks: {
            gulp: _.get(params, 'gulp', null),
            package: _.get(params, 'package', null)
        }
    };

    return options;
}
