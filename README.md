# gulp-tasks-monorepo

> Write once, apply for all

Tool for running gulp tasks against multiple packages


[![npm version](https://badge.fury.io/js/gulp-tasks-monorepo.svg)](https://www.npmjs.com/package/gulp-tasks-monorepo)
[![Build Status](https://secure.travis-ci.org/ziflex/gulp-tasks-monorepo.svg?branch=master)](http://travis-ci.org/ziflex/gulp-tasks-monorepo)
[![Coverage Status](https://coveralls.io/repos/github/ziflex/gulp-tasks-monorepo/badge.svg?branch=master)](https://coveralls.io/github/ziflex/gulp-tasks-monorepo)


## Motivation

Basic idea of the package is reusing gulp tasks for multiple projects that have similar build pipelines.
Package iterates over a given folder with packages and run gulp tasks against each package.
In its turn, each gulp task receives a current package metadata that contains some information about the package which can be extended via package initializers (they are covered below).    
*Note: all dependencies are bieng executed in sync mode by default. In order to run them asynchronously, array with dependencies must have ``async=true`` property*

## Usage
### Quick start

Imagine, that we have a following project structure

````sh

    packages/
        common/
            src/
            package.json
        api/
            src/
            package.json
    gulpfile.js
    package.json

````

Both packages are written in ES6 and needed to be transpiled into ES5.
Here is our task in gulp file:

````javascript

    var del = require('del');
    var path = require('path');
    var gulp = require('gulp');
    var babel = require('gulp-babel');
    var gutil = require('gulp-util');
    var MonorepoTasks = require('gulp-tasks-monorepo');

    var repo = MonorepoTasks({
        dir: path.join(__dirname, '/packages')
    });

    repo.task('clean', function clean(pkg, done) {
        gutil.log('Cleaning', pkg.name(), 'package');

        del(path.join(pkg.location(), '/dist'), done);
    });

    repo.task('build', ['clean'], function build(pkg) {
        gutil.log('Building', pkg.name(), 'package');

        return gulp
            .src(path.join(pkg.location(), '/src/**/*.js'))
            .pipe(babel())
            .pipe(gulp.dest(path.join(pkg.location(), '/dist')));
    });

````

As we can see, pretty much the same as with regular vanilla gulp, but with one exception - every task receives a package metadata with its name and location.


### Metadata

Of course, in real world, our build tasks are more complicated and we need to give some more information to these tasks in order to let them know how to handle each package more precisely .
In order to do that, we can create ``package.js`` in a root directory of each package that should export one single function which accepts a package metadata:

````javascript

    module.exports = function init(pkg) {
        pkg.options('build.scripts.minify', true);
    }

````

The package will load this module and run initializer before running any tasks.
After that, any task can get the information:

````javascript

    var gif = require('gulp-if');
    var uglify = require('gulp-uglify');

    repo.task('build', ['clean'], function build(pkg) {
        gutil.log('Building', pkg.name(), 'package');

        var minify = pkg.options('build.scripts.minify') || false;

        return gulp
            .src(path.join(pkg.location(), '/src/**/*.js'))
            .pipe(babel())
            .pipe(gif(minify, uglify()))
            .pipe(gulp.dest(path.join(pkg.location(), '/dist')));
    });

````

#### Async metadata initializer

Metadata initializer also can be async:

````javascript

    var fs = require('fs');
    var path = require('path');

    module.exports = function init(pkg, done) {
        fs.readFile(path.join(pkg.location(), 'package.json'), 'utf8', function(err, content) {
            if (err) {
                return done(err);
            }

            const info = JSON.parse(content);

            pkg.options('dependencies.production', info.dependencies);
            pkg.options('dependencies.development', info.devDependencies);

            done();
        });
    }

````

### Bonus

As a bonus, we can drastically minimize amount of code and organize it better.
We can use [``gulp-tasks-registrator``](https://github.com/ziflex/gulp-tasks-registrator) for loading external gulp tasks:

````javascript

    var gulp = require('gulp');
    var RegisterTasks = require('gulp-tasks-registrator');
    var MonorepoTasks = require('gulp-tasks-monorepo');
    var loadPlugins = require('gulp-load-plugins');

    var $ = loadPlugins({
        replaceString: /^gulp(-|\.)/,
        pattern: [
            'gulp',
            'gulp-*',
            'gulp.*',
            'del'
        ],
        rename: {
            del: 'delete'
        }
    });

    RegisterTasks({
        gulp: MonorepoTasks({
            dir: path.join(__dirname, 'packages')
        }),
        dir: path.join(__dirname, 'tasks'),
        args: [$],
        verbose: true,
        panic: true,
        group: true
    });

````

````javascript
    // tasks/clean.js

    var path = require('path');

    module.exports = function factory($) {
        return function task(pkg, done) {
            $.del(path.join(pkg.location(), '/dist'), done);
        };
    }

````

````javascript
    // tasks/build.js

    var path = require('path');

    module.exports = function factory($) {
        function task(pkg) {
            return $.gulp
                .src(path.join(pkg.location(), '/src/**/*.js'))
                .pipe($.babel())
                .pipe($.if(minify, uglify()))
                .pipe($.gulp.dest(path.join(pkg.location(), '/dist')));
        };

        task.dependencies = ['clean'];

        return task;
    }

````

## API

#### Monorepo(options)

#### options.dir
Type: `string`.  
Full path to a directory that contains packages.   

#### options.file
Type: `string`.  
File name for initialization module.    
Optional.    
Default `package.js`.

### options.package
Type: `string` | `array<string>`.    
Array of string or comma-separated string that represent a package(s) to run tasks against.      
Optional.    

#### options.gulp
Type: `object`.  
Alternative gulp instance.  
Optional.    
