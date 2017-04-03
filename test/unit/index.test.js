/* eslint-disable global-require, no-unused-expressions, import/no-extraneous-dependencies */
import { expect } from 'chai';
import sinon from 'sinon';
import path from 'path';
import Gulp from '../mock/gulp';
import Monorepo from '../../src/index';

describe('Index', () => {
    let gulp = null;

    beforeEach(() => {
        gulp = Gulp();
    });

    it('should run tasks again all packages', (done) => {
        const task = sinon.spy();
        const instance = Monorepo({
            quiet: false,
            gulp,
            dir: path.resolve(__dirname, '../fixtures/packages/')
        });

        instance.task('build', task);

        gulp.getTasks()[0].func(() => {
            expect(task.callCount).to.eql(3);
            done();
        });
    });

    it('should run tasks again given package', (done) => {
        const task = sinon.spy();
        const instance = Monorepo({
            quiet: true,
            gulp,
            dir: path.resolve(__dirname, '../fixtures/packages/'),
            package: 'package1'
        });

        instance.task('build', task);

        gulp.getTasks()[0].func(() => {
            expect(task.callCount).to.eql(1);
            done();
        });
    });

    it('should use custom file init name', (done) => {
        const instance = Monorepo({
            quiet: true,
            gulp,
            dir: path.resolve(__dirname, '../fixtures/packages/'),
            file: 'custom-pattern.js'
        });

        instance.task('build', (pkg) => {
            expect(pkg.options('test.custom')).to.be.true;
        });

        gulp.getTasks()[0].func((err) => {
            done(err);
        });
    });

    it('should be exported as "commonjs" module', () => {
        const Monorepo2 = require('../../src/index');

        expect(typeof Monorepo2 === 'function').to.be.true;
    });
});
