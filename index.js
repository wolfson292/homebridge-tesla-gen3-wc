var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  
  homebridge.registerAccessory("homebridge-tesla-gen3-wc", "TeslaGen3WC", TeslaGen3WCAccessory);
}

// {
//   "contactor_closed": false,
//   "vehicle_connected": true,
//   "session_s": 0,
//   "grid_v": 238,
//   "grid_hz": 59.884,
//   "vehicle_current_a": 0,
//   "pcba_temp_c": 30.3,
//   "handle_temp_c": 27.2,
//   "mcu_temp_c": 31.4,
//   "uptime_s": 6769,
//   "input_thermopile_uv": -154,
//   "prox_v": 0,
//   "pilot_high_v": 8.7,
//   "pilot_low_v": -11.7,
//   "session_energy_wh": 0,
//   "config_status": 5,
//   "current_alerts": []
// }

function TeslaGen3WCAccessory(log, config) {
  this.log = log;
  this.name = config["name"];
  this.host = config["host"];
  
  this.handleTempService = new Service.TemperatureSensor(this.name + " Handle Temp", "handle_temp");
  
  this.handleTempService
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', this.getHandleTemp.bind(this));

    this.pcbTempService = new Service.TemperatureSensor(this.name + " Handle Temp", "pcb_temp");
    
  
    this.pcbTempService
      .getCharacteristic(Characteristic.CurrentTemperature)
      .on('get', this.getPcbTemp.bind(this));  


}

TeslaGen3WCAccessory.prototype.getHandleTemp = function(callback) {
  this.log("Getting current state...");
  
  request.get({
    url: "http://" + this.host + "/api/1/vitals"
  }, function(err, response, body) {
    
    if (!err && response.statusCode == 200) {
      var json = JSON.parse(body);
      var pcb_temp = json.pcba_temp_c; // 
      this.log("PCB Temp: %d", pcb_temp);
      callback(null, pcb_temp); // success
    }
    else {
      this.log("Error getting state (status code %s): %s", response.statusCode, err);
      callback(err);
    }
  }.bind(this));
}

TeslaGen3WCAccessory.prototype.getPcbTemp = function(callback) {
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
  return [this.handleTempService, this.pcbTempService];
}