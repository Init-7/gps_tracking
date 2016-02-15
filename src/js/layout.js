dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");

dojo.require("dijit.form.FilteringSelect");

var db = {};
var mapa;
var layer = [];

var url = {};
url.wmsroot = 'http://104.196.40.15:8080/geoserver/est40516/wms';
url.owsroot = 'http://104.196.40.15:8080/geoserver/est40516/ows';

/* -------------------------------------------------------------------- */
/* ------------------------------ INIT() ------------------------------ */
/* -------------------------------------------------------------------- */

function init() {
	//Funciones basicas
	filterDB();//formulario de seleccion
	getURL();//generar url
	getLegend();//generar leyenda

	
	addBaseMap();//cargamos el mapa base
	addWMS();//cargamos wms
	addGeoJSON(); //cargamos GeoJSON

	/*FILTROS*/
	dojo.connect(dijit.byId("planta"), "onChange", centrarMapa);
	dojo.connect(dijit.byId("centro"), "onChange", centrarMapa);
	dojo.connect(dijit.byId("trabajador"), "onChange", centrarMapaJob);
	/*fin*/
	}

/* ------------------------------------------------------------------------- */
/* ---------------------------- FunctionS map() ---------------------------- */
/* ------------------------------------------------------------------------- */

/* iniciamos mapa base() */
function addBaseMap() {
	//iniciamos mapa centrado en un objetivo principal
	//mapa = L.map('map', {center: [-37,-73],zoom: 4}); //Chile
	//mapa = L.map('map', {center: [-36.3,-72.3],zoom: 8}); //central
	//mapa = L.map('map', {center: [-35.607,-71.588],zoom: 16}); //Planta Maule
	//mapa = L.map('map', {center: [-36.780,-73.125],zoom: 15}); //Enap
	mapa = L.map('map', {center: [-36.8395,-73.114],zoom: 18}); //Oficina EST
	
	// capa de Bing
	var bing = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'Aerial'});
	var bingWL = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'AerialWithLabels'});

	//capa de Google
	var ggl = new L.Google();
	var gglH = new L.Google('HYBRID');

	//se agrega una capa inicial, y los controles de cambio de capa base
	mapa.addLayer(bingWL);
	mapa.addControl(new L.Control.Layers( {'Bing':bing, 'Bing with Labels':bingWL, 'Google':ggl, 'Google Hibrido':gglH}, {}));

    //control de click sobre el mapa
    mapa.off('click', ShowWMSLayersInfo);
    mapa.on('click', ShowWMSLayersInfo); 
	}

/*agregamos capas bases (edificacion de plantas...)*/
function addWMS() { 
	//edificacion planta maule
    layer.maule = L.tileLayer.wms(url.wmsroot, {
        layers: 'est40516:Edificacion',
        transparent: true,
        format: 'image/png',
        styles: 'PMaule',
        attribution: 'Edificacion'
        });
    layer.maule.options.crs = L.CRS.EPSG4326;
    layer.maule.setOpacity(1);
    layer.maule.addTo(mapa);

    //capa de ejemplo, trabajadores planta maule
    layer.job =  L.tileLayer.wms(url.wmsroot, {
        layers: 'est40516:people',
        transparent: true,
        format: 'image/png',
        styles: 'Trabajador',
        attribution: 'Trabajador'
        });
    layer.job.options.crs = L.CRS.EPSG4326;
    layer.job.setOpacity(1);
    //layer.job.addTo(mapa);

    //prueba de nuevo metodo de insercion, para un mejor control de la capa
	layer.groupJob = L.featureGroup(); //L.layerGroup();
	layer.groupJob.addLayer(layer.job);
	layer.groupJob.addTo(mapa);

    layer.maule.bringToFront();
    layer.job.bringToFront();
	}

/* agregar datos GeoJSON (GPS) */
function addGeoJSON() {
	layer.realtime = L.realtime(rtGeoJSON,{onEachFeature: onEachGeoJSON, pointToLayer: pointToGeoJSON, interval: 15 * 1000}).addTo(mapa);
	layer.realtime.on('update', function(e) {console.log(db.GeoJSON.properties.id,' :',db.GeoJSON.id)});
	}

