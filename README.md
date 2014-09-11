# maild

Stuff for working with email - incoming, outgoing, APIs, etc.

## Getting Started
Install the module with: `npm install maild`

```javascript
var maild = require('maild');
```
## Documentation

Initial release of a general toolkit for dealing with email in [Node.js](http://nodejs.org). For now it includes:

* `incoming` - listen for incoming messages on an `IMAP` server, emitting events when mail is received, including parsed email messages
* `outgoing` - basic interface for sending outgoing email using `SES` as transport and `EJS` for templating email messages
* `marketing` - simple API for email marketing, uses Mailchimp for now, but will be expanded as needed for other providers

## License
Copyright (c) 2014 Ben Sack
Licensed under the MIT license.
