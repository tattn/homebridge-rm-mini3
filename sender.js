
module.exports = function (host,  isOn, callback) {
  var PORT = 80;

  var broadcast = '000000000000000009000000e00729070b00170a00000000c0a80a0555c100008ec20000000006000000000000000000'
  var powerOff = '5aa5aa555aa5aa55000000000000000000000000000000000000000000000000063c000037276a008d80caa0f00d43b40100000025d100008b14846e57bd0e6414c620b1c7c70c23006d18a30efe1236f9b747f15c75998588ba83d003c38435517367b6728f891335d2fbd033d86f9bf715732fe7e501cfcec09dd35d69007b4d23023b83925b4c72dbded928633fa79e8a7798c7e7b19846007df2de69dd2437858dbc54b8ee701de9b49822cb8b86cb7f90d743ac6a8f039a2fc59bae5986fd1444494528c0ac42bbf5bbd4e73eb8f013458b98fef3b5b8f92f855461cecb379cf45bdb7a1d4286384f86986cb610a95e07cc7e0aae4385c7981186cac817bbfef07f098c70e40d03f6920f90d9658ff9bde96b77ef7b'
  var powerOn = '5aa5aa555aa5aa55000000000000000000000000000000000000000000000000463c000037276a00ca83caa0f00d43b40100000025d100008b14846e57bd0e6414c620b1c7c70c23006d18a30efe1236f9b747f15c75998588ba83d003c38435517367b6728f891335d2fbd033d86f9bf715732fe7e501cfcec09dd35d69007b4d23023b83925b4c72dbded928633fa79e8a7798c7e7b19846007df2de69dd2437858dbc54b8ee701de9b49822cb8b86cb7f90d743ac6a8f039a2fc59bae5986fd1444494528c0ac42bbf5bbd4e73eb8f013458b98fef3b5b8f92f855461cecb379cf45bdb7a1d4286384f86986cb610a95e07cc7e0aae4385c7981186cac817bbfef07f098c70e40d03f6920f90d9658ff9bde96b77ef7b'

  var message = new Buffer(powerOn, 'hex');
  if (isOn == false) {
    message = new Buffer(powerOff, 'hex');
  }

  var dgram = require('dgram');
  var client = dgram.createSocket('udp4');

  client.send(broadcast, 0, message.length, PORT, host, function(err, bytes) {
    if (err) throw err;
    console.log('UDP message sent to ' + host +':'+ PORT);

    client.send(message, 0, message.length, PORT, host, function(err, bytes) {
      if (err) throw err;
      console.log('UDP message sent to ' + host +':'+ PORT);
      client.close();

      callback(err);
    });

  });
}

