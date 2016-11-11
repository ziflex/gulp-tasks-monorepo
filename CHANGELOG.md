## 0.2.0

### Changed

* In order to force dependencies to run in parallel it needs to pu them in nested array.
``
  ['seq1', ['par1', 'par2'], 'seq2']
``

## 0.1.4

### Fixed

* Tasks with dependencies got in infinite loop.

## 0.1.2

### Fixed

* Module was not exported as commonjs module.

## 0.1.1

### Fixed

* ``package`` param is not passed