var rtGeoJSON = function(success, error) {
	L.Realtime.reqwest({url:url.GeoJSON, type:'json'})
		.then(function(data) {success(xhrGeoJSON(url.GeoJSON));})
		.catch(function(err) {error(err);});
	};

var xhrGeoJSON = function(urlGeoJSON){
	var GeoJSON;
	var xhrargs = {
		url: urlGeoJSON,
		handleAs: "json",
		sync: true,
		error: function() {console.log('error xhr');}
		};

	dojo.xhrGet(xhrargs).then(
		function(jsonData) {
			dojo.forEach(jsonData.features,function(features) {
				GeoJSON = features;
				});
			}
		);
	db.GeoJSON = GeoJSON;
	return GeoJSON;
	}

var onEachGeoJSON = function (feature, layer) {
	layer.on({
		click: function (){
			divInfoGPS(feature);
			divInfoDB(feature.properties.deviceId)
			}
		});
	}

var pointToGeoJSON = function (feature, latlng) {
	return L.circleMarker(
		latlng, 
		{
			radius: 5,
			fillColor: "#ff0000",
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 0.8
			}
		);
	}

/* Centrar mapa */
function centrarMapa(valor) {
	var plantaSelect;

	if (dijit.byId("centro").item.plant === '*' && dijit.byId("trabajador").item.plant === '*') {
		plantaSelect = dijit.byId("planta").item.plant;
		}
	else if (dijit.byId("trabajador").item.plant === '*') {
		plantaSelect = dijit.byId("centro").item.plant;
		}
	else {
		plantaSelect = dijit.byId("trabajador").item.plant;
		}

	if(plantaSelect === '*'){
		mapa.setView([-36.3,-72.3], 8);
		dojo.attr(dojo.byId('work'), "src", url.leyendaEdificacion);
		}
	if(plantaSelect === '01'){
		mapa.setView([-35.607,-71.588], 16);
		dojo.attr(dojo.byId('work'), "src", url.leyendaPMaule);
		}
	if(plantaSelect === '02'){
		mapa.setView([-36.780,-73.125], 15);
		dojo.attr(dojo.byId('work'), "src", url.leyendaEdificacion);
		}
	if(plantaSelect === '03'){
		mapa.setView([-36.8395,-73.114], 18);
		dojo.attr(dojo.byId('work'), "src", url.leyendaEdificacion);
		}
	}


/* Centrar mapa trabajador */
function centrarMapaJob(valor) {
	mapa.fitBounds(layer.realtime.getBounds(), {});
	}


/* ------------------------------------------------------------------------- */
/* --------------------------- FunctionS basic() --------------------------- */
/* ------------------------------------------------------------------------- */

