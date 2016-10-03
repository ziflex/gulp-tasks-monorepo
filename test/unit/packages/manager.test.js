/* eslint-disable no-unused-expressions, import/no-extraneous-dependencies */
import { expect } from 'chai';
import path from 'path';
import Manager from '../../../src/packages/manager';

describe('Packages. Manager', () => {
    describe('#constructor', () => {
        it('should throw an error when arguments are invalid', () => {
            expect(() => {
                Manager();
            }).to.throw(Error);

            expect(() => {
                Manager(console);
            }).to.throw(Error);

            expect(() => {
                Manager(console, {});
            }).to.throw(Error);

            expect(() => {
                Manager(console, {
                    location: __dirname
                });
            }).to.throw(Error);

            expect(() => {
                Manager(console, {
                    pattern: 'package.js'
                });
            }).to.throw(Error);

            expect(() => {
                Manager(null, {
                    location: __dirname,
                    pattern: 'package.js'
                });
            }).to.throw(Error);
        });
    });

    let defaultInstance = null;

    beforeEach(() => {
        defaultInstance = Manager(console, {
            location: path.resolve(__dirname, '../../fixtures/packages'),
            pattern: 'package.js'
        });
    });

    describe('.get', () => {
        context('When package exists', () => {
            it('should return metadata', (done) => {
                const location = path.resolve(__dirname, '../../fixtures/packages/package1/');
                const pattern = 'package.js';

                defaultInstance
                    .get(location)
                    .then((meta) => {
                        expect(meta).to.exist;
                        expect(meta.name(), 'name').to.equal('package1');
                        expect(meta.location(), 'location').to.equal(path.join(location, pattern));
                        expect(meta.options('test')).to.be.true;

                        done();
                    }).catch(done);
            });

            context('When custom pattern is used', () => {
                it('should return metadata', (done) => {
                    const location = path.resolve(__dirname, '../../fixtures/packages/package1/');
                    const pattern = 'custom-pattern.js';
                    const instance = Manager(console, {
                        location: path.resolve(__dirname, '../../fixtures/packages'),
                        pattern
                    });
                    instance
                        .get(location)
                        .then((meta) => {
                            expect(meta).to.exist;
                            expect(meta.name(), 'name').to.equal('package1');
                            expect(meta.location(), 'location').to.equal(path.join(location, pattern));
                            expect(meta.options('test.custom')).to.be.true;

                            done();
                        }).catch(done);
                });

                context('When initializer is not exported', () => {
                    it('should reject promise', (done) => {
                        const location = path.resolve(__dirname, '../../fixtures/packages/package1/');
                        const pattern = 'empty.js';
                        const instance = Manager(console, {
                            location: path.resolve(__dirname, '../../fixtures/packages'),
                            pattern
                        });
                        instance
                            .get(location)
                            .then(() => {
                                done(new Error('Expected to reject promise'));
                            }).catch((reason) => {
                                expect(reason.code).to.eql('INITIALIZER_NOT_FOUND');
                                done();
                            });
                    });
                });

                context('When initializer is async', () => {
                    it('should wait until it calls calback', (done) => {
                        const location = path.resolve(__dirname, '../../fixtures/packages/package1/');
                        const pattern = 'async.js';
                        const instance = Manager(console, {
                            location: path.resolve(__dirname, '../../fixtures/packages'),
                            pattern
                        });
                        instance
                            .get(location)
                            .then((meta) => {
                                expect(meta).to.exist;
                                expect(meta.name(), 'name').to.equal('package1');
                                expect(meta.location(), 'location').to.equal(path.join(location, pattern));
                                expect(meta.options('test.async')).to.be.true;

                                done();
                            }).catch(done);
                    });
                });
            });
        });

        context('When package does not exist', () => {
            it('should reject promise', (done) => {
                const location = path.resolve(__dirname, '../../fixtures/packages/packageN/');
                defaultInstance
                    .get(location)
                    .then(() => {
                        done(new Error('Expected to reject promise'));
                    }).catch((reason) => {
                        expect(reason.code).to.eql('MODULE_NOT_FOUND');
                        done();
                    });
            });
        });
    });

    describe('.find', () => {
        context('When criteria is empty', () => {
            it('should return all packages', (done) => {
                defaultInstance.find().then((packages) => {
                    expect(packages.length).to.eql(3);
                    done();
                }).catch(done);
            });
        });

        context('When criteria is an array', () => {
            it('should return all packages', (done) => {
                defaultInstance.find([
                    'package1',
                    'package2'
                ]).then((packages) => {
                    expect(packages.length).to.eql(2);

                    expect(packages[0].name()).to.eql('package1');
                    expect(packages[1].name()).to.eql('package2');
                    done();
                }).catch(done);
            });
        });

        context('When criteria is a function', () => {
            it('should return all packages', (done) => {
                defaultInstance.find((currentPath) => {
                    return path.basename(currentPath) === 'package3';
                }).then((packages) => {
                    expect(packages.length).to.eql(1);
                    expect(packages[0].name()).to.eql('package3');
                    done();
                }).catch(done);
            });
        });
    });
});
