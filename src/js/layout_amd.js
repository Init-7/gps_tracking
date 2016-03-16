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
				{ job: "1", center: "mauleGeneral", plant: "pmaule", value: "1", name: "Pablo Rojas Soto", fEmer: "Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},
				{ job: "5", center: "mauleGeneral", plant: "pmaule", value: "5", name: "Jorge Emanuel Gajardo Muñoz", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
				{ job: "6", center: "mauleGeneral", plant: "pmaule", value: "6", name: "Juan Carlos Gonzalez Gonzalez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
				{ job: "7", center: "mauleGeneral", plant: "pmaule", value: "7", name: "Patricio Dominguez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
				{ job: "8", center: "mauleGeneral", plant: "pmaule", value: "8", name: "Joshua Roan Cisterna Molina", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "2", alergia: "Sin Información",},
				{ job: "9", center: "mauleGeneral", plant: "pmaule", value: "9", name: "Hector Rebolledo Cuevas", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},

				{ job: "50001", center: "mauleGeneral", plant: "pmaule", value: "50001", name: "Patricio Alejandro Benavides YaÃ±ez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "0", alergia: "Sin Información",},
				{ job: "50002", center: "mauleGeneral", plant: "pmaule", value: "50002", name: "Bruno Jean Paul Cifuentes Pereira", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "0", alergia: "Sin Información",},
				{ job: "50003", center: "mauleGeneral", plant: "pmaule", value: "50003", name: "Francisco Ignacio Diaz Diaz", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
				{ job: "50004", center: "mauleGeneral", plant: "pmaule", value: "50004", name: "Bayron Jeremy Diaz Godoy", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},
				{ job: "50005", center: "mauleGeneral", plant: "pmaule", value: "50005", name: "Luis Patricio Fernandoy Acevedo", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},
				{ job: "50006", center: "mauleGeneral", plant: "pmaule", value: "50006", name: "Fredy Alonzo NuÃ±ez Gonzalez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
				{ job: "50007", center: "mauleGeneral", plant: "pmaule", value: "50007", name: "Maximiliano Benjamin Oses Iglesias", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "2", alergia: "Sin Información",},
				{ job: "50008", center: "mauleGeneral", plant: "pmaule", value: "50008", name: "Jose Isaac Quijada Roa", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "2", alergia: "Sin Información",},
				{ job: "50009", center: "mauleGeneral", plant: "pmaule", value: "50009", name: "Felipe Ignacio Salinas Jara", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},
				{ job: "50010", center: "mauleGeneral", plant: "pmaule", value: "50010", name: "Ignacio Alejandro Torres Gonzalez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
				{ job: "job02", center: "gpsEST", plant: "est", value: "job02", name: "Lautaro Silva", fEmer: "133", fPers: "+56950645387", cargo: "Jefe Proyecto", nivel_riesgo: "3", alergia: "nada", },
				];

			db.alertas =  [
				{ 
					job: "1", 
					value: "1", 
					enviadas: " - Ninguna.",
					recibidas: "Mensaje: entrando a zona peligrosa, fuera de su aréa.<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs",
				},
				{ 
					job: "5", 
					value: "5", 
					enviadas: " - sin alertas registradas.",
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "6", 
					value: "6", 
					enviadas: " <b> S.O.S!! </b> Posible incidente..<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "7", 
					value: "7", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "8", 
					value: "8", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "9", 
					value: "9", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50001", 
					value: "50001", 
					enviadas: " <b> S.O.S!! </b> Posible incidente.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50002", 
					value: "50002", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50003", 
					value: "50003", 
					enviadas: " <b> S.O.S!! </b> Posible incidente..<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs",
					recibidas: "Mensaje: entrando a zona peligrosa, fuera de su aréa.<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs",
				},
				{ 
					job: "50004", 
					value: "50004",  
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50005", 
					value: "50005", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50006", 
					value: "50006", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50007", 
					value: "50007", 
					enviadas: " <b> S.O.S!! </b> Posible incidente.",  
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50008", 
					value: "50008", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50009", 
					value: "50009", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "50010", 
					value: "50010", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
				{ 
					job: "job02", 
					value: "job02", 
					enviadas: " - sin alertas registradas.", 
					recibidas: " - sin alertas registradas.",
				},
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
						registry.byId('planta').set('value', this.item.plant);
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
				onChange: function(job){
					if(change.tr){
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
						registry.byId('plantaQuery').set('value', this.item.plant);
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
				onChange: function(job){
					if(change.tr){
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
				//layer:'est40516:distinto',
				layer:'est40516:fakepeople',
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
				style:'JOB_Peligro'
				});
			url.leyendaTrabajador = url.wmsroot + L.Util.getParamString(ParamLydTrab);

			var ParamGeoJSON = L.Util.extend({
				service : 'WFS',
				version : '1.0.0',
				request : 'GetFeature',
				typeName : 'est40516:distinto',
				//typeName : 'est40516:fakepeople',
				outputFormat : 'application/json',
				style : 'JOB_Peligro'
				//maxfeatures : 50
				});
			url.GeoJSON = url.owsroot + L.Util.getParamString(ParamGeoJSON);
			console.log(url.GeoJSON);

			var FakeGeoJSON = L.Util.extend({
				service : 'WFS',
				version : '1.0.0',
				request : 'GetFeature',
				typeName : 'est40516:fakepeople',
				outputFormat : 'application/json',
				style : 'JOB_Peligro'
				//maxfeatures : 50
				});
			url.fakeGeoJSON = url.owsroot + L.Util.getParamString(FakeGeoJSON);
			console.log(url.fakeGeoJSON);

			//generamos la leyenda inicial (generica)
			domConstruct.create('p', {innerHTML:'Trabajadores:'}, dom.byId('leyenda'));
			domConstruct.create('img', {src: 'images/punto.png', id:'job'}, dom.byId('leyenda'));
			domConstruct.create('p', {innerHTML:'Edificacion:'}, dom.byId('leyenda'));
			domConstruct.create('img', {src: 'images/punto.png',id:'work'}, dom.byId('leyenda'));
			//HEatMAp
			domConstruct.create('p', {innerHTML:'Trabajadores:'}, dom.byId('leyendaHeatmap'));
			domConstruct.create('img', {src: 'images/punto.png', id:'jobHM'}, dom.byId('leyendaHeatmap'));
			domConstruct.create('p', {innerHTML:'Edificacion:'}, dom.byId('leyendaHeatmap'));
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
			var BtnHeatmap = new Button({
				label: "Ver riesgo",
				onClick: heatMap
				}, "BtnHeatmap").startup();
			var BtnTiempoEnPlanta = new Button({
				label: "Tiempo en Planta",
				onClick: enDesarrollo
				}, "BtnTiempoEnPlanta").startup();
		});

		/* Seleccion de mapas */
		function selectJob_Planta(valor) {if(change.pl){
			var Planta = registry.byId("planta").item.plant;

			//limpiamos mapas...
			maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
			maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
			realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);
			domConstruct.destroy("aviso");

			//PLano General
			if(Planta === '*'){
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Planta Maule
			if(Planta === 'pmaule'){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 16);
				//url.fakeGeoJSON = 'http://104.196.40.15:8000/gps/Maule/puntos/';

				domConstruct.create('span', {id:'aviso', innerHTML:'6 trabajadores en estado de alto riesgo!<br /> Alertas enviadas'}, dom.byId('ALERTOIDE'));

				layer.maule.addTo(mapa); //Agregar el palno de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;
				/**/
				layer.realtime = realTime(url.fakeGeoJSON,'ALL');
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt planta pmaule: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				}

			//Enap
			if(Planta === 'enap'){
				mapa.setView([-36.780,-73.125], 15);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Oficina EST
			if(Planta === 'est'){
				mapa.setView([-36.8395,-73.114], 18);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			}};

		function selectJob_CN(valor) {if(change.ce){
			var Centro_negocio = registry.byId("centro").item.center;

			maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
			maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
			realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);
			domConstruct.destroy("aviso");

			//General
			if(Centro_negocio === '*'){
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Planta Maule
			if(Centro_negocio === 'mauleGeneral'){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 16);

				domConstruct.create('span', {id:'aviso', innerHTML:'6 trabajadores en estado de alto riesgo!<br /> Alertas enviadas'}, dom.byId('ALERTOIDE'));

				layer.maule.addTo(mapa); //Agregar el plano de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;

				layer.realtime = realTime(url.fakeGeoJSON,'ALL');
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt cn pmaule: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				
				}

			//Oficina EST
			if(Centro_negocio === 'gpsEST'){
				mapa.setView([-36.8395,-73.114], 18);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			}};

		function selectJob(valor) {
			var jobId = registry.byId("trabajador").item.job;
			var planta = registry.byId("trabajador").item.plant;

			maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
			maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
			realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);
			domConstruct.destroy("aviso");

			if(planta == '*'){
				//centramos mapas en la planta
				mapa.setView([-36.3,-72.3],8); //central

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			if(planta == 'pmaule'){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 16);

				if(registry.byId("trabajador").item.nivel_riesgo == '3')domConstruct.create('span', {id:'aviso', innerHTML:'Trabajador en estado de alto riesgo!<br /> Alerta enviada'}, dom.byId('ALERTOIDE'));

				layer.maule.addTo(mapa); //Agregar el palno de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				maule_ctrl = true;

				layer.realtime = realTime(url.fakeGeoJSON,jobId);
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				var zoom = true;
				layer.realtime.on('update', function(e) {
					if (zoom) mapa.fitBounds(layer.realtime.getBounds());
					zoom = false;
					console.log('rt job pmaule: ',cont++);
					});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				}

			if(planta == 'enap'){
				//centramos mapas en la planta
				mapa.setView([-36.780,-73.125], 15);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			if(planta == 'est'){
				//centramos mapas en la planta
				mapa.setView([-36.8395,-73.114], 18);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			};

		/* Seleccion de mapas */
		function query_Planta(valor) {
			var Planta = registry.byId("plantaQuery").item.plant;

			maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
			maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
			realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);
			domConstruct.destroy("aviso");

			domAttr.set(dom.byId('jobHM'), "src", 'images/punto.png');
			domAttr.set(dom.byId('workHM'), "src", 'images/punto.png');
			dom.byId("resultHeatmap").innerHTML = "Mapa de calor con areas de riesgo: " + registry.byId("plantaQuery").item.name;

			//PLano General
			if(Planta === '*'){
				//centramos mapas en un plano general
				mapa.setView([-36.3,-72.3], 8);
				layer.control.removeLayer(layer.maule);
				}

			//Planta Maule
			if(Planta === 'pmaule'){
				//centramos mapas en la planta
				mapa.setView([-35.607,-71.588], 16);
				layer.control.addOverlay(layer.maule,'Planta Maule');
				}

			//Enap
			if(Planta === 'enap'){
				mapa.setView([-36.780,-73.125], 15);
				layer.control.removeLayer(layer.maule);
				}

			//Oficina EST
			if(Planta === 'est'){
				mapa.setView([-36.8395,-73.114], 18);
				layer.control.removeLayer(layer.maule);
				}
			};

		/* Seleccion de mapas */
		var heatMap =  function (){
			var planta = registry.byId("plantaQuery").item.plant;

			maule_heatmap = removeLayer(layer.heatmap,maule_heatmap,false);
			maule_ctrl = removeLayer(layer.maule,maule_ctrl,false);
			realtime_ctrl = removeLayer(layer.realtime,realtime_ctrl,true);
			domConstruct.destroy("aviso");

			if(planta == 'pmaule'){
				maule_heatmap = true;
				layer.heatmap = L.tileLayer.wms(url.wmsroot, {
					//layers: 'est40516:distinto',
					layers: 'est40516:fakepeople',
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

				layer.realtime = realTime(url.fakeGeoJSON,'ALL');
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('heatmap: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('jobHM'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('workHM'), "src", url.leyendaPMaule_heatmap);
				dom.byId("resultHeatmap").innerHTML = "Mapa de calor con areas de riesgo: " + registry.byId("plantaQuery").item.name;
				}
			else {
				domAttr.set(dom.byId('jobHM'), "src", 'images/punto.png');
				domAttr.set(dom.byId('workHM'), "src", 'images/punto.png');
				dom.byId("resultHeatmap").innerHTML = "Mapa de calor con areas de riesgo: " + registry.byId("plantaQuery").item.name + " Sin Datos";
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
			var GeoJSON, GeoJSONs, GeoJSONcn;
			var xhrargs = {
				handleAs: "json",
				sync: true,
				error: function() {console.log('error xhr');}
				};

			xhr(urlGeoJSON, xhrargs).then(
				function(jsonData) {
					GeoJSONs = jsonData.features;
					array.forEach(jsonData.features,function(features) {
						if(features.properties.deviceId==ID)GeoJSON = features;
						//if(features.properties.cnId==cnID)GeoJSONcn =+ features;
						});
					}

				);
			//db.GeoJSON = GeoJSON; //var tmp para mostrar en console *
			//db.GeoJSONs = GeoJSONs; //var tmp para mostrar en console *
			//db.GeoJSONcn = GeoJSONcn; //var tmp para mostrar en console *
			if(ID == 'ALL'){return GeoJSONs;}
			if(ID == 'CN'){return GeoJSONcn;}
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
			if(feature.properties.nivel_ries=='3')return L.circleMarker(
				latlng, 
				{
					radius: 14,
					fillColor: "#ff0000",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 1
					}
				);
			if(feature.properties.nivel_ries=='2')return L.circleMarker(
				latlng, 
				{
					radius: 11,
					fillColor: "#ffff00",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 1
					}
				);
			if(feature.properties.nivel_ries=='1')return L.circleMarker(
				latlng, 
				{
					radius: 8,
					fillColor: "#00ff00",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 1
					}
				);
			if(feature.properties.nivel_ries=='0')return L.circleMarker(
				latlng, 
				{
					radius: 5,
					fillColor: "#ffffff",
					color: "#000",
					weight: 1,
					opacity: 1,
					fillOpacity: 1
					}
				);
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

			dom.byId("divInfoDB").innerHTML = '';
			dom.byId("divInfoGPS").innerHTML = '';
			dom.byId("divInfoWMS").innerHTML = inner;
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
						'Telefono emergencia: '+ job.fEmer + ' <br />'+
						'Alergias: '+ job.alergia + ' <br />'+
						'Cargo: '+ job.cargo + ' <br />'+
						'Nivel de riesgo: '+ job.nivel_riesgo + ' <br />'+
						'Centro de Negocio: '+ job.center + ' <br />'+
						'Planta: '+ job.plant + ' <br /><br />';
					}
				});

			array.forEach(db.alertas,function(alerta) {
				if (alerta.job == jobID) {
					inner = inner + 
						'<h2 style="align:center"> Historial de alertas</h2>' +
						'<b>enviadas</b>:<br />'+ alerta.enviadas + '<br /><br />'+
						'<b>recibidas</b>:<br />'+ alerta.recibidas + '<br /><br />';
						//' - mie feb 23, 2015 14:50:00 Hrs: entrando a zona peligrosa, fuera de su aréa<br />'+
					}
				});
			//domAttr.set(dom.byId('divInfoDB'), "innerHTML", inner);
			dom.byId("divInfoDB").innerHTML = inner;

		}

		function divInfoGPS(features){
			var inner = '<h2 style="align:center"> Datos GPS </h2>' +
				'ID (prop): '+ features.properties.deviceId + ' <br />'+
				'ID (GPS): '+ features.properties.id + ' <br />'+
				'Fecha: '+ features.properties.deviceTime + '<br />'+
				'Latitud: '+ features.properties.lat + ' <br />'+
				'Longitud: '+ features.properties.lon + ' <br />'+
				'Direccion: '+ features.properties.address + ' (aprox.) <br />'+
				'ID (interno): '+ features.id + 
				' <br /><br />';
			//domAttr.set(dom.byId('divInfoGPS'), "innerHTML", inner);
			dom.byId("divInfoGPS").innerHTML = inner;
			if(change.tr)mapa.fitBounds(layer.realtime.getBounds());
			}

		function enDesarrollo() {
			//dom.byId("resultJob").innerHTML = "FUNCION EN DESARROLLO"
			var inner = '<h2 style="align:center"> Tiempo en planta:<br />9 hrs, 17 min </h2>' +
				'<b>Bodega:</b> 4 hrs, 17 min  <br />'+
				'<b>Casino:</b> 0 hrs, 43 min  <br />'+
				'<b>Patio Bodega:</b> 0 hrs, 26 min  <br />'+
				'<b>Bodega:</b> 3 hrs, 47 min  <br />'+
				'<b>Portería:</b> 0 hrs, 10 min  <br />'+
				'---------------------  <br />'+
				'<b>Total: 9 hrs, 17 min</b> <br />'+
				'<br />'+
				'<h4 style="align:center"> Tiempo en zonas peligrosas</h4>' +
				'<b>Sin Peligro:</b> 0 hrs, 10 min  <br />'+
				'<b>Peligro bajo:</b> 1 hrs, 09 min  <br />'+
				'<b>Peligro medio:</b> 8 hrs, 04 min  <br />'+
				'<b>Peligro alto:</b> 0 hrs, 0 min  <br />';

			//domAttr.set(dom.byId('divInforme'), "innerHTML", inner);
			if(registry.byId("trabajadorQuery").item.value == '*') dom.byId("resultJob").innerHTML = "Seleccione un trabajador";
			else if(registry.byId("fromDate").value == 'Invalid Date') dom.byId("resultJob").innerHTML = "Seleccione fecha inicial";
			else if(registry.byId("toDate").value == 'Invalid Date') dom.byId("resultJob").innerHTML = "Seleccione fecha final";
			else dom.byId("resultJob").innerHTML = inner;
			};
		});
/*END*/