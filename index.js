var Service, Characteristic;
var http = require("http");

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory("homebridge-rm-mini3", "RM Mini3", IRKitAccessory);
}


function IRKitAccessory(log, config) {
	this.log = log;

	// url info
	this.host = config["host"];
	this.name = config["name"];
}

IRKitAccessory.prototype = {

	setPowerState: function (powerOn, callback) {

		if (powerOn) {
      var sender = require('./sender');
      sender(this.host, 'on', function (err) {
        callback();
        // callback('error');
      });
		} else {
      var sender = require('./sender');
      sender(this.host, 'off', function (err) {
        callback();
        // callback('error');
      });
		}
	},

	identify: function (callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function () {

		// you can OPTIONALLY create an information service if you wish to override
		// the default values for things like serial number, model, etc.
		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Broadlink Manufacturer")
			.setCharacteristic(Characteristic.Model, "Broadlink Model")
			.setCharacteristic(Characteristic.SerialNumber, "Broadlink Serial Number");

		var switchService = new Service.Switch(this.name);

		switchService
			.getCharacteristic(Characteristic.On)
			.on('set', this.setPowerState.bind(this));

		return [switchService];
	}
};
