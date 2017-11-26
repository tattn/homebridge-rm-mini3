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

  this.thermostatOn = false
  this.targetTemperature = 1
  this.temperatureDisplayUnits = Characteristic.TemperatureDisplayUnits.CELSIUS;
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

  sendTemperature: (temperature, host, data) => {

    if (temperature > 21) {

      sender(host, data.heat, () => {})
    } else {
      sender(host, data.cool, () => {})
    }
  },

  // Required
	getCurrentHeatingCoolingState: function(callback) {
		this.log("getCurrentHeatingCoolingState (always 'auto')");

    const heatingCoolingState = this.thermostatOn ? Characteristic.CurrentHeatingCoolingState.AUTO : Characteristic.CurrentHeatingCoolingState.OFF
    callback(null, heatingCoolingState); // success
	},
	getTargetHeatingCoolingState: function(callback) {
		this.log("getTargetHeatingCoolingState (always 'auto')");

    const heatingCoolingState = this.thermostatOn ? Characteristic.TargetHeatingCoolingState.AUTO : Characteristic.TargetHeatingCoolingState.OFF

		callback(null, heatingCoolingState); // success
	},
	setTargetHeatingCoolingState: function(data, value, callback) {
    if (value === undefined) return callback(); //Some stuff call this without value doing shit with the rest

    const heatingCoolingState = this.thermostatOn ? Characteristic.CurrentHeatingCoolingState.AUTO : Characteristic.CurrentHeatingCoolingState.OFF

    if (value === Characteristic.TargetHeatingCoolingState.OFF) {
      this.thermostatOn = false
  		this.log("setTargetHeatingCoolingState (turn off)");

      sender(this.host, data.off, () => {})
    } else {
      this.thermostatOn = true
  		this.log("setTargetHeatingCoolingState (turn on; 'auto')");

      this.sendTemperature(this.targetTemperature, this.host, data)
    }

    callback(null);
	},
	getCurrentTemperature: function(callback) {
		this.log("getCurrentTemperature (" + this.targetTemperature +")");

		callback(null, this.currentTemperature); // success
	},
	getTargetTemperature: function(callback) {
		this.log("getTargetTemperature (" + this.targetTemperature +")");
		callback(null, this.targetTemperature)
	},
	setTargetTemperature: function(data, value, callback) {
		this.log("setTargetTemperature (" + value +")");
    this.targetTemperature = value

    this.thermostatOn = true
    this.sendTemperature(this.targetTemperature, this.host, data)

    callback(null)
	},
	getTemperatureDisplayUnits: function(callback) {
		this.log("getTemperatureDisplayUnits:", this.temperatureDisplayUnits);
		var error = null;
		callback(error, this.temperatureDisplayUnits);
	},
	setTemperatureDisplayUnits: function(value, callback) {
		this.log("setTemperatureDisplayUnits from %s to %s", this.temperatureDisplayUnits, value);
		this.temperatureDisplayUnits = value;
		callback(null);
	},
  getName: function(name, callback) {
		this.log("getName :", name);

		callback(null, name);
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
        var switchService = new Service.Switch(data.name || this.name);
        switchService
          .getCharacteristic(Characteristic.On)
          .on('set', this.setPowerState.bind(this, data["on"], data["off"]));
        services.push(switchService);
      } else if (type == "thermostat") {
        this.log("add thermostat service");
        var thermostatService = new Service.Thermostat(data.name || this.name);

       	// Required Characteristics
        thermostatService
          .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
          .on('get', this.getCurrentHeatingCoolingState.bind(this));

        thermostatService
          .getCharacteristic(Characteristic.TargetHeatingCoolingState)
          .on('get', this.getTargetHeatingCoolingState.bind(this))
          .on('set', this.setTargetHeatingCoolingState.bind(this, data));

        thermostatService
          .getCharacteristic(Characteristic.CurrentTemperature)
          .on('get', this.getCurrentTemperature.bind(this));

        thermostatService
          .getCharacteristic(Characteristic.TargetTemperature)
          .on('get', this.getTargetTemperature.bind(this))
          .on('set', this.setTargetTemperature.bind(this, data));

        thermostatService
          .getCharacteristic(Characteristic.TemperatureDisplayUnits)
          .on('get', this.getTemperatureDisplayUnits.bind(this))
          .on('set', this.setTemperatureDisplayUnits.bind(this));

        thermostatService
          .getCharacteristic(Characteristic.Name)
          .on('get', this.getName.bind(this, data.name || this.name));
        thermostatService
          .getCharacteristic(Characteristic.CurrentTemperature)
          .setProps({
            minValue: 0,
            maxValue: 30,
            minStep: 1
          });
        thermostatService
          .getCharacteristic(Characteristic.TargetTemperature)
          .setProps({
            minValue: 0,
            maxValue: 30,
            minStep: 1
          });

        services.push(thermostatService);
      } else if (type == "channel") {
        this.log("add channel service");
        var channels = [""];
        for (var i = 1; i <= 9; i++) {
          channels.push(data[i + ""]);
        }
        var channelService = new HomeKitTVTypes.ChannelService(data.name || this.name);
        channelService
          .getCharacteristic(HomeKitTVTypes.ChannelState)
          .on('set', this.setChannel.bind(this, channels));
        services.push(channelService);
      }
    }

    return services;
  }
};
