/*global describe, it*/
'use strict';

const path    = require('path');
const expect  = require('chai').expect;
const ezmesure = require('../index.js');
const testFile = __dirname + "/test-sample.csv";

describe('ezMESURE', function () {

  it('should correctly show index list (@01)', function (done) {
    ezmesure.indexlist(function (err, list) {
       if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(err).not.to.be.an('error');
      expect(list).to.have.property('indices');
      done();
    });
  });
  it('should correctly create index univ-test (@02)', function (done) {
    ezmesure.indexinsert({index: "univ-test", file: testFile}, function (err, rep) {
       if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(rep).not.to.be.an('error');
      expect(rep).to.have.property('read', 5);
      done();
    });
  });
  it('should correctly delete index univ-test (@03)', function (done) {
    ezmesure.indexdelete({index: "univ-test"}, function (err, rep) {
       if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(err).not.to.be.an('error');
      expect(rep).to.have.property('acknowledged', true);
      done();
    });
  });
});
