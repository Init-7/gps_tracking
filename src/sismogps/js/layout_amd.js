require([
	"dijit/layout/AccordionContainer", 
	"dijit/layout/BorderContainer", 
	"dijit/layout/ContentPane", 
	"dijit/form/FilteringSelect",
	"dijit/registry",
	"dojo/store/Memory", 
	"dojo/ready",
	"dojo/on", 
	"dojo/mouse",
	"dojo/aspect",
	"dojo/dom-attr",
	"dojo/dom-construct",
	"dojo/request/xhr",
	"dojo/_base/array",
	"dojo/parser",
	"dojo/dom",
	"dojo/domReady!"
	], 
	function(
	  AccordionContainer,
	  BorderContainer,
	  ContentPane,
	  FilteringSelect,
	  registry,
	  Memory,
	  ready,
	  on,
	  mouse,
	  aspect,
	  domAttr,
	  domConstruct,
	  xhr,
	  array,
	  parser,
	  dom
	  ){
		var mapa, db = {}, layer = [], url = {};

		ready(function(){
			//Ejemplo de base de datos...
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
				{ center: "gps2016", plant: "01", value: "gps2016", name: "GPS Pruebas" },
				];

			db.trabajadores =  [
				{ job: "*", center: "*", plant: "*", value: "*", name: "Todos los trabajadores", fEmer: "", fPers: "", cargo: "", antiguedad: "", alergia: "",},
				{ job: "people.1", center: "MA0130", plant: "01", value: "people.1", name: "Perico los palotes", fEmer: "5641896578", fPers: "56989456123", cargo: "Electrico", antiguedad: "5", alergia: "Penicilina",},
				{ job: "people.2", center: "MA0203", plant: "01", value: "people.2", name: "Alan Brito", fEmer: "425698745", fPers: "56987456321", cargo: "Mecanico", antiguedad: "3", alergia: "Sulfas",},
				{ job: "people.3", center: "MA0101", plant: "01", value: "people.3", name: "Carlos Hernandez", fEmer: "5641874563", fPers: "56415896745", cargo: "Director Comercial", antiguedad: "20", alergia: "mani",},
				{ job: "people.4", center: "MA3182", plant: "01", value: "people.4", name: "Victor Hernandez", fEmer: "456456456456", fPers: "4564654516", cargo: "Jefe Centro Negocios", antiguedad: "5", alergia: "mani",},
				{ job: "people.5", center: "MA0102", plant: "01", value: "people.5", name: "Juan Pablo Hernandez", fEmer: "1515645645615", fPers: "51651651561", cargo: "Director General", antiguedad: "15", alergia: "mani", },
				{ job: "people.6", center: "MA3654", plant: "01", value: "people.6", name: "Aquies Baeza", fEmer: "15646845", fPers: "465465465", cargo: "Supervisor", antiguedad: "12", alergia: "nada", },

				//{ job: "1", center: "gps2016", plant: "03", value: "1", name: "Lautaro Silva", fEmer: "133", fPers: "+56950645387", cargo: "Jefe Proyecto", antiguedad: "3 años", alergia: "nada", },
				{ job: "1", center: "gps2016", plant: "01", value: "1", name: "Carlos Hernandez", fEmer: "5641874563", fPers: "56415896745", cargo: "Director Comercial", antiguedad: "20", alergia: "mani",},
				];

			//urls del servidor de mapas
			url.wmsroot = 'http://104.196.40.15:8080/geoserver/est40516/wms';
			url.owsroot = 'http://104.196.40.15:8080/geoserver/est40516/ows';

			//formulario de seleccion...
			new FilteringSelect({
				id: "planta",
				value: "*",
				store: new Memory({ idProperty: "value", data: db.plantas }),
				autoComplete: true,
				queryExpr: '*${0}*',
				required: false,
				style: "font-size:90%;",
				onChange: function(plant){
					if(this.item.plant != "*"){
						registry.byId('centro').query.plant = this.item.plant || "*" || /.*/;
						registry.byId('centro').set('value', this.item ? "*" : null);
						registry.byId('trabajador').query.plant = this.item.plant || /.*/;
						registry.byId('trabajador').set('value', this.item ? "*" : null);
						}
					else {
						registry.byId('centro').query.plant = /.*/;
						registry.byId('centro').set('value', this.item ? "*" : null);
						registry.byId('trabajador').query.plant = /.*/;
						registry.byId('trabajador').set('value', this.item ? "*" : null);
						}
					}
				}, "planta").startup();

			new FilteringSelect({
				id: "centro",
				value: "*",
				store: new Memory({ idProperty: "value", data: db.centros }),
				autoComplete: true,
				queryExpr: '*${0}*',
				required: false,
				style: "font-size:90%;",
				onChange: function(center){
					if(this.item.center != "*"){
						registry.byId('trabajador').query.center = this.item.center || /.*/;
						registry.byId('trabajador').set('value', this.item ? "*" : null);
						}
					else {
						registry.byId('trabajador').query.center = /.*/;
						registry.byId('trabajador').set('value', this.item ? "*" : null);
						}
					}
				}, "centro");

			new FilteringSelect({
				id: "trabajador",
				value: "*",
				store: new Memory({ idProperty: "value", data: db.trabajadores }),
				autoComplete: true,
				required: false,
				queryExpr: "*${0}*",
				ignoreCase:true,
				style: "font-size:90%;",
				}, "trabajador");

			//en caso de seleccionar...
			aspect.after(registry.byId("planta"), "onChange", centrarMapa, true);
			aspect.after(registry.byId("centro"), "onChange", centrarMapa, true);
			aspect.after(registry.byId("trabajador"), "onChange", centrarMapaJob,true);

			//generamos url de servicios de mapas, desde el servidor...
			var prmtLydEdif = L.Util.extend({
				request:'GetLegendGraphic',
				version:'1.1.0',
				format:'image/png',
				width:'20',
				height:'20',
				legend_options:'forceLabels:on',
				layer:'est40516:Edificacion',
				style:'Edificacion'
				});
			url.leyendaEdificacion = url.wmsroot + L.Util.getParamString(prmtLydEdif);

			var prmtLydPMaule = L.Util.extend({
				request:'GetLegendGraphic',
				version:'1.1.0',
				format:'image/png',
				width:'20',
				height:'20',
				legend_options:'forceLabels:on',
				layer:'est40516:Edificacion',
				opacity:'0.3',
				style:'PMaule'
				});
			url.leyendaPMaule = url.wmsroot + L.Util.getParamString(prmtLydPMaule);

			var prmtLydTrab = L.Util.extend({
				request:'GetLegendGraphic',
				version:'1.1.0',
				format:'image/png',
				width:'20',
				height:'20',
				legend_options:'forceLabels:on',
				layer:'est40516:people',
				style:'Trabajador'
				});
			url.leyendaTrabajador = url.wmsroot + L.Util.getParamString(prmtLydTrab);

			var prmtGeoJSON = L.Util.extend({
				service : 'WFS',
				version : '1.0.0',
				request : 'GetFeature',
				typeName : 'est40516:gps1',
				outputFormat : 'application/json'
				});
			url.GeoJSON = url.owsroot + L.Util.getParamString(prmtGeoJSON);
			console.log(url.GeoJSON);

			//generamos la leyenda inicial (generica)
			domConstruct.create('img', {src: url.leyendaTrabajador, id:'job'}, dom.byId('leyenda'));
			domConstruct.create('br', null, dom.byId('leyenda'));
			domConstruct.create('img', {src: url.leyendaEdificacion,id:'work'}, dom.byId('leyenda'));

			// **** INICIAMOS EL MAPA (LEAFLET) **** //
			//mapa = L.map('map', {center: [-37,-73],zoom: 4}); //Chile
			mapa = L.map('map');

			//fijamos la primera vista....
			//mapa.setView([-37,-73],4); //Chile
			//mapa.setView([-36.3,-72.3],8); //central
			//mapa.setView([-35.607,-71.588],16); //Planta Maule
			//mapa.setView([-36.780,-73.125],15); //Enap
			mapa.setView([-36.8395,-73.114],1); //Oficina EST

			//variables para mapas de google y bing
			var bing = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'Aerial'});
			var bingWL = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'AerialWithLabels'});
			var ggl = new L.Google(), gglH = new L.Google('HYBRID');

			//se agrega al mapa la base seleccionada, en este caso AerialWithLabels de bing. Se agrega el control para cambiar el mapa base
			mapa.addLayer(bingWL);

			//en caso de hacer click en el mapa, se llama a la funcion ShowWMSLayersInfo
			mapa.off('click', ShowWMSLayersInfo);
			mapa.on('click', ShowWMSLayersInfo); 

			//se agregan la capa desde wms (convenientes para edificacion)
			layer.maule = L.tileLayer.wms(url.wmsroot, {
				layers: 'est40516:Edificacion',
				transparent: true,
				format: 'image/png',
				styles: 'PMaule',
				attribution: 'Edificacion'
			});
			layer.maule.options.crs = L.CRS.EPSG4326;
			layer.maule.setOpacity(0.5);
			layer.maule.addTo(mapa);

			layer.job =  L.tileLayer.wms(url.wmsroot, {
				layers: 'est40516:people',
				transparent: true,
				format: 'image/png',
				styles: 'Trabajador',
				attribution: 'Trabajador',
				minZoom: '4'
				});
			layer.job.options.crs = L.CRS.EPSG4326;
			layer.job.setOpacity(1);
			//layer.job.addTo(mapa);

			//prueba de nuevo metodo de insercion, para un mejor control de la capa
			layer.groupJob = L.featureGroup(); //L.layerGroup();
			layer.groupJob.addLayer(layer.job);
			layer.groupJob.addTo(mapa);


			//se traen capas al frente
			layer.maule.bringToFront();
			layer.job.bringToFront();

			mapa.addControl(new L.Control.Layers( {'Bing':bing, 'Bing with Labels':bingWL, 'Google':ggl, 'Google Hibrido':gglH}, {'Planta Maule':layer.maule,'Trabajadores':layer.job}));
			//se agregan datos desde GeoJSON (conveniente para ubicacion en tiempo real de los trabajadores)
			layer.realtime = L.realtime( 
				realtimeGeoJSON , 
				{
					onEachFeature: onEachGeoJSON, 
					pointToLayer: pointToGeoJSON, 
					interval: 15 * 1000
					} 
				);
			layer.realtime.addTo(mapa);
			layer.realtime.on('update', function(e) {console.log('realtime:',db.GeoJSON.properties.id,':',db.GeoJSON.id)});
		});

		var realtimeGeoJSON = function(success, error) {
			L.Realtime
				.reqwest({url:url.GeoJSON, type:'json'})
				.then(function(data) {success(xhrGeoJSON(url.GeoJSON));})
				.catch(function(err) {error(err);});
			};

		var xhrGeoJSON = function(urlGeoJSON){
			var GeoJSON;
			var xhrargs = {
				handleAs: "json",
				sync: true,
				error: function() {console.log('error xhr');}
				};

			xhr(urlGeoJSON, xhrargs).then(
				function(jsonData) {
					array.forEach(jsonData.features,function(features) {
						GeoJSON = features;
						});
					}

				);
			db.GeoJSON = GeoJSON; //var tmp para mostrar en console *
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

		function centrarMapa(valor) {
			var plantaSelect;

			if (registry.byId("centro").item.plant === '*' && registry.byId("trabajador").item.plant === '*') {
				plantaSelect = registry.byId("planta").item.plant;
				}
			else if (registry.byId("trabajador").item.plant === '*') {
				plantaSelect = registry.byId("centro").item.plant;
				}
			else {
				plantaSelect = registry.byId("trabajador").item.plant;
				}

			if(plantaSelect === '*'){
				mapa.setView([-36.3,-72.3], 8);
				domAttr.set(dom.byId('work'), "src", url.leyendaEdificacion);
				}
			if(plantaSelect === '01'){
				mapa.setView([-35.607,-71.588], 16);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule);
				}
			if(plantaSelect === '02'){
				mapa.setView([-36.780,-73.125], 15);
				domAttr.set(dom.byId('work'), "src", url.leyendaEdificacion);
				}
			if(plantaSelect === '03'){
				mapa.setView([-36.8395,-73.114], 18);
				domAttr.set(dom.byId('work'), "src", url.leyendaEdificacion);
				}
			}

		function centrarMapaJob(valor) {
			mapa.fitBounds(layer.realtime.getBounds(), {});
			}

		function ShowWMSLayersInfo(evt){
			var urls = getFeatureInfoUrl(mapa,layer.job,evt.latlng,{'info_format': 'text/html'});
			var inner = '<iframe src="' + urls + '" width="100%" height="110px" style="border:none"></iframe>';

			domAttr.set(dom.byId('divInfoDB'), "innerHTML", '');
			domAttr.set(dom.byId('divInfoGPS'), "innerHTML", '');
			domAttr.set(dom.byId('divInfoWMS'), "innerHTML", inner);
			}

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

		function divInfoDB(jobID){
			var inner;
			array.forEach(db.trabajadores,function(job) {
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
			domAttr.set(dom.byId('divInfoDB'), "innerHTML", inner);
		}

		function divInfoGPS(features){
			var inner = '<h2 style="align:center"> Datos GPS </h2>' +
				'ID (prop): '+ features.properties.deviceId + ' <br />'+
				'ID (GPS): '+ features.properties.id + ' <br />'+
				'Fecha: '+ features.properties.deviceTime + '<br />'+
				'Latitud: '+ features.properties.lat + ' <br />'+
				'Longitud: '+ features.properties.lon + ' <br />'+
				'Direccion: '+ features.properties.address + ' (aprox.) <br />'+
				'ID (interno): '+ features.id + ' <br /><br />';
			domAttr.set(dom.byId('divInfoGPS'), "innerHTML", inner);
			console.log('click:',features.properties.id,':',features.id);
			}

		});
/*END*/