/*generamos select (manejo temporal de BD)*/
function filterDB() {
	db.plantas =  [
	    { plant: "*", value: "*", name: "todas las plantas", selected: true },

	    { plant: "01", value: "01", name: "CMPC-Planta Maule" },
	    { plant: "02", value: "02", name: "ENAP" },
	    { plant: "03", value: "03", name: "Oficina EST" },
	    ];

	  db.centros =  [
	    { center: "*", plant: "*", value: "*", name: "Todos los centros", selected: true },

	    { center: "MA0101", plant: "01", value: "MA0101", name: "MA0101" },
	    { center: "MA0102", plant: "01", value: "MA0102", name: "MA0102" },
	    { center: "MA0130", plant: "01", value: "MA0130", name: "MA0130" },
	    { center: "MA0203", plant: "01", value: "MA0203", name: "MA0203" },
	    { center: "MA3182", plant: "01", value: "MA3182", name: "MA3182" },
	    { center: "3654", plant: "01", value: "3654", name: "MA3654" },
	    { center: "gps2016", plant: "03", value: "gps2016", name: "GPS Pruebas" },
	    ];

	  db.trabajadores =  [
	    { job: "*", center: "*", plant: "*", value: "*", name: "Todos los trabajadores", fEmer: "", fPers: "", cargo: "", antiguedad: "", alergia: "",},
	    { job: "people.1", center: "MA0130", plant: "01", value: "people.1", name: "Perico los palotes", fEmer: "5641896578", fPers: "56989456123", cargo: "Electrico", antiguedad: "5", alergia: "Penicilina",},
	    { job: "people.2", center: "MA0203", plant: "01", value: "people.2", name: "Alan Brito", fEmer: "425698745", fPers: "56987456321", cargo: "Mecanico", antiguedad: "3", alergia: "Sulfas",},
	    { job: "people.3", center: "MA0101", plant: "01", value: "people.3", name: "Carlos Hernandez", fEmer: "5641874563", fPers: "56415896745", cargo: "Director Comercial", antiguedad: "20", alergia: "mani",},
	    { job: "people.4", center: "MA3182", plant: "01", value: "people.4", name: "Victor Hernandez", fEmer: "456456456456", fPers: "4564654516", cargo: "Jefe Centro Negocios", antiguedad: "5", alergia: "mani",},
	    { job: "people.5", center: "MA0102", plant: "01", value: "people.5", name: "Juan Pablo Hernandez", fEmer: "1515645645615", fPers: "51651651561", cargo: "Director General", antiguedad: "15", alergia: "mani", },
	    { job: "people.6", center: "MA3654", plant: "01", value: "people.6", name: "Aquies Baeza", fEmer: "15646845", fPers: "465465465", cargo: "Supervisor", antiguedad: "12", alergia: "nada", },
	    { job: "1", center: "gps2016", plant: "03", value: "1", name: "Lautaro Silva", fEmer: "133", fPers: "+56950645387", cargo: "Jefe Proyecto", antiguedad: "3 años", alergia: "nada", },
	    ];
	new dijit.form.FilteringSelect({
		id: "planta",
		value: "*",
		store: new dojo.store.Memory({ idProperty: "value", data: db.plantas }),
		autoComplete: true,
		queryExpr: '*${0}*',
		required: false,
		style: "font-size:90%;",
		onChange: function(plant){
			if(this.item.plant != "*"){
				dijit.byId('centro').query.plant = this.item.plant || "*" || /.*/;
				dijit.byId('centro').set('value', this.item ? "*" : null);
				dijit.byId('trabajador').query.plant = this.item.plant || /.*/;
				dijit.byId('trabajador').set('value', this.item ? "*" : null);
				}
			else {
				dijit.byId('centro').query.plant = /.*/;
				dijit.byId('centro').set('value', this.item ? "*" : null);
				dijit.byId('trabajador').query.plant = /.*/;
				dijit.byId('trabajador').set('value', this.item ? "*" : null);
				}
			}
		}, "planta").startup();

	new dijit.form.FilteringSelect({
		id: "centro",
		value: "*",
		store: new dojo.store.Memory({ idProperty: "value", data: db.centros }),
		autoComplete: true,
		queryExpr: '*${0}*',
		required: false,
		style: "font-size:90%;",
		onChange: function(center){
			if(this.item.center != "*"){
				dijit.byId('trabajador').query.center = this.item.center || /.*/;
				dijit.byId('trabajador').set('value', this.item ? "*" : null);
				}
			else {
				dijit.byId('trabajador').query.center = /.*/;
				dijit.byId('trabajador').set('value', this.item ? "*" : null);
				}
			}
		}, "centro");

	new dijit.form.FilteringSelect({
		id: "trabajador",
		value: "*",
		store: new dojo.store.Memory({ idProperty: "value", data: db.trabajadores }),
		autoComplete: true,
		required: false,
		queryExpr: "*${0}*",
		ignoreCase:true,
		style: "font-size:90%;",
		}, "trabajador");
	}

