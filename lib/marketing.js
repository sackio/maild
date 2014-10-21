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

    }, O);

    var api_cb = function(cb){
      return function(err, res, body){
        var berr = Belt._get(body, 'error');
        if (berr && !err) err = berr;
        return cb(err, body);
      };
    };

    var export_api_cb = function(cb, options){
      options = options || {};

      return function(err, res, body){
        try{
          var berr = Belt._get(JSON.parse(body), 'error');
          if (berr && !err) err = berr;
        } catch (e) {}
        if (err) return cb(err);

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

        if (!options.no_headers)
          results.members = _.map(results.members, function(m){
            return _.object(results.headers, m);
          });

        return cb(null, results.members, results.headers, results.unparsed_members);
      };
    };

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
                    , 'json': true
                    }, api_cb(a.cb));
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
                    , 'json': true
                    }, api_cb(a.cb));
    };

    /*
      Get campaigns
    */
    M['get_campaigns'] = function(options, callback){
      var a = Belt.argulint(arguments);

      return Request({'method': 'POST'
                    , 'url': M.settings.base_url + '/campaigns/list.json'
                    , 'form': _.extend({
                        'apikey': M.settings.api_key
                      , 'limit': 1000
                      }, _.pick(a.o, []))
                    , 'json': true
                    }, api_cb(a.cb));
    };

    /*
      Subscribe emails to list
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
                    , 'json': true
                    }, api_cb(a.cb));
    };

    /*
      Unsubscribe emails from list
    */
    M['batch_unsubscribe_emails'] = function(emails, list_id, options, callback){
      var a = Belt.argulint(arguments);

      return Request({'method': 'POST'
                    , 'url': M.settings.base_url + '/lists/batch-unsubscribe.json'
                    , 'form': _.extend({
                        'apikey': M.settings.api_key
                      , 'id': list_id
                      , 'batch': _.map(emails, function(e){ return {'email': e}; })
                      , 'delete_member': true
                      , 'send_notify': false
                      }, _.pick(a.o, []))
                    , 'json': true
                    }, api_cb(a.cb));
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
      }, export_api_cb(a.cb));
    };

    /*
      Retrieve all stats for a campaign
    */
    M['get_campaign_stats'] = function(campaign_id, options, callback){
      var a = Belt.argulint(arguments);

      return Request({'method': 'POST'
                    , 'url': M.settings.base_export_url + '/campaignSubscriberActivity/'
                    , 'form': _.extend({
                        'apikey': M.settings.api_key
                      , 'id': campaign_id
                      , 'include_empty': true
                      }, _.pick(a.o, []))
      }, export_api_cb(a.cb, {'no_headers': true}));
    };

    return M;
  };

  return module.exports = Mailchimp; 

}).call(this);
