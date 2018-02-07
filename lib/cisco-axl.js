'use strict';

var _ = require('lodash');
var host='', user='', pass='', version ='';


var AXL = function (options) {
  // console.log(options);
  host = options.host;
  user = options.user;
  pass = options.pass;
  version = options.version;
};

AXL.prototype.listOptions = function ()
{
  return host;
}
AXL.prototype.listLdapDirectory = function () {
  return uuid;
}

module.exports = AXL;