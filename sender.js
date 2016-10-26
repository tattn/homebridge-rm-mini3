
module.exports = function (host, payload, callback) {
  var PORT = 80;

  var broadcast = '000000000000000009000000e00729070b00170a00000000c0a80a0555c100008ec20000000006000000000000000000'

  var message = new Buffer(payload, 'hex');

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

