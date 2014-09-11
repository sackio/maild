/*
  Methods for sending outgoing email
*/

var Belt = require('jsbelt')
  , Async = require('async')
  , Request = require('request')
  , _ = require('underscore')
  , Nodemailer = require('nodemailer')
  ;

(function(){
  var Outgoing = function(O){
    var M = {};

    //SETTINGS

    M.settings = Belt.extend({
      'aws_key': false
    , 'aws_secret': false
    , 'transport': 'ses'
    }, O);

    if (M.settings.transport === 'ses'){
      M._transport = Nodemailer.createTransport("SES", {
                       'AWSAccessKeyID': M.settings.aws_key
                     , 'AWSSecretKey': M.settings.aws_secret
                     });
    }

    /*
      Send email - use EJS for generating subject and body
    */
    M['send_email'] = function(options, callback){
      var a = Belt.argulint(arguments);

      a.o = _.defaults(a.o, {
        'from': false
      , 'to': _.isArray(a.o.to) ? a.to.join(', ') : false
      , 'subject': _.template(a.o.subject)(a.o)
      , 'html': _.template(a.o.html)(a.o)
      , 'text': _.template(a.o.text)(a.o)
      });

      return M._transport.sendMail(a.o, a.cb);
    };

    return M;
  };

  return module.exports = Outgoing; 

}).call(this);
