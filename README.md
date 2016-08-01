# ezmesure

A wrapper around ezmesure API

The [ezMESURE api](https://github.com/Inist-CNRS/node-ezmesure.git) is used.

## Installation
```shell
npm install -g ezmesure
```

## Create your .ezmesurerc file
```shell
echo '{
  "baseUrl": "https://localhost",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NjY1MTEwMDN9.DGDp0pb1DlydJDubf4HCbYzntFsl-zOeXdTD3mlhPzM"
}' > .ezmesurerc
```
This is needed to tell the module where is the ezMESURE URL API and the token for authentication.
In this example, the token match the 'some-secret' token which comes with the basic installation of ezmesure

## Usage

### Module usage

```shell
var ezmesure = require('ezmesure');

ezmesure.indexList({baseUrl: 'http://ezmesure-preprod.couperin.org'}, (err, list) => {
  if (err && err.statusCode === 401) {
    console.error('Check your token');
    process.exit(1);
  }
  console.log(ezmesure.getEzMesureIndex(list));
});


```

### Command line usage
Getting help
```shell
ezmesure --help
Send commands to ezMESURE
  Usage: bin/ezmesure <indexList|indexInsert|indexDelete|indexBulk> [<args>]

Commandes:
  indexList    Get the list of ezMESURE indexes
  indexInsert  --index <index> --file <ezPAARSEfile.csv> insert data from
               ezPAARSEfile.csv into index
  indexDelete  --index <index> delete the index
  indexBulk    --transactionsFile <transactionFile.json> process transactions
               from transactionFile.json to ezMESURE

Options:
  --url, -u               ezMESURE URL API, like
                          https://ezmesure-preprod.couperin.org
  --token, -t             JWT token needed for authentication
  --index, -i             index concerned by the command, like univ-test
  --ezpaarseFile, -f      a csv file to insert. Have to be an ezPAARSE output.
  --transactionsFile, -t  a JSON file containing transactions to send to
                          ezMESURE

for more information, see https://github.com/Inist-CNRS/node-ezmesure

```

## Documentation

### Methods

####  ezmesure.indexList(params: Object, callback: Function) : Object
Take a params object and return an object containing the numbers of elements from each indexes 
ex : { 'univ-fcomte': 35133, 'univ-test2': 31923, 'univ-test3': 15 }

####  ezmesure.indexInsert(params: Object, callback: Function) : Object
Take a params object, params object must have index and ezpaarseFile properties. Return an object with a read property (elements read)
ex : { read: 31923 }

####  ezmesure.indexDelete(params: Object, callback: Function) : Object
Take a params object and return an object containing status of the action, params object must have index property. Return an object.
ex : { acknowledged: true }










