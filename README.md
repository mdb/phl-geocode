# phl-geocode

A Node.js module for getting latitude and longitude coordinates for a Philadelphia addresses.

phl-geocode is based on the geolocation component of [Mark Headd](http://twitter.com/mheadd)'s [phlfindpolls gist](https://gist.github.com/4015200)

The module uses Philadelphia's 311 Mobile Data Service API](http://services.phila.gov/ULRS311).

## Getting Started

Require and instantiate phl-geocode:
  
    var phlGeocode = require('phl-geocode')();

Overrding default settings:

    var phlGeocode = require('phl-geocode')({
      minConfidence: 100
    });

## Example Usage

Get latitude and longitude coordinates for a Philadelpia address:

    phlGeocode.getCoordinates('1500 market street', function (d) {
      console.log(d);

      /* Example response:
      [ { address: '1500 MARKET ST',
        similarity: 100,
        latitude: 39.9521740263203,
        longitude: -75.1661518986459 },
      { address: '1500S MARKET ST',
        similarity: 99,
        latitude: 39.9521740263203,
        longitude: -75.1661518986459 } ]
      */
    });
