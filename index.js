var Service, Characteristic, ChannelCharacteristic;
var inherits = require('util').inherits;

module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
  
  makeChannelCharacteristic();

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

    var payloadPowerOn = '5aa5aa555aa5aa55000000000000000000000000000000000000000000000000063c000037276a008d80caa0f00d43b40100000025d100008b14846e57bd0e6414c620b1c7c70c23006d18a30efe1236f9b747f15c75998588ba83d003c38435517367b6728f891335d2fbd033d86f9bf715732fe7e501cfcec09dd35d69007b4d23023b83925b4c72dbded928633fa79e8a7798c7e7b19846007df2de69dd2437858dbc54b8ee701de9b49822cb8b86cb7f90d743ac6a8f039a2fc59bae5986fd1444494528c0ac42bbf5bbd4e73eb8f013458b98fef3b5b8f92f855461cecb379cf45bdb7a1d4286384f86986cb610a95e07cc7e0aae4385c7981186cac817bbfef07f098c70e40d03f6920f90d9658ff9bde96b77ef7b'
    var payloadPowerOff = '5aa5aa555aa5aa55000000000000000000000000000000000000000000000000463c000037276a00ca83caa0f00d43b40100000025d100008b14846e57bd0e6414c620b1c7c70c23006d18a30efe1236f9b747f15c75998588ba83d003c38435517367b6728f891335d2fbd033d86f9bf715732fe7e501cfcec09dd35d69007b4d23023b83925b4c72dbded928633fa79e8a7798c7e7b19846007df2de69dd2437858dbc54b8ee701de9b49822cb8b86cb7f90d743ac6a8f039a2fc59bae5986fd1444494528c0ac42bbf5bbd4e73eb8f013458b98fef3b5b8f92f855461cecb379cf45bdb7a1d4286384f86986cb610a95e07cc7e0aae4385c7981186cac817bbfef07f098c70e40d03f6920f90d9658ff9bde96b77ef7b'

		if (powerOn) {
      var sender = require('./sender');
      sender(this.host, payloadPowerOn, function (err) {
        callback();
        // callback('error');
      });
		} else {
      var sender = require('./sender');
      sender(this.host, payloadPowerOff, function (err) {
        callback();
        // callback('error');
      });
		}
	},

	setChannel: function (channel, callback) {

    var payloadChannelUp = '5aa5aa555aa5aa550000000000000000000000000000000000000000000000004e34000037276a007981caa0f00d43b401000000efcf0000ce833506439651b2c94a86141b35215ff5f6910222b48382190e6e8887de6fb252114b0c97952f13639b511d148c9979b62000bef65d0d391afc465f03a7299cf2ed2d52e32c9204c88bcd33141e68ca2293552e1b700438fd4de80106233fade626cc5e2a7e167fa8f9235bd3b056447433d3805cefb08dacf732d9e5ca3d6d65485794c50aaac989a30a5e74a6d7a49cfe6f25d25d2a48feff0a220d7b244251df65ff6753599118958eac07e6fca2e6076e36cde6eb2598aab5a738561a6fa589be07cf6322cbceb8246e82e8863a94dd92b279e22cd9a3e2d8f8d2a1d769'
    var payloadChannelDown = '5aa5aa555aa5aa55000000000000000000000000000000000000000000000000dd37000037276a000e81caa0f00d43b401000000efcf0000688f573c93b2643658a405d0e04ae2ebe7a8b4614a0654a289178fbe6868e8de23b6d8db256c8c55f224488b2e72181cc78eca609d3086456ea25381032b5db647395ab1b62054ffd2c147bfb843df2cdb40f4f747a067a7ba30ee382712534e6a821f88a640ef981db55645f19a5f918ae65a890c7054199f9d53cb5573e83c930159e7348c13f3d12357ca024226b16cd1db955c9d902294c3370ff2d2be50f781e389ce14759021e68514ff2ad4251c46f03b46c5ed147f59d34088fd95cff4d88fb5486d7e4ec68cad33467457f3f32d34eb2c181b885e69bfa44a247cfb'


		// if (isUp) {
    //   var sender = require('./sender');
    //   sender(this.host, powerOn, function (err) {
    //     callback();
    //     // callback('error');
    //   });
		// } else {
    //   var sender = require('./sender');
    //   sender(this.host, powerOff, function (err) {
    //     callback();
    //     // callback('error');
    //   });
		// }
	},

	identify: function (callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function () {

		var informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, "Broadlink Manufacturer")
			.setCharacteristic(Characteristic.Model, "Broadlink Model")
			.setCharacteristic(Characteristic.SerialNumber, "Broadlink Serial Number");

		var switchService = new Service.Switch(this.name);

		switchService
			.getCharacteristic(Characteristic.On)
			.on('set', this.setPowerState.bind(this));

    switchService
      .addCharacteristic(ChannelCharacteristic)
      .on('set', this.setChannel.bind(this));


		return [switchService, informationService];
	}
};

function makeChannelCharacteristic() {
  ChannelCharacteristic = function () {
    Characteristic.call(this, 'Channel', '212131F4-2E14-4FF4-AE13-C97C3232499D');
    this.setProps({
      format: Characteristic.Formats.INT,
      unit: Characteristic.Units.NONE,
      maxValue: 100,
      minValue: 0,
      minStep: 1,
      perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY]
    });
    this.value = this.getDefaultValue();
  };

  inherits(ChannelCharacteristic, Characteristic);
}
