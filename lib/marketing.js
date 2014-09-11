/*
  Mailchimp API - http://apidocs.mailchimp.com/api/2
*/

var Belt = require('jsbelt')
  , Async = require('async')
  , Request = require('request')
  , _ = require('underscore')
  ;

(function(){
  var Mailchimp = function(O){
    var M = {};

    //SETTINGS

    M.settings = Belt.extend({
      'base_url': 'https://us8.api.mailchimp.com/2.0/'
    , 'base_export_url': 'https://us8.api.mailchimp.com/export/1.0/'
    }, O);

    /*
      Subscribe email to list
    */
    M['subscribe_email'] = function(email, list_id, options, callback){
      var a = Belt.argulint(arguments);

      if (!Belt._call(email, 'match', Belt.email_regexp))
        return a.cb(new Error('Email is invalid'));

      return Request({'method': 'POST'
                    , 'url': M.settings.base_url + '/lists/subscribe.json'
                    , 'form': _.extend({
                        'apikey': M.settings.api_key
                      , 'id': list_id
                      , 'email': {'email': email}
                      , 'double_optin': false
                      , 'update_existing': true
                      }, _.pick(a.o, ['merge_vars']))
                    }, function(err, r, body){
                      return a.cb(err);
                    });
    };

    /*
      Subscribe email to list
    */
    M['batch_subscribe_emails'] = function(emails, list_id, options, callback){
      var a = Belt.argulint(arguments);

      return Request({'method': 'POST'
                    , 'url': M.settings.base_url + '/lists/batch-subscribe.json'
                    , 'form': _.extend({
                        'apikey': M.settings.api_key
                      , 'id': list_id
                      , 'batch': _.map(emails, function(e){ return {'email': {'email': e}}; })
                      , 'double_optin': false
                      , 'update_existing': true
                      }, _.pick(a.o, []))
                    }, function(err, r, body){
                      return a.cb(err);
                    });
    };

    /*
      Unsubscribe email from list
    */
    M['unsubscribe_email'] = function(email, list_id, options, callback){
      var a = Belt.argulint(arguments);

      if (!Belt._call(email, 'match', Belt.email_regexp))
        return a.cb(new Error('Email is invalid'));

      return Request({'method': 'POST'
                    , 'url': M.settings.base_url + '/lists/unsubscribe.json'
                    , 'form': _.extend({
                        'apikey': M.settings.api_key
                      , 'id': list_id
                      , 'email': {'email': email}
                      }, _.pick(a.o, []))
                    }, function(err, r, body){
                      return a.cb(err);
                    });
    };

    /*
      Retrieve all emails from list
    */
    M['get_list_members'] = function(list_id, options, callback){
      var a = Belt.argulint(arguments);

      return Request({'method': 'POST'
                    , 'url': M.settings.base_export_url + '/list/'
                    , 'form': _.extend({
                        'apikey': M.settings.api_key
                      , 'id': list_id
                      , 'status': 'subscribed'
                      }, _.pick(a.o, []))
      }, function(err, r, body){
        if (err) return a.cb(err);

        var results = {};
        results.unparsed_members = [];

        results.members = body.split('\n');
        results.members.pop();
        results.members = _.map(results.members, function(r, i){
          var pmem = Belt.parseJSON(r);

          if (!pmem) results.unparsed_members(r);
          return pmem ? pmem : undefined;
        });
        results.headers = results.members.shift();
        results.members = _.compact(results.members);

        results.members = _.map(results.members, function(m){
          return _.object(results.headers, m);
        });

        return a.cb(null, results.members, results.headers, results.unparsed_members);
      });
    };

    return M;
  };

  return module.exports = Mailchimp; 

}).call(this);
