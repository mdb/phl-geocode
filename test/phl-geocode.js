var nock = require('nock');
var expect = require('expect.js');
var sinon = require('sinon');
var geocoderPath = '../phl-geocode';
var fakeResp = require('./fixtures/response');
var fakeLocs = require('./fixtures/locations');

describe("PHLGeocode", function() {
  var phlGeocode;

  describe("#settings", function () {
    it("exists as a public object on a PHLGeocode instance", function () {
      phlGeocode = require(geocoderPath)();
      expect(typeof phlGeocode.settings).to.eql('object');
    });
    
    it("is set to the value of the prototype's defaultSettings if no settings have been passed", function () {
      phlGeocode = require(geocoderPath)();
      expect(phlGeocode.settings.geoHost).to.eql("http://services.phila.gov");
      expect(phlGeocode.settings.locationPath).to.eql("/ULRS311/Data/Location/");
      expect(phlGeocode.settings.minConfidence).to.eql(85);
    });

    it("is set to the value of the options it's passed if it's instantiated with an options object", function () {
      phlGeocode = require(geocoderPath)({
        geoHost: 'fakeHost',
        locationPath: 'fakePath',
        liAddressKeyPath: 'fakeAddressPath',
        minConfidence: 100 
      });

      expect(phlGeocode.settings.geoHost).to.eql("fakeHost");
      expect(phlGeocode.settings.locationPath).to.eql("fakePath");
      expect(phlGeocode.settings.liAddressKeyPath).to.eql("fakeAddressPath");
      expect(phlGeocode.settings.minConfidence).to.eql(100);
    });
  });

  describe("#getCoordinates", function () {
    beforeEach(function () {
      phlGeocode = require(geocoderPath)();
    });

    it("exists a public method on a PHLGeocode instance", function (done) {
      expect(typeof phlGeocode.getCoordinates).to.eql("function");
      done();
    });

    it("performs a get request to the proper API URL", function (done) {
      nock('http://services.phila.gov')
        .get('/ULRS311/Data/Location/someAddress')
        .reply(200, fakeResp);

      phlGeocode.getCoordinates('someAddress', function (data) {
        expect(data).to.eql(phlGeocode.parseLocations(fakeResp.Locations));
        done();
      });
    });

    context("the body of the API response has a Locations property", function () {
      it("passes the body of the API response to parseLocations and on to the callback", function (done) {
        nock('http://services.phila.gov')
          .get('/ULRS311/Data/Location/anotherAddress')
          .reply(200, fakeResp);

        phlGeocode.getCoordinates('anotherAddress', function (data) {
          expect(data).to.eql(phlGeocode.parseLocations(fakeResp.Locations));
          done();
        });
      });
    });

    context("the body of the API response does not contain a Locations property", function () {
      it("passes the raw response body to the callback", function (done) {
        nock('http://services.phila.gov')
          .get('/ULRS311/Data/Location/anotherAddress')
          .reply(200, {resp: 'fakeResponse'});

        phlGeocode.getCoordinates('anotherAddress', function (data) {
          expect(data).to.eql({resp: 'fakeResponse'});
          done();
        });
      });
    });

    // works locally but fails in Travis
    xit("calls getData", function (done) {
      phlGeocode = require(geocoderPath)();
      var spy = sinon.spy(phlGeocode, 'getData');
      
      nock('http://www.someURL.com')
        .get('/some/path')
        .reply(200, fakeResp);

      phlGeocode.getCoordinates('someAddress', function (d) {
        expect(spy.calledOnce).to.eql(true);
        done();
      });
    });
  });

  describe("#getAddressKey", function () {
    beforeEach(function () {
      phlGeocode = require(geocoderPath)();
    });

    it("exists as a public method on a phlGeocode instance", function () {
      expect(typeof phlGeocode.getAddressKey).to.eql("function");
    });

    it("performs an API request to the proper endpoint", function (done) {
      nock('http://services.phila.gov')
        .get('/ULRS311/Data/LIAddressKey/someAddress')
        .reply(200, fakeResp);

      phlGeocode.getAddressKey('someAddress', function (d) {
        expect(d).to.eql(phlGeocode.parseLocations(fakeResp.Locations));
        done();
      });
    });
  });

  describe("#getData", function () {
    it("exists a public method on a PHLGeocode instance", function (done) {
      phlGeocode = require(geocoderPath)();
      expect(typeof phlGeocode.getData).to.eql("function");
      done();
    });

    it("makes an API call to the URL it is passed endpoint", function (done) {
      nock('http://www.someURL.com')
        .get('/some/path')
        .reply(200, fakeResp);
      
      phlGeocode.getData('http://www.someURL.com/some/path', function(r) {
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
      
      phlGeocode.getData('http://www.someURL.com/some/path', function(r) {
        expect(JSON.parse(phlGeocode.settings.responseBody)).to.eql(fakeResp);
        done();
      });
    });
  });

  describe("#parseLocations", function () {
    beforeEach(function (done) {
      phlGeocode = require(geocoderPath)();
      done();
    });

    it("loops over an array of locations object and returns an array of formatting locations", function () {
      expect(phlGeocode.parseLocations(fakeLocs)[0]).to.eql({
        address: "first address",
        similarity: 100,
        latitude: "first y coordinate",
        longitude: "first x coordinate"
      });
      
      expect(phlGeocode.parseLocations(fakeLocs)[1]).to.eql({
        address: "second address",
        similarity: 90,
        latitude: "second y coordinate",
        longitude: "second x coordinate"
      });
    });

    it("loops ignores any locations whose similarity is greater than PHLGeocode.settings.minConfidence", function () {
      phlGeocode = require(geocoderPath)({minConfidence: 95});

      expect(phlGeocode.parseLocations(fakeLocs)[0]).to.eql({
        address: "first address",
        similarity: 100,
        latitude: "first y coordinate",
        longitude: "first x coordinate"
      });
      
      expect(phlGeocode.parseLocations(fakeLocs).length).to.eql(1);
    });
  });
});
