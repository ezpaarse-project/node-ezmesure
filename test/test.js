/*global describe, it*/
'use strict';

var path    = require('path');
var expect  = require('chai').expect;
var ezmesure = require('../index.js');

describe('ezMESURE', function () {

  it('should correctly show index list (@01)', function (done) {
    ezmesure.indexlist(function (err, list) {
       if (err && err.statusCode === 401) {
        throw new Error('Check your token');
      }
      expect(err).not.to.be.an('error');
      expect(list).to.have.property('_shards');
      done();
    });
  });
});
