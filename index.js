var Service, Characteristic;
var inherits = require('util').inherits;
var HomeKitTVTypes;
var HKTTGen = require('./HomeKitTVTypes');
var sender = require('./sender');


module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
  HomeKitTVTypes = HKTTGen(homebridge);
  
	homebridge.registerAccessory("homebridge-rm-mini3", "RM mini3", RMMini3Accessory);
}

function RMMini3Accessory(log, config) {
  this.log = log;

	this.host = config["host"];
	this.name = config["name"];
  this.data = config["data"];
}

RMMini3Accessory.prototype = {

	setPowerState: function (payloadPowerOn, payloadPowerOff, powerOn, callback) {

		if (powerOn) {
      sender(this.host, payloadPowerOn, function (err) {
        callback();
        // callback('error');
      });
		} else {
      sender(this.host, payloadPowerOff, function (err) {
        callback();
        // callback('error');
      });
		}
	},

	setChannel: function (payloadChannels, channel, callback) {

    this.log("ch: " + channel);
    sender(this.host, payloadChannels[channel], function (err) {
      callback();
    });
	},

	identify: function (callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function () {

    var services = [];

		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Broadlink")
			.setCharacteristic(Characteristic.Model, "RM mini3")
			.setCharacteristic(Characteristic.SerialNumber, this.data["host"]);
    services.push(informationService);


    for (var i = 0; i < this.data.length; i++) {
      var data = this.data[i];
      var type = data["type"];

      if (type == "on") {
        this.log("add switch service");
        var switchService = new Service.Switch(this.name);
        switchService
          .getCharacteristic(Characteristic.On)
          .on('set', this.setPowerState.bind(this, data["on"], data["off"]));
        services.push(switchService);
      } else if (type == "channel") {
        this.log("add channel service");
        var channels = [""];
        for (var i = 1; i <= 9; i++) {
          channels.push(data[i + ""]);
        }
        var channelService = new HomeKitTVTypes.ChannelService(this.name);
        channelService
          .getCharacteristic(HomeKitTVTypes.ChannelState)
          .on('set', this.setChannel.bind(this, channels));
        services.push(channelService);
      }
    }

		return services;
	}
};

