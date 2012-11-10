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

  describe("#callAPI", function () {
    it("exists a public method on a PHLGeolocate instance", function (done) {
      phlGeolocate = require(geolocatePath)();
      expect(typeof phlGeolocate.callAPI).to.eql("function");
      done();
    });

    // WIP
    xit("makes an API call to the proper URL endpoint", function (done) {
      nock('http://www.someURL.com')
        .get('/some/path')
        .reply(200, {'some_key':'some_value'});
      
      phlGeolocate.callAPI('http://www.someURL.com/some/path', function(r) {
        expect(r).to.eql({'some_key':'some_value'});
        done();
      });
    });
  });

  describe("#parseResponse", function () {
    var phlGeolocate;
    var fakeResp;

    beforeEach(function (done) {
      phlGeolocate = require(geolocatePath)();
      fakeResp = [
        {
          Address: {
            StandardizedAddress: 'first address',
            Similarity: 100
          },
          YCoord: 'first y coordinate',
          XCoord: 'first x coordinate'
        },
        {
          Address: {
            StandardizedAddress: 'second address',
            Similarity: 90 
          },
          YCoord: 'second y coordinate',
          XCoord: 'second x coordinate'
        }
      ];
      done();
    });

    it("loops over an array of locations object and returns an array of formatting locations", function () {
      expect(phlGeolocate.parseLocations(fakeResp)[0]).to.eql({
        address: "first address",
        similarity: 100,
        latitude: "first y coordinate",
        longitude: "first x coordinate"
      });
      
      expect(phlGeolocate.parseLocations(fakeResp)[1]).to.eql({
        address: "second address",
        similarity: 90,
        latitude: "second y coordinate",
        longitude: "second x coordinate"
      });
    });

    it("loops ignores any locations whose similarity is greater than phlGeolocate.settings.minConfidence", function () {
      phlGeolocate = require(geolocatePath)({minConfidence: 95});

      expect(phlGeolocate.parseLocations(fakeResp)[0]).to.eql({
        address: "first address",
        similarity: 100,
        latitude: "first y coordinate",
        longitude: "first x coordinate"
      });
      
      expect(phlGeolocate.parseLocations(fakeResp).length).to.eql(1);
    });
  });
});
