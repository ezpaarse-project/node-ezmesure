# node-ezmesure

A NodeJS wrapper around [ezMESURE API](https://ezmesure.couperin.org/api).

## Installation
```shell
npm install -g @ezpaarse-project/ezmesure
```

## Command line usage

The module provides an `ezmesure` command (aliased `ezm`).

### Global options

| Name | Type | Description |
| --- | --- | --- |
| -u, --base-url  | String  | API URL (ex: https://ezmesure-preprod.couperin.org/api) |
| -t, --token     | String  | The auth token to use |
| -k, --insecure  | String  | Allow connections to SSL without certs |
| -m, --timeout   | Number  | Request timeout in milliseconds |
| --version       | Boolean | Print the version number |
| --help          | Boolean | Show some help |

You can get help for any command by typing `ezmesure <command> help`.

When using node-ezmesure on the command line, any `.ezmesurerc` file located in the current directory or any of its parents will be used as default

### ezmesure indices list
List available indices

### ezmesure indices delete \<index\>
Delete \<index\>

### ezmesure indices insert \<index\> \<files..\>
Insert \<files\> into an \<index\>.

#### Options

| Name | Type | Description |
| --- | --- | --- |
| -z, --gunzip   | String  | Uncompress Gzip files locally |
| -n, --no-store | String  | Disable storing uploaded data in your online space |
| -s, --split    | String  | Split a multivalued field. Format: "fieldname(delimitor)" |

#### Examples
```bash
  # Insert CSV files from ezpaarse-results into univ-foobar
  ezmesure indices insert univ-foobar ezpaarse-results/*.csv
```

### ezmesure metrics
Get overall metrics from the API

### ezmesure events delete \<index\>
Delete consultation events from \<index\>

#### Options

| Name | Type | Description |
| --- | --- | --- |
| --from | String  | Minimum date of the events that should be removed. Can be either a date or datetime in ISO format. |
| --to   | String  | Maximum date of the events that should be removed. Can be either a date or datetime in ISO format. |

#### Examples
```bash
  # Remove consultations from univ-foobar that
  ezmesure events delete univ-foobar --from
```

### ezmesure tops \<index\>
Give top metrics for a given \<index\>

#### Options

| Name | Type | Description |
| --- | --- | --- |
| -s, --size   | Number | Size of the tops |
| -p, --period | String | Period of the tops. Possible values: today, yesterday, current_week, last_week, current_month, last_month, current_year, last_year, all (default) |

#### Examples
```bash
  # Get a top 10 for the last month
  ezmesure tops univ-foo -s 10 -p last_month
  
  # Get a top 3 for the whole index
  ezmesure tops univ-foo -s 10 -p all
```

### ezmesure depositors refresh
Refresh the depositors list

## Module

### Usage

```shell
const ezmesure = require('ezmesure');

ezmesure.indices.list().then(indiceList => {
  console.log(indiceList);
}).catch(err => {
  console.error(err);
});
```

### Global options

| Name | Type | Description |
| --- | --- | --- |
| baseurl   | String  | URL to the API endpoint (ex: https://ezmesure.couperin.org/api) |
| token     | String  | JWT auth token |
| strictSSL | Boolean | enable or disable SSL cert verification |
| headers   | Object  | custom headers to send along with the request |

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

####  indices.insert({String|Stream} file, {String} index[, {Object} options]) : Promise
Inserts a file (given either a path or a readable stream) into an indice.
Returns an object with the following properties:
  - `inserted`: number of documents successfuly inserted.
  - `updated`: number of documents successfuly updated.
  - `failed`: number of documents that failed to be inserted.
  - `errors`: an array containing the 10 first errors generated during the insertion.

####  indices.delete({String} index[, {Object} options]) : Promise
Deletes an indice.
Returns an object with the following property:
  - `acknowledged`: boolean, will be `true` in case of success, `false` otherwise.

####  indices.metrics([{Object} options]) : Promise
Returns an array of all indices with their name and the number of documents.

Example of result:
```js
{
  "took": 148,
  "docs": 344381732,
  "dateCoverage": {
    "min": 1375225410000,
    "max": 1542326387000
  },
  "metrics": {
    "days": 1935,
    "titles": 1730487,
    "platforms": 173,
    "indices": 86
  }
}
```

####  indices.tops({String} index[, {Object} options]) : Promise
Returns an array of all indices with their name and the number of documents.

#### Options

| Name | Type | Description |
| --- | --- | --- |
| size   | Number | Size of the tops |
| period | String | Period of the tops. Possible values: today, yesterday, current_week, last_week, current_month, last_month, current_year, last_year, all (default) |

Example of result:
```js
{
  "took": 847,
  "docs": 3411691,
  "dateCoverage": {
    "min": 1483225472000,
    "max": 1542322684000
  },
  "tops": {
    "titles": [
      {
        "key": "Organometallics",
        "doc_count": 45174
      }
    ],
    "publishers": [
      {
        "key": "Steinkopff",
        "doc_count": 1146437
      }
    ],
    "indices": [
      {
        "key": "univ-foobar",
        "doc_count": 3411691
      }
    ]
  }
}
```

####  events.delete({String} index[, {Object} options]) : Promise
Remove consultation events from an index.

##### Options

| Name | Type | Description |
| --- | --- | --- |
| from | String  | Minimum date of the events that should be removed. Can be either a date or datetime in ISO format. |
| to   | String  | Maximum date of the events that should be removed. Can be either a date or datetime in ISO format. |

####  depositors.refresh([{Object} options]) : Promise
Refresh the depositor list and return an array of all indices with their name and the number of documents.

Example of result:
```js
[
  { name: 'University of Foobar', prefix: 'univ-foobar', count: 35133, result: 'created' },
  { name: 'University of Barfoo', prefix: 'univ-barfoo', count: 31923, result: 'created' }
]
```

#### config.find([{String} startPath]) : Promise
Looks for a `.ezmesurerc` file in the given directory (defaulting to the working directory) and all its parents.
Returns the path of the config file, or `null` if not found.

#### config.load({String|Object} config) : Promise
Loads a default config, using either an object or a path to a config file.