function getURL() {
	var defParam,parameters;
	//url.GeoJSON = http://104.196.40.15:8080/geoserver/est40516/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=est40516:gps1&outputFormat=application/json
	//url.leyendaTrabajador = 'http://104.196.40.15:8080/geoserver/est40516/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:on&LAYER=est40516:people&style=Trabajador'
	//url.leyendaEdificacion = 'http://104.196.40.15:8080/geoserver/est40516/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:on&LAYER=est40516:Edificacion&style=Edificacion';
	//url.leyendaPMaule = 'http://104.196.40.15:8080/geoserver/est40516/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:on&LAYER=est40516:Edificacion&style=PMaule';

	//GeoJSON (con manzanitas)
	defParam = {
		service : 'WFS',
		version : '1.0.0',
		request : 'GetFeature',
		typeName : 'est40516:gps1',
		outputFormat : 'application/json'
		};
	parameters = L.Util.extend(defParam);
	url.GeoJSON = url.owsroot + L.Util.getParamString(parameters);

	//leyendas
	defParam = {
		request:'GetLegendGraphic',
		version:'1.1.0',
		format:'image/png',
		width:'20',
		height:'20',
		legend_options:'forceLabels:on',
		layer:'est40516:Edificacion',
		style:'PMaule'
		};
	parameters = L.Util.extend(defParam);
	url.leyendaPMaule = url.wmsroot + L.Util.getParamString(parameters);

	defParam = {
		request:'GetLegendGraphic',
		version:'1.1.0',
		format:'image/png',
		width:'20',
		height:'20',
		legend_options:'forceLabels:on',
		layer:'est40516:people',
		style:'Trabajador'
		};
	parameters = L.Util.extend(defParam);
	url.leyendaTrabajador = url.wmsroot + L.Util.getParamString(parameters);

	defParam = {
		request:'GetLegendGraphic',
		version:'1.1.0',
		format:'image/png',
		width:'20',
		height:'20',
		legend_options:'forceLabels:on',
		layer:'est40516:Edificacion',
		style:'Edificacion'
		};
	parameters = L.Util.extend(defParam);
	url.leyendaEdificacion = url.wmsroot + L.Util.getParamString(parameters);
}

/*Crear leyenda*/
function getLegend() {
	dojo.create('img', {src: url.leyendaTrabajador, id:'job'}, dojo.byId('leyenda'));
	dojo.create('br', null, dojo.byId('leyenda'));
	dojo.create('img', {src: url.leyendaEdificacion,id:'work'}, dojo.byId('leyenda'));
	}

/* info layer WMS */
function ShowWMSLayersInfo(evt){
	var urls = getFeatureInfoUrl(mapa,layer.job,evt.latlng,{'info_format': 'text/html'});
	var inner = '<iframe src="' + urls + '" width="100%" height="110px" style="border:none"></iframe>';

	dojo.attr(dojo.byId('divInfoDB'), "innerHTML", '');
	dojo.attr(dojo.byId('divInfoGPS'), "innerHTML", '');
	dojo.attr(dojo.byId('divInfoWMS'), "innerHTML", inner);
	}

/* URL para obtener detalles de capa WMS */
function getFeatureInfoUrl(map, layer, latlng, params) {
    var point = map.latLngToContainerPoint(latlng, map.getZoom()),
        size = map.getSize(),
        bounds = map.getBounds(),
        sw = bounds.getSouthWest(),
        ne = bounds.getNorthEast(),
        sw = ([sw.lng, sw.lat]),
        ne = ([ne.lng, ne.lat]);

    var defaultParams = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: layer._crs.code,
        styles: '',
        version: layer._wmsVersion,
        format: layer.options.format,
        bbox: [sw.join(','), ne.join(',')].join(','),
        height: size.y,
        width: size.x,
        layers: layer.options.layers,
        query_layers: layer.options.layers,
        info_format: 'text/html'
        };

    params = L.Util.extend(defaultParams, params || {});

    params[params.version === '1.3.0' ? 'i' : 'x'] = point.x;
    params[params.version === '1.3.0' ? 'j' : 'y'] = point.y;

    return layer._url + L.Util.getParamString(params, layer._url, true);
    }

/* info BD */
function divInfoDB(jobID){
	//job: center: plant: value: name: fEmer: fPers: cargo: antiguedad: alergia:
	var inner;
	dojo.forEach(db.trabajadores,function(job) {
		if (job.job == jobID) {
			inner = '<h2 style="align:center"> Datos Trabajador</h2>' +
				'Nombre: '+ job.name + ' <br />'+
				'Telefono Personal: '+ job.fPers + ' <br />'+
				'Telefono emeregencia: '+ job.fEmer + ' <br />'+
				'Alergias: '+ job.alergia + ' <br />'+
				'Cargo: '+ job.cargo + ' <br />'+
				'Años de antiguedad: '+ job.antiguedad + ' <br />'+
				'Centro de Negocio: '+ job.center + ' <br />'+
				'Planta: '+ job.plant + ' <br /><br />';
			}
		});
	dojo.attr(dojo.byId('divInfoDB'), "innerHTML", inner);
}

