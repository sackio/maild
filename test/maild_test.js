'use strict';

var Belt = require('jsbelt')
  , Optionall = require('optionall')
  , Path = require('path')
  , O = new Optionall({'__dirname': Path.resolve(module.filename + '/../..')})
  , Async = require('async')
  , _ = require('underscore')
  , Maild = new require('../lib/maild.js')(O)
;

exports['email_io'] = {
  setUp: function(done) {
    return done();
  },
  'tests': function(test) {
    var gb = {};

    return Async.waterfall([
      function(cb){
        gb.email = {
          'from': O.from_email
        , 'to': O.to_email
        , 'subject': Belt.uuid()
        , 'html': Belt.uuid()
        , 'text': Belt.uuid()
        };

        Maild.incoming.on('email', function(email){
          test.ok(email.subject === gb.email.subject);
          test.ok(email.html === gb.email.html);
          test.ok(email.text === gb.email.text);
          test.ok(Belt._get(email, 'to.0.address') === gb.email.to);
          test.ok(Belt._get(email, 'from.0.address') === gb.email.from);
          return cb();
        });
        return Maild.outgoing.send_email(gb.email, function(err){
          test.ok(!err);
          return;
        });
      }
    ], function(err){
      if (err) console.error(err);
      test.ok(!err);
      return test.done();
    });
  },
};
