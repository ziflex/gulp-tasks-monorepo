/* eslint-disable no-unused-expressions, import/no-extraneous-dependencies */
import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import path from 'path';
import Logger from '../../mock/logger';
import Gulp from '../../mock/gulp';
import PackageManager from '../../../src/packages/manager';
import TaskManager from '../../../src/tasks/manager';

describe('Tasks. Manager', () => {
    let packageManager = null;
    let taskManager = null;
    let gulp = null;

    beforeEach(() => {
        packageManager = PackageManager(Logger(), {
            location: path.resolve(__dirname, '../../fixtures/packages'),
            pattern: 'package.js'
        });

        gulp = Gulp();

        taskManager = TaskManager(Logger(), packageManager, {
            gulp
        });
    });

    describe('#constructor', () => {
        it('should throw an error when arguments are invalid', () => {
            expect(() => {
                TaskManager();
            }).to.throw(Error);

            expect(() => {
                TaskManager(Logger());
            }).to.throw(Error);
        });
    });

    describe('.add', () => {
        it('should add task and run it against all packages', (done) => {
            const handler = sinon.spy();
            taskManager.add('test', handler);

            const task = _.first(gulp.getTasks());

            task.func((err) => {
                if (err) {
                    return done(err);
                }

                expect(handler.callCount).to.equal(3);
                return done();
            });
        });

        it('should add task and run it against given package', (done) => {
            taskManager = TaskManager(Logger(), packageManager, {
                gulp,
                package: 'package2'
            });

            const handler = sinon.spy();
            taskManager.add('test', handler);

            const task = _.first(gulp.getTasks());

            task.func((err) => {
                if (err) {
                    return done(err);
                }

                expect(handler.callCount).to.equal(1);
                expect(handler.args[0][0].name()).to.eql('package2');
                return done();
            });
        });

        it('should add task and run it against given coma-separated packages', (done) => {
            taskManager = TaskManager(Logger(), packageManager, {
                gulp,
                package: 'package2,package3'
            });

            const handler = sinon.spy();
            taskManager.add('test', handler);

            const task = _.first(gulp.getTasks());

            task.func((err) => {
                if (err) {
                    return done(err);
                }

                expect(handler.callCount).to.equal(2);
                expect(handler.args[0][0].name()).to.eql('package2');
                expect(handler.args[1][0].name()).to.eql('package3');
                return done();
            });
        });
    });
});
