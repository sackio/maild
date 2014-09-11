/*
 * maild
 * https://github.com/sackio/maild
 *
 * Copyright (c) 2014 Ben Sack
 * Licensed under the MIT license.
 */

'use strict';

var Belt = require('jsbelt')
  , _ = require('underscore')
  , Marketing = require('./marketing.js')
  , Outgoing = require('./outgoing.js')
  , Incoming = require('./incoming.js')
;

module.exports = function(O){

  var M = {};
  M.settings = Belt.extend({

  }, O);

  M['marketing'] = new Marketing(_.extend({}, M.settings.mailchimp, M.settings));
  M['outgoing'] = new Outgoing(_.extend({}, M.settings.aws, M.settings));
  M['incoming'] = Incoming; //new Incoming(_.extend({}, M.settings.imap, M.settings));

  return M;

};
