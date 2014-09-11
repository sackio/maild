'use strict';

var Belt = require('jsbelt')
  , Optionall = require('optionall')
  , Path = require('path')
  , O = new Optionall({'__dirname': Path.normalize(require.main.filename + '/../..')})
  , Async = require('async')
  , _ = require('underscore')
  , Maild = new require('../lib/maild.js')(O)
  , Mailchimp = Maild.marketing
;

var globals = {};

Async.waterfall([
  function(cb){
    return Mailchimp.get_list_members(O.mailchimp.list_id, Belt.cs(cb, globals, 'members', 1, 0));
  }
, function(cb){
    globals.markets = _.groupBy(globals.members, function(m){ return Belt._call(m, 'NOTES.replace', /^.*\] market:/, ''); });
    _.each(globals.markets, function(v, k){
      return globals.markets[k] = _.pluck(v, 'Email Address');
    });
    return cb();
  }
, function(cb){
    return Mailchimp.batch_subscribe_emails(globals.markets['New York'], O.mailchimp.new_york_list_id, Belt.cw(cb, 0));
  }
, function(cb){
    return Mailchimp.batch_subscribe_emails(globals.markets['Boston'], O.mailchimp.boston_list_id, Belt.cw(cb, 0));
  }
, function(cb){
    return Mailchimp.batch_subscribe_emails(globals.markets['Chicago'], O.mailchimp.chicago_list_id, Belt.cw(cb, 0));
  }
, function(cb){
    return Mailchimp.batch_subscribe_emails(globals.markets['San Francisco'], O.mailchimp.san_francisco_list_id, Belt.cw(cb, 0));
  }
, function(cb){
    return Mailchimp.batch_subscribe_emails(globals.markets['Washington, DC'], O.mailchimp.washington_list_id, Belt.cw(cb, 0));
  }
, function(cb){
    return Mailchimp.batch_subscribe_emails(globals.markets['undefined'], O.mailchimp.no_market_list_id, Belt.cw(cb, 0));
  }
], function(err){
  if (err) console.error(err);
  return process.exit(err ? 1 : 0);
});
