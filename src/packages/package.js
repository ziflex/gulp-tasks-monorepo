/* eslint-disable global-require */
import Symbol from 'es6-symbol';
import _ from 'lodash';
import required from '../utils/required';

const FIELDS = {
    name: Symbol('name'),
    location: Symbol('location'),
    options: Symbol('options'),
};

class Package {
    constructor(definition) {
        this[FIELDS.name] = _.get(definition, 'name', null);
        this[FIELDS.location] = _.get(definition, 'location', null);
        this[FIELDS.options] = _.get(definition, 'options', {});

        required(this[FIELDS.name], 'Package name');
        required(this[FIELDS.location], 'Package location');
    }

    name() {
        return this[FIELDS.name];
    }

    location() {
        return this[FIELDS.location];
    }

    options(key, value) {
        if (_.isNil(key)) {
            return null;
        }

        if (_.isUndefined(value)) {
            return _.get(this[FIELDS.options], key);
        }

        _.set(this[FIELDS.options], key, value);

        return this;
    }
}

export default function create(...args) {
    return new Package(...args);
}
