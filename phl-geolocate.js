var http = require('http');
var _ = require('underscore');

function PHLGeolocate(opts) {
  this.defaultSettings = {
    geoHost: 'http://services.phila.gov',
    locationPath: '/ULRS311/Data/Location/',
    liAddressKeyPath: '/ULRS311/Data/LIAddressKey/',
    minConfidence: 85,
    responseBody: undefined
  };

  this.settings = opts ? _.defaults(opts, this.defaultSettings) : this.defaultSettings;
}

PHLGeolocate.prototype.getCoordinates = function (address, callback) {
  var url = this.settings.geoHost + this.settings.locationPath + encodeURI(address);
  this.makeAPICall(url, callback);
};

PHLGeolocate.prototype.makeAPICall = function (url, callback) {
  var self = this;
  self.settings.responseBody = '';

  console.log('url: ', url);
  http.get(url, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      self.settings.responseBody += chunk;
    });
    res.on('end', function() {
      var result = self.parseResponse(JSON.parse(self.settings.responseBody));
      callback(result);
    });
  });
};

PHLGeolocate.prototype.getAddressKey = function (address, callback) {
  var url = this.geoHost + this.liAddressKeyPath + encodeURI(address);
  this.makeAPICall(url, callback);
};

PHLGeolocate.prototype.parseResponse = function (result) {
	var self = this;
	var locations = [];
	var locLength = result.Locations.length;
	var i;

	for (i=0; i<locLength; i++) {
		var location = result.Locations[i];

		if (location.Address.Similarity >= self.settings.minConfidence) {
			var geometry = {
        address: location.Address.StandardizedAddress,
        similarity: location.Address.Similarity,
        latitude: location.YCoord,
        longitude: location.XCoord
      };

			locations.push(geometry);
		}
	}

	return locations;
};

module.exports = function(opts) {
  return new PHLGeolocate(opts);
};
