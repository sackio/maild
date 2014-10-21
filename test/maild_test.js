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
  }
};

exports['mailchimp'] = {
  setUp: function(done) {
    return done();
  },
  'tests': function(test) {
    var gb = {};

    gb.emails = Belt.sequence(function(e){
      return O.from_email.replace(/@/, '-' + Belt.uuid() + '@');
    }, 30);

    return Async.waterfall([
      function(cb){
        return Maild.marketing.subscribe_email(gb.emails[0], O.mailchimp.list_id, Belt.cw(cb, 0));
      }
    , function(cb){
        return Maild.marketing.get_list_members(O.mailchimp.list_id, Belt.cs(cb, gb, 'list', 1, 0));
      }
    , function(cb){
        test.ok(gb.list[0]['Email Address'] === gb.emails[0]);
        return cb();
      }
    , function(cb){
        return Maild.marketing.unsubscribe_email(gb.emails[0], O.mailchimp.list_id, Belt.cw(cb, 0));
      }
    , function(cb){
        return Maild.marketing.get_list_members(O.mailchimp.list_id, Belt.cs(cb, gb, 'list', 1, 0));
      }
    , function(cb){
        test.ok(!_.any(gb.list));
        return cb();
      }
    , function(cb){
        gb.emails.shift();
        return Maild.marketing.batch_subscribe_emails(gb.emails, O.mailchimp.list_id, Belt.cw(cb, 0));
      }
    , function(cb){
        return Maild.marketing.get_list_members(O.mailchimp.list_id, Belt.cs(cb, gb, 'list', 1, 0));
      }
    , function(cb){
        test.ok(gb.list.length === gb.emails.length);
        test.ok(_.every(gb.emails, function(e){
          return _.some(gb.list, function(l){
            return l['Email Address'] === e;
          });
        }));
        return cb();
      }
    , function(cb){
        return Maild.marketing.batch_unsubscribe_emails(gb.emails, O.mailchimp.list_id, Belt.cw(cb, 0));
      }
    , function(cb){
        return Maild.marketing.get_list_members(O.mailchimp.list_id, Belt.cs(cb, gb, 'list', 1, 0));
      }
    , function(cb){
        test.ok(!_.any(gb.list));
        return cb();
      }
    , function(cb){
        Maild.marketing.settings.api_key = O.export_mailchimp.api_key;
        Maild.marketing.settings.base_export_url = O.export_mailchimp.base_export_url;
        Maild.marketing.settings.base_url = O.export_mailchimp.base_url;
        return Maild.marketing.get_campaigns(Belt.dcs(cb, gb, 'campaigns', 1, 'data', 0));
      }
    , function(cb){
        test.ok(_.any(gb.campaigns));
        gb.campaign_id = _.find(gb.campaigns, function(c){ return Belt._get(c, 'emails_sent') > 0; }).id;
        test.ok(gb.campaign_id);
        return Maild.marketing.get_campaign_stats(gb.campaign_id, Belt.cs(cb, gb, 'campaign', 1, 0));
      }
    , function(cb){
        test.ok(_.any(gb.campaign));
        return cb();
      }
    ], function(err){
      if (err) console.error(err);
      test.ok(!err);
      return test.done();
    });
  }
};
