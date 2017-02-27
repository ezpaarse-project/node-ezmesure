# node-ezmesure

A NodeJS wrapper around ezmesure API

The [ezMESURE api](https://github.com/Inist-CNRS/node-ezmesure.git) is used.

## Installation
```shell
npm install -g ezmesure
```

## Usage

### Module

```shell
const ezmesure = require('ezmesure');

ezmesure.indices.list().then(indiceList => {
  console.log(indiceList);
}).catch(err => {
  console.error(err);
});
```

### Command line
The module provides an `ezmesure` command. Use `--help` to get mor details about the way it works:
```shell
ezmesure --help
```
When using node-ezmesure on the command line, any `.ezmesurerc` file located in the current directory or any of its parents will be used as default

## API

### Methods

####  indices.list([{Object} options]) : Promise
Returns an array of all indices with their name and the number of documents.

Example of result:
```js
[
  { name: 'univ-fcomte', docs: 35133 },
  { name: 'univ-test2', docs: 31923 },
  { name: 'univ-test3', docs: 15 }
]
```

####  indices.insert({String|Stream} file, {String} indice[, {Object} options]) : Promise
Inserts a file (given either a path or a readable stream) into an indice.
Returns an object with the following properties:
  - `inserted`: number of documents successfuly inserted.
  - `failed`: number of documents that failed to be inserted.
  - `errors`: an array containing the 10 first errors generated during the insertion.

####  indices.delete({String} indice[, {Object} options]) : Promise
Deletes an indice.
Returns an object with the following property:
  - `acknowledged`: boolean, will be `true` in case of success, `false` otherwise.

#### config.find([{String} startPath]) : Promise
Looks for a `.ezmesurerc` file in the given directory (defaulting to the working directory) and all its parents.
Returns the path of the config file, or `null` if not found.

#### config.load({String|Object} config) : Promise
Loads a default config, using either an object or a path to a config file.


## Options
  - {String} `baseurl`: URL to the API endpoint (ex: https://ezmesure.couperin.org/api)
  - {String} `token`: JWT auth token
  - {Boolean} `strictSSL`: enable or disable SSL cert verification
  - {Object} `headers`: custom headers to send along with the request
