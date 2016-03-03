require([
	"dijit/layout/AccordionContainer", 
	"dijit/layout/BorderContainer", 
	"dijit/layout/ContentPane", 
	"dijit/form/FilteringSelect",
	"dijit/form/Button",
	"dijit/form/DateTextBox",
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
	function(AccordionContainer,BorderContainer,ContentPane,FilteringSelect,Button,DateTextBox,registry,Memory,ready,on,mouse,aspect,domAttr,domConstruct,xhr,array,parser,dom){
		var mapa, realtime_ctrl=false, maule_ctrl = false, db = {}, change = [], layer = [], url = {};

		ready(function(){
			//Ejemplo de base de datos...
			db.plantas =  [
				{ plant: "*", value: "*", name: "todas las plantas", selected: true },

				{ plant: "pmaule", value: "pmaule", name: "CMPC-Planta Maule" },
				{ plant: "enap", value: "enap", name: "ENAP" },
				{ plant: "est", value: "est", name: "Oficina EST" },
				];

			db.centros =  [
				{ center: "*", plant: "*", value: "*", name: "Todos los centros", selected: true },

				{ center: "mauleGeneral", plant: "pmaule", value: "mauleGeneral", name: "Maule General" },
				{ center: "gpsEST", plant: "est", value: "gpsEST", name: "GPS Pruebas EST" },
				];

			db.trabajadores =  [
				{ job: "*", center: "*", plant: "*", value: "*", name: "Todos los trabajadores", fEmer: "", fPers: "", cargo: "", antiguedad: "", alergia: "",},
				{ job: "1", center: "mauleGeneral", plant: "pmaule", value: "1", name: "Carlos Hernandez", fEmer: "5641874563", fPers: "56415896745", cargo: "Director Comercial", antiguedad: "20", alergia: "mani",},
				{ job: "job02", center: "gpsEST", plant: "est", value: "job02", name: "Lautaro Silva", fEmer: "133", fPers: "+56950645387", cargo: "Jefe Proyecto", antiguedad: "3 años", alergia: "nada", },
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
				onClick: function (){
					change.pl = true;
					change.ce = false;
					change.tr = false;
				},
				onChange: function(plant){
					if(this.item.plant != "*" && change.pl){
						registry.byId('centro').query.plant = this.item.plant ||  /.*/;
						registry.byId('centro').set('value', this.item ? "*" : null);
						registry.byId('trabajador').query.plant = this.item.plant || /.*/;
						registry.byId('trabajador').set('value', this.item ? "*" : null);
						}
					else if(change.pl){
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
				onClick: function (){
					change.pl = false;
					change.ce = true;
					change.tr = false;
				},
				onChange: function(center){
					if(this.item.center != "*" && change.ce){
						registry.byId('trabajador').query.center = this.item.center || /.*/;
						registry.byId('trabajador').set('value', this.item ? "*" : null);
						registry.byId('planta').set('value', this.item.plant);
						}
					else if(change.ce || change.pl){
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
				onClick: function (){
					change.pl = false;
					change.ce = false;
					change.tr = true;
				},
				onChange: function(center){
					if(this.item.job != "*" && change.tr){
						registry.byId('planta').set('value', this.item.plant);
						registry.byId('centro').set('value', this.item.center);
						}
					}
				}, "trabajador");

			//formulario de seleccion...
			new FilteringSelect({
				id: "plantaQuery",
				value: "*",
				store: new Memory({ idProperty: "value", data: db.plantas }),
				autoComplete: true,
				queryExpr: '*${0}*',
				required: false,
				style: "font-size:90%;"
				}, "plantaQuery").startup();

			new FilteringSelect({
				id: "centroQuery",
				value: "*",
				store: new Memory({ idProperty: "value", data: db.centros }),
				autoComplete: true,
				queryExpr: '*${0}*',
				required: false,
				style: "font-size:90%;"
				}, "centroQuery");

			new FilteringSelect({
				id: "trabajadorQuery",
				value: "*",
				store: new Memory({ idProperty: "value", data: db.trabajadores }),
				autoComplete: true,
				required: false,
				queryExpr: "*${0}*",
				ignoreCase:true,
				style: "font-size:90%;"
				}, "trabajadorQuery");

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
				outputFormat : 'application/json',
				//maxfeatures : 1
				});
			url.GeoJSON = url.owsroot + L.Util.getParamString(prmtGeoJSON);
			console.log(url.GeoJSON);

			//generamos la leyenda inicial (generica)
			domConstruct.create('img', {src: 'images/punto.png', id:'job'}, dom.byId('leyenda'));
			domConstruct.create('br', null, dom.byId('leyenda'));
			domConstruct.create('img', {src: 'images/punto.png',id:'work'}, dom.byId('leyenda'));

			// **** INICIAMOS EL MAPA (LEAFLET) **** //
			//mapa = L.map('map', {center: [-37,-73],zoom: 4}); //Chile
			mapa = L.map('map');

			//fijamos la primera vista....
			mapa.setView([-37,-73],2); //Mundo
			//mapa.setView([-37,-73],4); //Chile
			//mapa.setView([-36.3,-72.3],8); //central
			//mapa.setView([-35.607,-71.588],16); //Planta Maule
			//mapa.setView([-36.780,-73.125],15); //Enap
			//mapa.setView([-36.8395,-73.114], 18)//Oficina EST

			//variables para mapas de google y bing
			var bing = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'Aerial'});
			var bingWL = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'AerialWithLabels'});
			var ggl = new L.Google(), gglH = new L.Google('HYBRID');

			//se agrega al mapa la base seleccionada, en este caso AerialWithLabels de bing. Se agrega el control para cambiar el mapa base
			mapa.addLayer(bingWL);

			//se agregan la capa desde wms (convenientes para edificacion)
			layer.maule = L.tileLayer.wms(url.wmsroot, {
				layers: 'est40516:Edificacion',
				transparent: true,
				format: 'image/png',
				styles: 'PMaule',
				attribution: 'Edificacion',
				crs:L.CRS.EPSG4326,
				opacity: 0.7
			});

			//en caso de hacer click en el mapa, se llama a la funcion ShowWMSLayersInfo
			mapa.off('click', ShowWMSLayersInfo);
			mapa.on('click', ShowWMSLayersInfo); 

			//en caso de seleccionar...
			aspect.after(registry.byId("planta"), "onChange", centrarMapaPlanta, true);
			aspect.after(registry.byId("centro"), "onChange", centrarMapaCN, true);
			aspect.after(registry.byId("trabajador"), "onChange", centrarMapaJob,true);

			layer.control = new L.Control.Layers( {'Bing':bing, 'Bing with Labels':bingWL, 'Google':ggl, 'Google Hibrido':gglH}, {});
			mapa.addControl(layer.control);

			// Create a button programmatically:
			var myButton = new Button({
				label: "Generar Informe",
				onClick: function(){
					dom.byId("result1").innerHTML = "Generar informe para: " + registry.byId("plantaQuery").item.name;
			 		}
				}, "BotonQuery").startup();

		});

		/* Seleccion de mapas */
		function centrarMapaPlanta(valor) {
			var plantaSelect = registry.byId("planta").item.plant;

			//PLano General
			if(plantaSelect === '*' && change.pl){
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);

				maule_ctrl = removeLayer(layer.maule,maule_ctrl);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Planta Maule
			if(plantaSelect === 'pmaule' && change.pl){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 15);

				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl);

				layer.maule.addTo(mapa); //Agregar el palno de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;

				//se agregan datos desde GeoJSON (conveniente para ubicacion en tiempo real de los trabajadores)
				url.GeoJSON = 'http://104.196.40.15:8080/geoserver/est40516/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=est40516:gps1&outputFormat=application/json';

				layer.realtime = realTime(url.GeoJSON);
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('realtime:',db.GeoJSON.properties.id,':',db.GeoJSON.id)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule);
				}

			//Enap
			if(plantaSelect === 'enap' && change.pl){
				mapa.setView([-36.780,-73.125], 15);

				maule_ctrl = removeLayer(layer.maule, maule_ctrl);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Oficina EST
			if(plantaSelect === 'est' && change.pl){
				mapa.setView([-36.8395,-73.114], 18);

				maule_ctrl = removeLayer(layer.maule,maule_ctrl);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			}

		function centrarMapaCN(valor) {
			var centroSelect = registry.byId("centro").item.center;

			//General
			if(centroSelect === '*' && change.ce){
				console.log('centro select *');
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);

				maule_ctrl = removeLayer(layer.maule,maule_ctrl);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Planta Maule
			if(centroSelect === 'mauleGeneral' && change.ce){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 15);

				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl);

				layer.maule.addTo(mapa); //Agregar el palno de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;

				//se agregan datos desde GeoJSON (conveniente para ubicacion en tiempo real de los trabajadores)
				url.GeoJSON = 'http://104.196.40.15:8080/geoserver/est40516/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=est40516%3Agps1&outputFormat=application%2Fjson&maxfeatures=2';

				layer.realtime = realTime(url.GeoJSON);
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('realtime:',db.GeoJSON.properties.id,':',db.GeoJSON.id)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule);
				
				}

			//Oficina EST
			if(centroSelect === 'gpsEST' && change.ce){
				console.log('centro select gpsEST');
				mapa.setView([-36.8395,-73.114], 18);

				maule_ctrl = removeLayer(layer.maule,maule_ctrl);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			}

		function centrarMapaJob(valor) {
			var trabjadorSelect = registry.byId("trabajador").item.job;

			//General
			if(trabjadorSelect === '*' && change.tr){}

			//Carlos Hernandez
			if(trabjadorSelect === '1' && change.tr){
				mapa.fitBounds(layer.realtime.getBounds(), {});
				console.log('trabajador select 1');
				}

			//Lautaro Silva
			if(trabjadorSelect === 'job02' && change.tr){console.log('trabajador select job02');}

			}

		/*remover capa del mapa y de su control */
		var removeLayer = function(remover,ctrl){
			if(ctrl){
				mapa.removeLayer(remover);
				layer.control.removeLayer(remover);
				}
			console.log('activo: ', ctrl);
			return false;
			}

		/*Funciones de Realtime */
		var realTime = function(urlGeoJSON){
			realtime_ctrl = true;
			return L.realtime(
					function(success, error) {
						L.Realtime
							.reqwest({
								url:urlGeoJSON, 
								type:'json'
								})
							.then(function(data) {
								success(xhrGeoJSON(urlGeoJSON));
								})
							.catch(function(err) {
								error(err);
								});
						}, 
					{
						onEachFeature: onEachGeoJSON, 
						pointToLayer: pointToGeoJSON, 
						interval: 10 * 1000
						} 
					);
			}

		var xhrGeoJSON = function(urlGeoJSON){
			var GeoJSON, GeoJSONs;
			var xhrargs = {
				handleAs: "json",
				sync: true,
				error: function() {console.log('error xhr');}
				};

			xhr(urlGeoJSON, xhrargs).then(
				function(jsonData) {
					GeoJSONs = jsonData.features;
					array.forEach(jsonData.features,function(features) {GeoJSON = features;});
					}

				);
			db.GeoJSON = GeoJSON; //var tmp para mostrar en console *
			db.GeoJSONs = GeoJSONs; //var tmp para mostrar en console *
			return GeoJSONs;
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

		/*funciones secundarias */
		function ShowWMSLayersInfo(evt){
			//var urls = getFeatureInfoUrl(mapa,layer.job,evt.latlng,{'info_format': 'text/html'});
			var urls = getFeatureInfoUrl(mapa,layer.maule,evt.latlng,{'info_format': 'text/html'});
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