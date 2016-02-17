var map = L.map('map').fitBounds([[54, 7], [76, 23]]);


/** /
http://www.tagkartan.se/json/tag2.php?bounds=' + bbox.join(',') + '&_=' + Math.random() + '&callback=?
?( 
[
{"id":"138438556","olat":"60.6034","olon":"15.6417","lat":"60.6034","lon":"15.6417","ang":3654266439,"sen":0},
{"id":"138431599","olat":"59.1649","olon":"18.1333","lat":"59.1649","lon":"18.1333","ang":2352632920,"sen":28},
....
{"id":"138401282","olat":"62.4791","olon":"14.3593","lat":"62.4791","lon":"14.3593","ang":4038601562,"sen":0}
] )
/** /
http://www.tagkartan.se/json/tag2.php'
[
{"id":"138438254","olat":"55.5418","olon":"13.0958","lat":"55.5418","lon":"13.0958","ang":3365225737,"sen":0},
{"id":"138444552","olat":"58.3832","olon":"15.4323","lat":"58.4066","lon":"15.4997","ang":4114131589,"sen":0},
...
{"id":"138392352","olat":"0","olon":"0","lat":"0","lon":"0","ang":2372939164,"sen":0}

]
/** /
http://104.196.40.15:8080/geoserver/est40516/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=est40516:gps1&maxFeatures=1&outputFormat=application%2Fjson
{
	"type":"FeatureCollection",
	"totalFeatures":1,
	"features":[{
		"type":"Feature",
		"id":"gps1.fid-555fd13a_152a2299560_-2e28",
		"geometry":{
			"type":"Point",
			"coordinates":[-36.83945444444444,-73.11391166666667,4326]},
			"geometry_name":"punto",
			"properties":{
				"id":1,
				"deviceId":1,
				"deviceTime":"2016-02-04T21:50:46Z",
				"valid":true,
				"address":"21-31 Juan Gómez de Vidaurre, San Pedro de la Paz, Región Metropolitana, CL",
				"attributes":"{\"sat\":7,\"mcc\":730,\"mnc\":1,\"lac\":58001,\"cid\":38386,\"index\":67,\"ip\":\"186.9.133.246\"}",
				"lat":-36.83945444444444,"lon":-73.11391166666667
				}
			}],
		"crs":{
			"type":"name",
			"properties":{"name":"urn:ogc:def:crs:EPSG::4326"}
			}
	}

parseResponse({
	"type":"FeatureCollection",
	"totalFeatures":1,
	"features":[{
		"type":"Feature",
		"id":"gps1.fid--acafded_152ad92419c_-7f21",
		"geometry":{"type":"Point","coordinates":[-36.83945444444444,-73.11391166666667,4326]},
		"geometry_name":"punto",
		"properties":{
			"id":1,
			"deviceId":1,
			"deviceTime":"2016-02-04T21:50:46Z",
			"valid":true,
			"address":"21-31 Juan Gómez de Vidaurre, San Pedro de la Paz, Región Metropolitana, CL",
			"attributes":"{\"sat\":7,\"mcc\":730,\"mnc\":1,\"lac\":58001,\"cid\":38386,\"index\":67,\"ip\":\"186.9.133.246\"}",
			"lat":-36.83945444444444,
			"lon":-73.11391166666667
			}
		}],
	"crs":{
		"type":"name",
		"properties":{"name":"urn:ogc:def:crs:EPSG::4326"}
		}
	})
/**/
var requestData = function(success, error) {
	var bounds = map.getBounds(),sw = bounds.getSouthWest(),ne = bounds.getNorthEast(),bbox = [ne.lat, ne.lng, sw.lat, sw.lng];
	var uerreele = 'http://www.tagkartan.se/json/tag2.php?bounds=' + bbox.join(',') + '&_=' + Math.random() + '&callback=?';

	L.Realtime.reqwest({url: uerreele,type: 'jsonp'})
	.then(function(data) {
			success(
				data.
				filter(function(train) {return train.lat > 0 || train.lon > 0;}).
				map(function(train) {return {type: 'Feature',properties: {id: train.id,},geometry: {type: 'Point',coordinates: [train.lon, train.lat]}};})
				);
			})
	.catch(function(err) {error(err);});
	};

var realtime = L.realtime(requestData, {interval: 10 * 1000}).addTo(map);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: 'pico'}).addTo(map);

realtime.on('update', function(e) {map.fitBounds(realtime.getBounds());});
