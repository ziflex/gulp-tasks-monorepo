/* eslint-disable no-unused-expressions, import/no-extraneous-dependencies */
import { expect } from 'chai';
import Package from '../../../src/packages/package';

describe('Packages. Package', () => {
    describe('#constructor', () => {
        it('should throw an error when arguments are invalid', () => {
            expect(() => {
                Package();
            }).to.throw(Error);

            expect(() => {
                Package({});
            }).to.throw(Error);

            expect(() => {
                Package({
                    name: 'foo-bar'
                });
            }).to.throw(Error);

            expect(() => {
                Package({
                    location: __dirname
                });
            }).to.throw(Error);
        });
    });

    describe('.name', () => {
        it('should return package name', () => {
            const pkg = Package({
                name: 'foobar',
                location: __dirname
            });

            expect(pkg.name()).to.eql('foobar');
        });
    });

    describe('.location', () => {
        it('should return package location', () => {
            const pkg = Package({
                name: 'foobar',
                location: __dirname
            });

            expect(pkg.location()).to.eql(__dirname);
        });
    });

    describe('.options', () => {
        it('should read and write values', () => {
            const pkg = Package({
                name: 'foobar',
                location: __dirname
            });

            pkg.options('build.scripts', false);

            expect(pkg.options('build.scripts')).to.be.false;
        });
    });
});