/* info GeoJSON (GPS) */
function divInfoGPS(features){
	var inner = '<h2 style="align:center"> Datos GPS </h2>' +
		'ID (prop): '+ features.properties.deviceId + ' <br />'+
		'ID (GPS): '+ features.properties.id + ' <br />'+
		'Fecha: '+ features.properties.deviceTime + '<br />'+
		'Latitud: '+ features.properties.lat + ' <br />'+
		'Longitud: '+ features.properties.lon + ' <br />'+
		'Direccion: '+ features.properties.address + ' (aprox.) <br />'+
		'ID (interno): '+ features.id + ' <br /><br />';
	dojo.attr(dojo.byId('divInfoGPS'), "innerHTML", inner);
	console.log(features.properties.id,':',features.id);//,'time:',features.properties.deviceTime);
	//console.log('lat:',features.properties.lat,' lon:',features.properties.lon);
	}

//dojo ready init
dojo.ready(init);



/*estructura GeoJson* /
http://104.196.40.15:8080/geoserver/est40516/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=est40516:gps1&outputFormat=application/json
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
				"lat":-36.83945444444444,
				"lon":-73.11391166666667
				}
			}],
		"crs":{
			"type":"name",
			"properties":{"name":"urn:ogc:def:crs:EPSG::4326"}
			}
	}
/**/


/*inicio DB* /
	db.plantas =  [
		{ plant: "*", value: "*", name: "todas las plantas", selected: true },

		{ plant: "01", value: "01", name: "CMPC-Planta Maule" },
		{ plant: "02", value: "02", name: "ENAP" },
		{ plant: "03", value: "03", name: "Oficina EST" },
		];

	db.centros =  [
		{ center: "*", plant: "*", value: "*", name: "Todos los centros", selected: true },

		{ center: "01-201507", plant: "01", value: "01-201507", name: "Contrato Fibra Mecánico" },
		{ center: "01-201508", plant: "01", value: "01-201508", name: "Contrato Bodega de Repuestos" },
		{ center: "03-201601", plant: "03", value: "03-201601", name: "Pruebas GPS" },
		];

	db.trabajadores =  [
		{ job: "*", center: "*", plant: "*", value: "*", name: "Todos los trabajadores"},
		{ job: "job-0501", center: "01-201507", plant: "01", value: "job-0501", name: "Fredy Nuñez" },
		{ job: "job-0502", center: "01-201507", plant: "01", value: "job-0502", name: "Felipe Salinas" },

		{ job: "job-0506", center: "01-201508", plant: "01", value: "job-0506", name: "Juan Carlos Gonzalez" },
		{ job: "job-0507", center: "01-201508", plant: "01", value: "job-0507", name: "Jorge Gajardo" },

		{ job: "job-0506", center: "03-201601", plant: "03", value: "job-0506", name: "Lautaro Silva" },
		{ job: "job-0507", center: "03-201601", plant: "03", value: "job-0507", name: "Jhonny Gutiérrez" },
		];
/*fin DB*/

/* info BD * /
function divInfoDB(){
	//job: center: plant: value: name: fEmer: fPers: cargo: antiguedad: alergia:
	var inner = '<h2 style="align:center"> Datos Trabajador </h2>' +
			'Nombre: '+ dijit.byId("trabajador").item.name + ' <br />'+
			'Telefono Personal: '+ dijit.byId("trabajador").item.fPers + ' <br />'+
			'Telefono emeregencia: '+ dijit.byId("trabajador").item.fEmer + ' <br />'+
			'Alergias: '+ dijit.byId("trabajador").item.alergia + ' <br />'+
			'Cargo: '+ dijit.byId("trabajador").item.cargo + ' <br />'+
			'Años de antiguedad: '+ dijit.byId("trabajador").item.antiguedad + ' <br />'+
			'Centro de Negocio: '+ dijit.byId("trabajador").item.center + ' <br />'+
			'Planta: '+ dijit.byId("trabajador").item.plant + ' <br /><br />';
	dojo.attr(dojo.byId('divInfoDB'), "innerHTML", inner);
	console.log(db);
	console.log(db.trabajadores);
}
/**/