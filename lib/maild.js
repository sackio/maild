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

  if (!M.settings.no_marketing) M['marketing'] = new Marketing(_.extend({}, M.settings, M.settings.mailchimp));
  if (!M.settings.no_outgoing) M['outgoing'] = new Outgoing(_.extend({}, M.settings, M.settings.aws));
  if (!M.settings.no_incoming) M['incoming'] = new Incoming(_.extend({}, M.settings, M.settings.imap));

  return M;

};
