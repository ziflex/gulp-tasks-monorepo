function noop() {}

class GulpMock {
    constructor() {
        this._tasks = [];
    }

    task(name, deps, handler) {
        let dependencies = null;
        let func = null;

        if (Array.isArray(deps)) {
            dependencies = deps;
            func = handler;
        } else if (typeof deps === 'function') {
            func = deps;
        }

        if (!name) {
            throw new Error('Missed task name!');
        }

        this._tasks.push({ name, dependencies, func: func || noop });
    }

    getTasks() {
        return this._tasks.slice();
    }
}

export default function create() {
    return new GulpMock();
}
