/*global describe, it, before*/
'use strict';

const path       = require('path');
const expect     = require('chai').expect;
const ezmesure   = require('../index.js');

const testFile   = path.join(__dirname, '/test-sample.csv');
const testFileGZ = path.join(__dirname, '/test-sample-compressed.csv.gz');

describe('ezMESURE', () => {
  before(() => {
    return ezmesure.config.load(path.resolve(__dirname, '../.ezmesurerc'));
  });

  it('should correctly get index list (@01)', () => {
    return ezmesure.indices.list().then(list => {
      expect(list).to.be.an('array');
    });
  });

  it('should correctly create index univ-test (@02)', () => {
    return ezmesure.indices.insert(testFile, 'univ-test').then(rep => {
      expect(rep).to.have.property('inserted', 5);
    });
  });

  it('should correctly create index univ-test from gz file(@03)', () => {
    return ezmesure.indices.insert(testFileGZ, 'univ-test').then(rep => {
      expect(rep).to.have.property('inserted', 5);
    });
  });

  it('should correctly delete index univ-test (@04)', () => {
    return ezmesure.indices.delete('univ-test', rep => {
      expect(rep).to.have.property('acknowledged', true);
    });
  });
});
