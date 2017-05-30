global.Promise = require('bluebird');

require('./spec');
require('./virgil-crypto');
require('./compatibility/sdk-compatibility.test');
require('./identity');
require('./virgil-cards');
require('./encrypted-communication');
