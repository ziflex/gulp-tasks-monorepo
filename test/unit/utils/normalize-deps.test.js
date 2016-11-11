/* eslint-disable no-unused-expressions, import/no-extraneous-dependencies */
import { expect } from 'chai';
import normalize from '../../../src/utils/normalize-deps';

describe('Utils. Normalize dependencies', () => {
    it('should normalize parallel dependencies', () => {
        const input = ['foo', 'bar'];
        const output = normalize(input);

        expect(output).to.eql([['foo', 'bar']]);
    });

    it('should normalize sequential dependencies', () => {
        const input = [['foo', 'bar']];
        const output = normalize(input);

        expect(output).to.eql(['foo', 'bar']);
    });

    it('should normalize mixed dependencies', () => {
        const input = ['foo', ['bar', 'qaz'], 'wsx'];
        const output = normalize(input);

        expect(output).to.eql([['foo'], 'bar', 'qaz', ['wsx']]);
    });
});
