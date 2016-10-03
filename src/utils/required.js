import assert from 'assert';
import _ from 'lodash';

export default function required(value, name = 'Value') {
    const message = `${name} is required`;

    assert(!_.isNil(value), message);
}
