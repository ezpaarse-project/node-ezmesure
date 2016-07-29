/*global describe, it*/
'use strict';

const path    = require('path');
const expect  = require('chai').expect;
const ezmesure = require('../index.js');
const testFile = path.join(__dirname, '/test-sample.csv');

ezmesure.authentication(ezmesure.config.token);

describe('ezMESURE', () => {

  it('should correctly show index list (@01)', done => {
    ezmesure.indexList({baseUrl: ezmesure.config.baseUrl}, (err, list) => {
      if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(err).not.to.be.an('error');
      expect(list).to.have.property('indices');
      done();
    });
  });
  it('should correctly create index univ-test (@02)', done => {
    ezmesure.indexInsert({baseUrl: ezmesure.config.baseUrl, index: 'univ-test', file: testFile}, (err, rep) => {
      if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(rep).not.to.be.an('error');
      expect(rep).to.have.property('read', 5);
      done();
    });
  });
  it('should correctly delete index univ-test (@03)', done => {
    ezmesure.indexDelete({baseUrl: ezmesure.config.baseUrl, index: 'univ-test'}, (err, rep) => {
      if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(err).not.to.be.an('error');
      expect(rep).to.have.property('acknowledged', true);
      done();
    });
  });
});
