/* eslint-disable no-unused-expressions, import/no-extraneous-dependencies */
import { expect } from 'chai';
import sinon from 'sinon';
import _ from 'lodash';
import Promise from 'bluebird';
import { Readable as ReadableStream } from 'stream';
import Logger from '../../mock/logger';
import Package from '../../../src/packages/package';
import TaskRunner from '../../../src/tasks/runner';

describe('Tasks. Runner', () => {
    describe('#constructor', () => {
        it('should throw an error when arguments are invalid', () => {
            expect(() => {
                TaskRunner();
            }).to.throw(Error);

            expect(() => {
                TaskRunner(Logger());
            }).to.throw(Error);

            expect(() => {
                TaskRunner(Logger(), []);
            }).to.throw(Error);

            expect(() => {
                TaskRunner(null, _.noop);
            }).to.throw(Error);
        });
    });

    it('should run task', (done) => {
        const pkg = Package({ name: 'foo', location: __dirname });
        const handler = sinon.spy();
        const next = (err) => {
            expect(err).to.not.exist;
            expect(handler.callCount).to.equal(1);
            expect(handler.calledWith(pkg)).to.be.true;
            done();
        };

        const runner = TaskRunner(Logger(), handler);

        runner(pkg, next, done);
    });

    it('should run task that accepts callback', (done) => {
        const pkg = Package({ name: 'foo', location: __dirname });
        const spy = sinon.spy();
        const handler = (p, cb) => {
            setTimeout(() => {
                spy(p, cb);
                cb();
            }, 10);
        };
        const next = (err) => {
            expect(err).to.not.exist;
            expect(spy.callCount).to.equal(1);
            done();
        };

        const runner = TaskRunner(Logger(), handler);

        runner(pkg, next, done);
    });

    it('should run task that returns promise', (done) => {
        const pkg = Package({ name: 'foo', location: __dirname });
        const spy = sinon.spy();
        const handler = (p) => {
            spy(p);

            return Promise.fromCallback(d => setTimeout(d, 10));
        };
        const next = (err) => {
            expect(err).to.not.exist;
            expect(spy.callCount).to.equal(1);
            done();
        };

        const runner = TaskRunner(Logger(), handler);

        runner(pkg, next, done);
    });

    it('should run task that returns stream', (done) => {
        const pkg = Package({ name: 'foo', location: __dirname });
        const spy = sinon.spy();
        const handler = (p) => {
            spy(p);

            const stream = ReadableStream();
            stream.push('beep ');
            stream.push('boop\n');
            stream.push(null);
            return stream;
        };
        const next = (err) => {
            expect(err).to.not.exist;
            expect(spy.callCount).to.equal(1);
            done();
        };

        const runner = TaskRunner(Logger(), handler);

        runner(pkg, next, done);
    });
});
