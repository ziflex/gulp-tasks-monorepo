import _ from 'lodash';

export default function normalizeTasks(dependencies) {
    let tasks = [];

    _.forEach(dependencies, (dep) => {
        if (_.isArray(dep)) {
            // seq
            tasks = tasks.concat(dep);
        } else if (_.isString(dep)) {
            // parallel
            const last = _.last(tasks);

            if (_.isArray(last)) {
                last.push(dep);
            } else {
                tasks.push([dep]);
            }
        }
    });

    return tasks;
}
