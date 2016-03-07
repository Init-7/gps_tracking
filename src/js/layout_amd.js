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
		var mapa, realtime_ctrl=false, maule_ctrl = false, maule_heatmap = false, db = {}, change = [], layer = [], url = {}, cont = 0;

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
				{ job: "*", center: "*", plant: "*", value: "*", name: "Todos los trabajadores", fEmer: "", fPers: "", cargo: "", nivel_riesgo: "", alergia: "",},
				{ job: "1", center: "mauleGeneral", plant: "pmaule", value: "1", name: "Pablo Rojas Soto", fEmer: "Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "??", alergia: "Sin Información",},
				{ job: "5", center: "mauleGeneral", plant: "pmaule", value: "5", name: "Jorge Emanuel Gajardo Muñoz", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "4", alergia: "Sin Información",},
				{ job: "6", center: "mauleGeneral", plant: "pmaule", value: "6", name: "Juan Carlos Gonzalez Gonzalez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "4", alergia: "Sin Información",},
				{ job: "7", center: "mauleGeneral", plant: "pmaule", value: "7", name: "Patricio Dominguez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "4", alergia: "Sin Información",},
				{ job: "8", center: "mauleGeneral", plant: "pmaule", value: "8", name: "Joshua Roan Cisterna Molina", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "2", alergia: "Sin Información",},
				{ job: "9", center: "mauleGeneral", plant: "pmaule", value: "9", name: "Hector Rebolledo Cuevas", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},
				{ job: "job02", center: "gpsEST", plant: "est", value: "job02", name: "Lautaro Silva", fEmer: "133", fPers: "+56950645387", cargo: "Jefe Proyecto", nivel_riesgo: "3", alergia: "nada", },
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

			//formulario de consultas...
			new FilteringSelect({
				id: "plantaQuery",
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
						registry.byId('centroQuery').query.plant = this.item.plant ||  /.*/;
						registry.byId('centroQuery').set('value', this.item ? "*" : null);
						registry.byId('trabajadorQuery').query.plant = this.item.plant || /.*/;
						registry.byId('trabajadorQuery').set('value', this.item ? "*" : null);
						}
					else if(change.pl){
						registry.byId('centroQuery').query.plant = /.*/;
						registry.byId('centroQuery').set('value', this.item ? "*" : null);
						registry.byId('trabajadorQuery').query.plant = /.*/;
						registry.byId('trabajadorQuery').set('value', this.item ? "*" : null);
						}
					}
				}, "plantaQuery").startup();

			new FilteringSelect({
				id: "centroQuery",
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
						registry.byId('trabajadorQuery').query.center = this.item.center || /.*/;
						registry.byId('trabajadorQuery').set('value', this.item ? "*" : null);
						registry.byId('plantaQuery').set('value', this.item.plant);
						}
					else if(change.ce || change.pl){
						registry.byId('trabajadorQuery').query.center = /.*/;
						registry.byId('trabajadorQuery').set('value', this.item ? "*" : null);
						}
					}
				}, "centroQuery");

			new FilteringSelect({
				id: "trabajadorQuery",
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
						registry.byId('plantaQuery').set('value', this.item.plant);
						registry.byId('centroQuery').set('value', this.item.center);
						}
					}
				}, "trabajadorQuery");

			//generamos url de servicios de mapas, desde el servidor...
			var ParamLydPMaule_edificacion = L.Util.extend({
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
			url.leyendaPMaule_edificacion = url.wmsroot + L.Util.getParamString(ParamLydPMaule_edificacion);

			var ParamLydPMaule_heatmap = L.Util.extend({
				request:'GetLegendGraphic',
				version:'1.1.0',
				format:'image/png',
				width:'20',
				height:'20',
				legend_options:'forceLabels:on',
				layer:'est40516:distinto',
				opacity:'0.3',
				style:'heatmap'
				});
			url.leyendaPMaule_heatmap = url.wmsroot + L.Util.getParamString(ParamLydPMaule_heatmap);

			var ParamLydTrab = L.Util.extend({
				request:'GetLegendGraphic',
				version:'1.1.0',
				format:'image/png',
				width:'20',
				height:'20',
				legend_options:'forceLabels:on',
				layer:'est40516:distinto',
				style:'Trabajador'
				});
			url.leyendaTrabajador = url.wmsroot + L.Util.getParamString(ParamLydTrab);

			var ParamGeoJSON = L.Util.extend({
				service : 'WFS',
				version : '1.0.0',
				request : 'GetFeature',
				typeName : 'est40516:distinto',
				outputFormat : 'application/json',
				//maxfeatures : 50
				});
			url.GeoJSON = url.owsroot + L.Util.getParamString(ParamGeoJSON);
			console.log(url.GeoJSON);

			//generamos la leyenda inicial (generica)
			domConstruct.create('img', {src: 'images/punto.png', id:'job'}, dom.byId('leyenda'));
			domConstruct.create('br', null, dom.byId('leyenda'));
			domConstruct.create('img', {src: 'images/punto.png',id:'work'}, dom.byId('leyenda'));
			//HEatMAp
			domConstruct.create('img', {src: 'images/punto.png', id:'jobHM'}, dom.byId('leyendaHeatmap'));
			domConstruct.create('br', null, dom.byId('leyendaHeatmap'));
			domConstruct.create('img', {src: 'images/punto.png',id:'workHM'}, dom.byId('leyendaHeatmap'));

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
			aspect.after(registry.byId("planta"), "onChange", selectJob_Planta, true);
			aspect.after(registry.byId("centro"), "onChange", selectJob_CN, true);
			aspect.after(registry.byId("trabajador"), "onChange", selectJob,true);

			//en caso de seleccionar...
			aspect.after(registry.byId("plantaQuery"), "onChange", query_Planta, true);
			aspect.after(registry.byId("centroQuery"), "onChange", query_CN, true);
			aspect.after(registry.byId("trabajadorQuery"), "onChange", query_Job,true);


			layer.control = new L.Control.Layers( {'Bing':bing, 'Bing with Labels':bingWL, 'Google':ggl, 'Google Hibrido':gglH}, {});
			mapa.addControl(layer.control);

			// Create a button programmatically:
			var myButton = new Button({
				label: "Ver riesgo",
				onClick: heatMap
				}, "BotonHeatmap").startup();

		});

		/* Seleccion de mapas */
		function selectJob_Planta(valor) {
			var plantaSelect = registry.byId("planta").item.plant;

			//PLano General
			if(plantaSelect === '*' && change.pl){
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Planta Maule
			if(plantaSelect === 'pmaule' && change.pl){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 15);
				url.GeoJSON = 'http://localhost:8000/gps/Maule/puntos/';

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				layer.maule.addTo(mapa); //Agregar el palno de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;

				layer.realtime = realTime(url.GeoJSON,'ALL');
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt planta pmaule: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				}

			//Enap
			if(plantaSelect === 'enap' && change.pl){
				mapa.setView([-36.780,-73.125], 15);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				maule_ctrl = removeLayer(layer.maule, maule_ctrl);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Oficina EST
			if(plantaSelect === 'est' && change.pl){
				mapa.setView([-36.8395,-73.114], 18);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			}

		function selectJob_CN(valor) {
			var centroSelect = registry.byId("centro").item.center;

			//General
			if(centroSelect === '*' && change.ce){
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Planta Maule
			if(centroSelect === 'mauleGeneral' && change.ce){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 15);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				layer.maule.addTo(mapa); //Agregar el palno de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;

				layer.realtime = realTime(url.GeoJSON,'ALL');
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt cn pmaule: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				
				}

			//Oficina EST
			if(centroSelect === 'gpsEST' && change.ce){
				mapa.setView([-36.8395,-73.114], 18);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			}

		function selectJob(valor) {
			var jobId = registry.byId("trabajador").item.job;
			//mapa.fitBounds(layer.realtime.getBounds(), {});}

			if(registry.byId("trabajador").item.plant == 'pmaule'){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 15);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				layer.maule.addTo(mapa); //Agregar el palno de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);

				layer.realtime = realTime(url.GeoJSON,jobId);
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt job pmaule: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');
				}

			if(registry.byId("trabajador").item.plant == 'enap'){
				//centramos mapas en la planta
				mapa.setView([-36.780,-73.125], 15);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');

				layer.realtime = realTime(url.GeoJSON,jobId);
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt job enap: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');
				}

			if(registry.byId("trabajador").item.plant == 'est'){
				//centramos mapas en la planta
				mapa.setView([-36.8395,-73.114], 18);

				maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
				maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
				realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');

				layer.realtime = realTime(url.GeoJSON,jobId);
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt job est: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');
				}
			}


		/* Seleccion de mapas */
		function query_Planta(valor) {
			var plantaSelect = registry.byId("plantaQuery").item.plant;

			//PLano General
			if(plantaSelect === '*'){
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);
				}

			//Planta Maule
			if(plantaSelect === 'pmaule'){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 15);
				layer.control.addOverlay(layer.maule,'Planta Maule');
				}

			//Enap
			if(plantaSelect === 'enap'){
				mapa.setView([-36.780,-73.125], 15);
				}

			//Oficina EST
			if(plantaSelect === 'est'){
				mapa.setView([-36.8395,-73.114], 18);
				}
			};

		/* Seleccion de mapas */
		var heatMap =  function (){

			maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
			maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
			realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);

			dom.byId("result1").innerHTML = "Mapa de calor con areas de riesgo: " + registry.byId("plantaQuery").item.name;
			if(registry.byId("plantaQuery").item.plant == 'pmaule'){
				maule_heatmap = true;

				layer.heatmap = L.tileLayer.wms(url.wmsroot, {
					layers: 'est40516:distinto',
					transparent: true,
					format: 'image/png',
					styles: 'heatmap',
					srs: 'EPSG:4326',
					opacity: 1,
					service: 'WMS',
					version: '1.1.0',
					request: 'GetMap'
					});
				layer.heatmap.addTo(mapa);
				layer.heatmap.bringToFront();
				layer.control.addOverlay(layer.heatmap,'heatmap');

				layer.realtime = realTime(url.GeoJSON,'ALL');
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('heatmap: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('jobHM'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('workHM'), "src", url.leyendaPMaule_heatmap);
				}
			else {
				mapa.setView([-36.3,-72.3], 8);
				domAttr.set(dom.byId('jobHM'), "src", 'images/punto.png');
				domAttr.set(dom.byId('workHM'), "src", 'images/punto.png');
				};
		};

		/* Seleccion de mapas */
		function query_CN(valor) {}
		function query_Job(valor) {}

		/*remover capa del mapa y de su control */
		var removeLayer = function(remover,ctrl,ifRealTime){
			if(ctrl){
				mapa.removeLayer(remover);
				layer.control.removeLayer(remover);
				if(ifRealTime)remover.stop();
				}
			return false;
			}

		/*Funciones de Realtime */
		var realTime = function(urlGeoJSON,ID){
			realtime_ctrl = true;
			return L.realtime(
					function(success, error) {
						L.Realtime
							.reqwest({
								url:urlGeoJSON, 
								type:'json'
								})
							.then(function(data) {
								success(xhrGeoJSON(urlGeoJSON,ID));
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

		var xhrGeoJSON = function(urlGeoJSON,ID){
			var GeoJSON, GeoJSONs;
			var xhrargs = {
				handleAs: "json",
				sync: true,
				error: function() {console.log('error xhr');}
				};

			xhr(urlGeoJSON, xhrargs).then(
				function(jsonData) {
					GeoJSONs = jsonData.features;
					array.forEach(jsonData.features,function(features) {if(features.properties.deviceId==ID)GeoJSON = features;});
					}

				);
			db.GeoJSON = GeoJSON; //var tmp para mostrar en console *
			db.GeoJSONs = GeoJSONs; //var tmp para mostrar en console *
			if(ID == 'ALL'){
				return GeoJSONs;
				}
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
						'Nivel de riesgo: '+ job.nivel_riesgo + ' <br />'+
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
			}

		});
/*END*/