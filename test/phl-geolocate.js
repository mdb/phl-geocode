var nock = require('nock');
var expect = require('expect.js');
var geolocatePath = '../phl-geolocate';

describe("PHLGeolocate", function() {
  var phlGeolocate;

  describe("#settings", function () {

    it("exists as a public object on a PHLGeolocate instance", function () {
      phlGeolocate = require(geolocatePath)();
      expect(typeof phlGeolocate.settings).to.eql('object');
    });
    
    it("is set to the value of the prototype's defaultSettings if no settings have been passed", function () {
      phlGeolocate = require(geolocatePath)();
      expect(phlGeolocate.settings.geoHost).to.eql("http://services.phila.gov");
      expect(phlGeolocate.settings.locationPath).to.eql("/ULRS311/Data/Location/");
      expect(phlGeolocate.settings.liAddressKeyPath).to.eql("/ULRS311/Data/LIAddressKey/");
      expect(phlGeolocate.settings.minConfidence).to.eql(85);
    });

    it("is set to the value of the options it's passed if it's instantiated with an options object", function () {
      phlGeolocate = require(geolocatePath)({
        geoHost: 'fakeHost',
        locationPath: 'fakePath',
        liAddressKeyPath: 'fakeAddressPath',
        minConfidence: 100 
      });

      expect(phlGeolocate.settings.geoHost).to.eql("fakeHost");
      expect(phlGeolocate.settings.locationPath).to.eql("fakePath");
      expect(phlGeolocate.settings.liAddressKeyPath).to.eql("fakeAddressPath");
      expect(phlGeolocate.settings.minConfidence).to.eql(100);
    });
  });

  describe("#getCoordinates", function () {
    it("exists a public method on a PHLGeolocate instance", function (done) {
      phlGeolocate = require(geolocatePath)();
      expect(typeof phlGeolocate.getCoordinates).to.eql("function");
      done();
    });
  });

  describe("#makeAPICall", function () {
    it("exists a public method on a PHLGeolocate instance", function (done) {
      phlGeolocate = require(geolocatePath)();
      expect(typeof phlGeolocate.makeAPICall).to.eql("function");
      done();
    });

    // WIP
    xit("makes an API call to the proper URL endpoint", function (done) {
      nock('http://www.someURL.com')
        .get('/some/path')
        .reply(200, {'some_key':'some_value'});
      
      phlGeolocate.makeAPICall('http://www.someURL.com/some/path', function(r) {
        expect(r).to.eql({'some_key':'some_value'});
        done();
      });
    });
  });
});
