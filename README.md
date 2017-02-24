# node-ezmesure

A NodeJS wrapper around ezmesure API

The [ezMESURE api](https://github.com/Inist-CNRS/node-ezmesure.git) is used.

## Installation
```shell
npm install -g ezmesure
```

## Usage

### Module usage

```shell
const ezmesure = require('ezmesure');

ezmesure.indices.list().then(indiceList => {
  console.log(indiceList);
}).catch(err => {
  console.error(err);
});
```

### Command line usage
To use ezmesure on the command line:
```shell
ezmesure --help
```

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
Insert a file (given either a path or a readable stream) into an indice.
Returns an object with the following properties:
  - `inserted`: number of documents successfuly inserted.
  - `failed`: number of documents that failed to be inserted.
  - `errors`: an array containing the 10 first errors generated during the insertion.

####  indices.delete({String} indice[, {Object} options]) : Promise
Delete an indice.
Returns an object with the following property:
  - `acknowledged`: boolean, will be `true` in case of success, `false` otherwise.

## Options
  - {String} `baseurl`: URL to the API endpoint (ex: https://ezmesure.couperin.org/api)
  - {String} `token`: JWT auth token
  - {Boolean} `strictSSL`: enable or disable SSL cert verification
  - {Object} `headers`: custom headers to send along with the request
