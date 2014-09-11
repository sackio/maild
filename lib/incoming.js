/*
  Methods for handling incoming emails with an event emitter
*/

var Belt = require('jsbelt')
  , Async = require('async')
  , _ = require('underscore')
  , Events = require('events')
  , IMAP = require('imap')
  , Mailparser = require('mailparser')
  ;

(function(){
  var Incoming = function(O){
    var M = new Events.EventEmitter(O);

    //SETTINGS

    M.settings = Belt.extend({
      'protocol': 'imap'
    , 'user': false
    , 'password': false
    , 'host': false
    , 'port': false
    , 'tls': false
    , 'tlsOptions': false
    , 'inbox': false
    }, O);

    //setup handlers for an IMAP server
    if (M.settings.protocol === 'imap'){
      M._server = new IMAP(_.pick(M.settings, ['user', 'password', 'host', 'port', 'tls', 'tlsOptions']));

      M._server.on('error', function(err){
        return M.emit('error', err);
      });

      M._server.on('end', function(err){
        return M.emit('end');
      });

      M._server.on('ready', function(){
        console.log('IMAP server listening to %s...', M.settings.user);

        var globals = {};

        return Async.waterfall([
          function(cb){
            return M._server.openBox( M.settings.inbox, Belt.cs(cb, globals, 'inbox', 1, 0));
          }
        , function(cb){
            M._server.on('mail', M.fetch_messages.bind(globals.inbox));
            return cb();
          }
        ], function(err){
          if (err) return M.emit('error', err);

          return M.emit('ready');
        });
      });

      M._server.connect();
    }

    /*
      Fetch given number of messages from _server, starting with newest, parse and emit each message as event
    */
    M['fetch_messages'] = function(count, options, callback){
      var a = Belt.argulint(arguments)
        , inbox = this;

      a.o = _.defaults(a.o, {
        'offset': 0 //offset from newest emails
      });

      var pmsg = M._server.seq.fetch((inbox.messages.total + 1 - a.o.offset - count)
               + ':' + inbox.messages.total, {'bodies': '', 'struct': true});

      return pmsg.on('message', function(msg, num){
        var parser = new Mailparser();

        msg.on('body', function(stream, info){
          return stream.on('data', parser.write);
        });

        msg.on('end', parser.end);

        return parser.on('end', function(email){
          return M.emit('mail', email, num, count);
        });
      });
    };

    return M;
  };

  return module.exports = Incoming; 

}).call(this);
