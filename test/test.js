/*global describe, it*/
'use strict';

const path    = require('path');
const expect  = require('chai').expect;
const ezmesure = require('../index.js');
const baseUrl = 'https://localhost';
const someSecretToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NjY1MTEwMDN9.DGDp0pb1DlydJDubf4HCbYzntFsl-zOeXdTD3mlhPzM';
const testFile = path.join(__dirname, '/test-sample.csv');

ezmesure.authentication(someSecretToken);

describe('ezMESURE', () => {

  it('should correctly show index list (@01)', done => {
    ezmesure.indexlist({baseUrl: baseUrl}, (err, list) => {
      if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(err).not.to.be.an('error');
      expect(list).to.have.property('indices');
      done();
    });
  });
  it('should correctly create index univ-test (@02)', done => {
    ezmesure.indexinsert({baseUrl: baseUrl, index: 'univ-test', file: testFile}, (err, rep) => {
      if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(rep).not.to.be.an('error');
      expect(rep).to.have.property('read', 5);
      done();
    });
  });
  it('should correctly delete index univ-test (@03)', done => {
    ezmesure.indexdelete({baseUrl: baseUrl, index: 'univ-test'}, (err, rep) => {
      if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(err).not.to.be.an('error');
      expect(rep).to.have.property('acknowledged', true);
      done();
    });
  });
});
