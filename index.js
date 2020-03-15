var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-tesla-gen3-wc", "TeslaGen3WC", TeslaGen3WCAccessory);
}

function TeslaGen3WCAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.host = config["host"];
  
  this.service = new Service.TemperatureSensor(this.name);
  
  this.service
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', this.getState.bind(this));
}

TeslaGen3WCAccessory.prototype.getState = function(callback) {
  this.log("Getting current state...");
  
  request.get({
    url: "http://" + this.host + "/api/1/vitals"
  }, function(err, response, body) {
    
    if (!err && response.statusCode == 200) {
      var json = JSON.parse(body);
      var handle_temp = json.handle_temp_c; // 
      this.log("Handle Temp: %d", handle_temp);
      callback(null, handle_temp); // success
    }
    else {
      this.log("Error getting state (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

TeslaGen3WCAccessory.prototype.getServices = function() {
  return [this.service];
}