var nock = require('nock');
var expect = require('expect.js');
var sinon = require('sinon');
var geolocatePath = '../phl-geolocate';
var fakeResp = require('./fixtures/response');
var fakeLocs = require('./fixtures/locations');

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

    it("calls getData", function (done) {
      phlGeolocate = require(geolocatePath)();
      sinon.spy(phlGeolocate, 'getData');
      
      nock('http://www.someURL.com')
        .get('/some/path')
        .reply(200, fakeResp);

      phlGeolocate.getCoordinates('some address', function (d) {
        expect(phlGeolocate.getData.calledOnce).to.eql(true);
        done();
      });
    });
  });

  describe("#getData", function () {
    it("exists a public method on a PHLGeolocate instance", function (done) {
      phlGeolocate = require(geolocatePath)();
      expect(typeof phlGeolocate.getData).to.eql("function");
      done();
    });

    it("makes an API call to the URL it is passed endpoint", function (done) {
      nock('http://www.someURL.com')
        .get('/some/path')
        .reply(200, fakeResp);
      
      phlGeolocate.getData('http://www.someURL.com/some/path', function(r) {
        expect(r).to.eql([
          {
            address: '1500 MARKET ST',
            similarity: 100,
            latitude: 39.9521740263203,
            longitude: -75.1661518986459
          },
          {
            address: '1500S MARKET ST',
            similarity: 99,
            latitude: 39.9521740263203,
            longitude: -75.1661518986459
          }
        ]);
        done();
      });
    });

    it("sets settings.responseBody to the value of the API request response body", function (done) {
      nock('http://www.someURL.com')
        .get('/some/path')
        .reply(200, fakeResp);
      
      phlGeolocate.getData('http://www.someURL.com/some/path', function(r) {
        expect(JSON.parse(phlGeolocate.settings.responseBody)).to.eql(fakeResp);
        done();
      });
    });
  });

  describe("#parseResponse", function () {
    var phlGeolocate;

    beforeEach(function (done) {
      phlGeolocate = require(geolocatePath)();
      done();
    });

    it("loops over an array of locations object and returns an array of formatting locations", function () {
      expect(phlGeolocate.parseLocations(fakeLocs)[0]).to.eql({
        address: "first address",
        similarity: 100,
        latitude: "first y coordinate",
        longitude: "first x coordinate"
      });
      
      expect(phlGeolocate.parseLocations(fakeLocs)[1]).to.eql({
        address: "second address",
        similarity: 90,
        latitude: "second y coordinate",
        longitude: "second x coordinate"
      });
    });

    it("loops ignores any locations whose similarity is greater than phlGeolocate.settings.minConfidence", function () {
      phlGeolocate = require(geolocatePath)({minConfidence: 95});

      expect(phlGeolocate.parseLocations(fakeLocs)[0]).to.eql({
        address: "first address",
        similarity: 100,
        latitude: "first y coordinate",
        longitude: "first x coordinate"
      });
      
      expect(phlGeolocate.parseLocations(fakeLocs).length).to.eql(1);
    });
  });
});
