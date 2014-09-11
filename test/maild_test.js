'use strict';

var Belt = require('jsbelt')
  , Optionall = require('optionall')
  , O = new Optionall()
  , Async = require('async')
  , _ = require('underscore')
  , Mailedit = new require('../lib/maild.js')(O)
  , Marketing = Mailedit.marketing
;

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['mailchimp'] = {
  setUp: function(done) {
    return done();
  },
  'mailchimp': function(test) {
    test.ok(true);
    return test.done();
  },
};
