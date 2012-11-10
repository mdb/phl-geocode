# phl-geolocate

A Node.js for geolocating Philadelphia addresses.

phl-geolocate is based on the geolocation component of (Mark Headd)[http://twitter.com/mheadd]'s (phlfindpolls gist)[https://gist.github.com/4015200]

## Getting Started

Require and instantiate node-nyt:
  
    var phlGeolocate = require('phl-geolocate')();

Overrding default settings:

    var phlGeolocate = require('phl-geolocate')({
      minConfidence: 100
    });

## Example Usage

Get latitude and longitude coordinates for a Philadelpia address:

    phlGeolocate.getCoordinates('1500 market street', function (d) {
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
