/* global describe, it, before */
const path       = require('path');
const { expect } = require('chai');
const ezmesure   = require('../index.js');
const config     = require('../lib/config');

const invalidTestFile = path.join(__dirname, '/test-sample-invalid.csv');
const testFile        = path.join(__dirname, '/test-sample.csv');
const testFileGZ      = path.join(__dirname, '/test-sample-compressed.csv.gz');

describe('ezMESURE', () => {
  before(() => config.loadEnv());

  it('should correctly get index list (@01)', async () => {
    const list = await ezmesure.indices.list({ strictSSL: false });
    expect(list).to.be.an('array');
  });

  it('should correctly create index univ-test (@02)', async () => {
    const rep = await ezmesure.indices.insert(testFile, 'univ-test', { store: false, strictSSL: false });
    expect(rep).to.have.property('inserted', 5);
  });

  it('should fire an error if the input file is invalid (@03)', async () => {
    try {
      await ezmesure.indices.insert(invalidTestFile, 'univ-test', { store: false, strictSSL: false });
    } catch (e) {
      expect(e).to.have.property('status', 400);
      return null;
    }
    return Promise.reject(new Error('the request should fail'));
  });

  it('should correctly create index univ-test from gz file(@04)', async () => {
    const rep = await ezmesure.indices.insert(testFileGZ, 'univ-test', { store: false, strictSSL: false });
    expect(rep).to.have.property('inserted', 5);
  });

  it('should correctly delete index univ-test (@05)', async () => {
    const rep = await ezmesure.indices.delete('univ-test', { strictSSL: false });
    expect(rep).to.have.property('acknowledged', true);
  });
});
