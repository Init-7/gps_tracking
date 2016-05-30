require([
	"dojo/fx/Toggler", //custom animation functions
	"dojo/fx",
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
	function(Toggler, coreFx, AccordionContainer,BorderContainer,ContentPane,FilteringSelect,Button,DateTextBox,registry,Memory,ready,on,mouse,aspect,domAttr,domConstruct,xhr,array,parser,dom){
		var mapa, change = [], layer = [], cont = 0;

		//TEST MOSTRAR OCULTAR
		var togglerInfoT = new Toggler({
				    node: "infoT",
				    showFunc: coreFx.wipeIn,
				    hideFunc: coreFx.wipeOut
				  });
		var togglerShowButton = new Toggler({
				    node: "hideButton",
				    showFunc: coreFx.wipeIn,
				    hideFunc: coreFx.wipeOut
				  });

		var togglerRightPanel = new Toggler({
		    node: "rightPanel",
		    showFunc: coreFx.wipeIn,
		    hideFunc: coreFx.wipeOut
		  	});

		on(dom.byId("hideButton"), "click", function(e){
		    	togglerRightPanel.hide();
		    	
		});
		on(dom.byId("showButton"), "click", function(e){
		    	togglerRightPanel.show();
		    	togglerShowButton.hide();

	  	});

		//control de capas...
		var ctrl = [];
		ctrl.feaktime = false;
		ctrl.gps = false;
		ctrl.maule = false; 
		ctrl.maule_heatmap = false;
		ctrl.maule_cluster= false;
		ctrl.est_cluster= false;
		//Falta implementar
		//ctrl.est_heatmap = false;

		//coordenadas de interes...
		var coord = [];
		coord.EST = [-36.778224,-73.080980];
		coord.ENAP = [-36.780,-73.125];
		coord.MAULE = [-35.607,-71.588];
		coord.CENTRAL = [-36.3,-72.3];

		//Ejemplo de base de datos...
		var db = {};
		db.plantas =  [
			{ plant: "*", value: "*", name: "Todas las plantas", selected: true },

			{ plant: "est", value: "est", name: "Oficina EST" },
			{ plant: "pmaule", value: "pmaule", name: "CMPC-Planta Maule" },
			{ plant: "enap", value: "enap", name: "ENAP" },
			];

		db.centros =  [
			{ center: "*", plant: "*", value: "*", name: "Todos los centros", selected: true },

			{ center: "gpsEST", plant: "est", value: "gpsEST", name: "GPS Pruebas EST" },
			{ center: "mauleGeneral", plant: "pmaule", value: "mauleGeneral", name: "Maule General" },
			];

		db.trabajadores =  [
			{ job: "*", center: "*", plant: "*", value: "*", name: "Todos los trabajadores", fEmer: "", fPers: "", cargo: "", nivel_riesgo: "", alergia: "",},

			{ job: "1", center: "gpsEST", plant: "est", value: "1", name: "Carlos Hernandéz", fEmer: "133", fPers: "+56950645387", cargo: "Director EST", nivel_riesgo: "5", alergia: "nada", },
			{ job: "21", center: "gpsEST", plant: "est", value: "21", name: "Lautaro Silva", fEmer: "133", fPers: "+56950645387", cargo: "Jefe Proyecto", nivel_riesgo: "4", alergia: "todo", },

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
			{ job: "50011", center: "mauleGeneral", plant: "pmaule", value: "50011", name: "Pablo Rojas Soto", fEmer: "Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},
			{ job: "50012", center: "mauleGeneral", plant: "pmaule", value: "50012", name: "Jorge Emanuel Gajardo Muñoz", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
			{ job: "50013", center: "mauleGeneral", plant: "pmaule", value: "50013", name: "Juan Carlos Gonzalez Gonzalez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
			{ job: "50014", center: "mauleGeneral", plant: "pmaule", value: "50014", name: "Patricio Dominguez", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "3", alergia: "Sin Información",},
			{ job: "50015", center: "mauleGeneral", plant: "pmaule", value: "50015", name: "Joshua Roan Cisterna Molina", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "2", alergia: "Sin Información",},
			{ job: "50016", center: "mauleGeneral", plant: "pmaule", value: "50016", name: "Hector Rebolledo Cuevas", fEmer: " Sin Información", fPers: " Sin Información", cargo: "Sin Información", nivel_riesgo: "1", alergia: "Sin Información",},
			];

		db.alertas =  [
			{ 
				job: "1", 
				value: "1", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "21", 
				value: "21", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50001", 
				value: "50001", 
				enviadas: " <b> S.O.S!! </b> Posible incidente.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50002", 
				value: "50002", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50003", 
				value: "50003", 
				enviadas: " <b> S.O.S!! </b> Posible incidente..<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs",
				recibidas: "Mensaje: entrando a zona peligrosa, fuera de su aréa.<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs",
			},{ 
				job: "50004", 
				value: "50004",  
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50005", 
				value: "50005", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50006", 
				value: "50006", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50007", 
				value: "50007", 
				enviadas: " <b> S.O.S!! </b> Posible incidente.",  
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50008", 
				value: "50008", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50009", 
				value: "50009", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50010", 
				value: "50010", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50011", 
				value: "50011", 
				enviadas: " - Ninguna.",
				recibidas: "Mensaje: entrando a zona peligrosa, fuera de su aréa.<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs",
			},{ 
				job: "50012", 
				value: "50012", 
				enviadas: " - sin alertas registradas.",
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50013", 
				value: "50013", 
				enviadas: " <b> S.O.S!! </b> Posible incidente..<br />Fecha: Mie feb 23, 2016<br /> Hora: 14:50:00 Hrs", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50014", 
				value: "50014", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50015", 
				value: "50015", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},{ 
				job: "50016", 
				value: "50016", 
				enviadas: " - sin alertas registradas.", 
				recibidas: " - sin alertas registradas.",
			},
			];

		//urls del servidor de mapas
		var url = {};
		url.wmsroot = 'http://104.196.40.15:8080/geoserver/est40516/wms';
		url.owsroot = 'http://104.196.40.15:8080/geoserver/est40516/ows';

		//Funcion para preparar la solicitudad de carga de los datos desde el servidor Layers
		function cargarDatos(Layer,Style) {
			var temp;
			return temp = L.Util.extend({
					request: 'GetLegendGraphic',
					version:'1.1.0',
					transparent: true,
					format:'image/png',
					width:'20',
					height:'20',
					legend_options:'forceLabels:on',
					layer:Layer,
					opacity:'0.1',
					style: Style
			});
		}		
		url.leyendaPMaule_edificacion = url.wmsroot + L.Util.getParamString(cargarDatos('est40516:Edificacion','PMaule'));
		url.leyendaPMaule_heatmap = url.wmsroot + L.Util.getParamString(cargarDatos('est40516:fakepeople','heatmap'));	
		url.leyendaTrabajador = url.wmsroot + L.Util.getParamString(cargarDatos('est40516:distinto','JOB_Peligro'));		
		url.leyendaGPS = url.wmsroot + L.Util.getParamString(cargarDatos('est40516:distinto','Trabajador'));

		//Funcion para preparar la solicitudad de carga de los datos desde el servidor Layers

		function cargarDatosWFS(TypeName,Style) {
			var temp;
			return  temp = L.Util.extend({
				service : 'WFS',
				version : '1.0.0',
				request : 'GetFeature',
				typeName : TypeName,
				outputFormat : 'application/json',
				style : Style
				//maxfeatures : 50
			});
		}	
		url.GeoJSON = url.owsroot  + L.Util.getParamString(cargarDatosWFS('est40516:distinto', 'JOB_Peligro'));
		url.fakeGeoJSON = url.owsroot  + L.Util.getParamString(cargarDatosWFS('est40516:fakepeople', 'JOB_Peligro'));
		
		ready(function(){
			//formulario de seleccion...

			new FilteringSelect({
				id: "planta",
				value: "*",
				store: new Memory({ idProperty: "value", data: db.plantas }),
				autoComplete: true,
				queryExpr: '*${0}*',
				required: false,
				//style: "font-size:100%;",
				onClick: function (){
					change.pl = true;
					change.ce = false;
					change.tr = false;
				},
				onChange: function(plant){
					if(this.item.plant != "*" && change.pl){//Si la planta es distinta a todas las plantas Y pl es verdadero
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
				//style: "font-size:90%;",
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

			console.log(url.GeoJSON);
			console.log(url.fakeGeoJSON);

			// **** INICIAMOS EL MAPA (LEAFLET) **** //
			mapa = L.map('map');

			//fijamos la primera vista....
			mapa.setView(coord.CENTRAL,2);

			//variables para mapas de google y bing
			layer.bing = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'Aerial'});
			layer.bingWL = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: 'AerialWithLabels'});
			layer.ggl = new L.Google();
			layer.gglH = new L.Google('HYBRID');

			//se agrega al mapa la base seleccionada, en este caso AerialWithLabels de bing.
			mapa.addLayer(layer.bingWL);
			layer.control = new L.Control.Layers( {'Bing':layer.bing, 'Bing with Labels':layer.bingWL, 'Google':layer.ggl, 'Google Hibrido':layer.gglH}, {});
			mapa.addControl(layer.control);

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

			//filtros para visualizar...
			aspect.after(registry.byId("planta"), "onChange", showJob_Planta);
			aspect.after(registry.byId("centro"), "onChange", showJob_CN);
			aspect.after(registry.byId("trabajador"), "onChange", showJob);

			// crear botones para consultas:
			new Button({label: "Ver riesgo",onClick: heatMap}, "BtnHeatmap").startup();
			new Button({label: "Clustering",onClick: markerCluster}, "BtnCluster").startup();
			new Button({label: "Tiempo en Planta",onClick: plantTime}, "BtnTiempoEnPlanta").startup();
			//new DateTextBox({id: "myFromDate", onChange: function (){myToDate.constraints.min = arguments[0];}},fromDate).startup();
			//new DateTextBox({id: "myToDate", onChange: function (){myFromDate.constraints.max = arguments[0];}},toDate).startup();

			//filtros para consultas...
			aspect.after(registry.byId("plantaQuery"), "onChange", query_Planta);
			aspect.after(registry.byId("centroQuery"), "onChange", query_CN);
			aspect.after(registry.byId("trabajadorQuery"), "onChange", query_Job);
		});

		/* Seleccion de mapas */
		function showJob_Planta(valor) {if(change.pl){
			var Planta = registry.byId("planta").item.plant;

			//limpiamos mapas...
			ctrl.maule_heatmap = removeLayer(layer.heatmap,ctrl.maule_heatmap,false);
			ctrl.maule_cluster = removeLayer(layer.markers,ctrl.maule_cluster,false);
			ctrl.est_cluster = removeLayer(layer.markers,ctrl.est_cluster,false);
			ctrl.maule = removeLayer(layer.maule,ctrl.maule,false);
			ctrl.feaktime = removeLayer(layer.realtime,ctrl.feaktime,true);
			ctrl.gps = removeLayer(layer.gps,ctrl.gps,true);
			domConstruct.destroy("aviso");

			//PLano General
			if(Planta === '*'){
				//centramos mapas en un plano general
				mapa.setView(coord.CENTRAL, 8);
				//limpiamos la leyenda
				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				togglerInfoT.hide();
				}

			//Oficina EST
			if(Planta === 'est'){
				mapa.setView(coord.EST, 18);
				/**/
				ctrl.gps = true;
				layer.gps = realTime(url.GeoJSON,'ALL').addTo(mapa).bringToFront().on('update', function(e) {console.log('gps est: ',cont++)});
				layer.control.addOverlay(layer.gps,'GPS');

				domAttr.set(dom.byId('job'), "src", url.leyendaGPS);
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			//Planta Maule
			if(Planta === 'pmaule'){
				//centramos mapas en la planta
				mapa.setView(coord.MAULE, 16);

				//domConstruct.create('span', {id:'aviso', innerHTML:'6 trabajadores en estado de alto riesgo!<br /> Alertas enviadas'}, dom.byId('divALERTAS'));

				layer.maule.addTo(mapa); //Agregar la capa de la planta al mapa
				layer.maule.bringToFront(); //traer capa al frente
				layer.control.addOverlay(layer.maule,'Planta Maule');  //Agregar al control
				ctrl.maule = true;
				/**/
				ctrl.feaktime = true;
				layer.realtime = realTime(url.fakeGeoJSON,'ALL');
				layer.realtime.addTo(mapa);
				layer.realtime.bringToFront(); //traer capa al frente
				layer.realtime.on('update', function(e) {console.log('rt planta pmaule: ',cont++)});

				layer.control.addOverlay(layer.realtime,'Trabajadores');
				//domAttr.set(dom.byId('logoMap'), "src", url.leyendaTrabajador);

//ACA VOY
				
				  
				  
						  				  
				domAttr.set(dom.byId('infoT'), "src", url.leyendaTrabajador);

    			togglerInfoT.show();
  	 
				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				}

			//Enap
			if(Planta === 'enap'){
				mapa.setView(coord.ENAP, 15);

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				
				//togglerInfoT.hide();			

				}
			}};

		function showJob_CN(valor) {if(change.ce){
			var Centro_negocio = registry.byId("centro").item.center;

			ctrl.maule_heatmap = removeLayer(layer.heatmap,ctrl.maule_heatmap,false);
			ctrl.maule_cluster = removeLayer(layer.markers,ctrl.maule_cluster,false);
			ctrl.est_cluster = removeLayer(layer.markers,ctrl.est_cluster,false);
			ctrl.maule = removeLayer(layer.maule,ctrl.maule,false);
			ctrl.feaktime = removeLayer(layer.realtime,ctrl.feaktime,true);
			ctrl.gps = removeLayer(layer.gps,ctrl.gps,true);
			domConstruct.destroy("aviso");

			if(Centro_negocio === '*'){
				mapa.setView([-36.3,-72.3], 8);
				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			if(Centro_negocio === 'gpsEST'){
				mapa.setView(coord.EST, 18);

				ctrl.gps = true;
				layer.gps = realTime(url.GeoJSON,'ALL').addTo(mapa).bringToFront().on('update', function(e) {console.log('rt cn est: ',cont++)});
				layer.control.addOverlay(layer.gps,'GPS');

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			if(Centro_negocio === 'mauleGeneral'){
				mapa.setView(coord.MAULE, 16);

				//domConstruct.create('span', {id:'aviso', innerHTML:'6 trabajadores en estado de alto riesgo!<br /> Alertas enviadas'}, dom.byId('divALERTAS'));

				layer.maule.addTo(mapa).bringToFront();
				layer.control.addOverlay(layer.maule,'Planta Maule');
				ctrl.maule = true;

				ctrl.feaktime = true;
				layer.realtime = realTime(url.fakeGeoJSON,'ALL').addTo(mapa).bringToFront().on('update', function(e) {console.log('rt cn pmaule: ',cont++)});
				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				}
			}};

		function showJob(valor) {if(change.tr){
			var jobId = registry.byId("trabajador").item.job;
			var planta = registry.byId("trabajador").item.plant;

			ctrl.maule_heatmap = removeLayer(layer.heatmap,ctrl.maule_heatmap,false);
			ctrl.maule_cluster = removeLayer(layer.markers,ctrl.maule_cluster,false);
			ctrl.est_cluster = removeLayer(layer.markers,ctrl.est_cluster,false);
			ctrl.maule = removeLayer(layer.maule,ctrl.maule,false);
			ctrl.feaktime = removeLayer(layer.realtime,ctrl.feaktime,true);
			ctrl.gps = removeLayer(layer.gps,ctrl.gps,true);
			domConstruct.destroy("aviso");

			if(planta == '*'){
				mapa.setView([-36.3,-72.3],8);
				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			if(planta == 'est'){
				mapa.setView(coord.EST, 18);

				var zoom = true;
				ctrl.gps = true;
				layer.gps = realTime(url.GeoJSON,jobId).addTo(mapa).bringToFront().on('update', function(e) {
					if(zoom) mapa.fitBounds(layer.gps.getBounds());
					zoom = false;
					console.log('rt job est: ',cont++);
					});
				layer.control.addOverlay(layer.gps,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}

			if(planta == 'pmaule'){
				mapa.setView(coord.MAULE, 18);

				if(registry.byId("trabajador").item.nivel_riesgo == '3')
					domConstruct.create('span', {id:'aviso', innerHTML:'Trabajador en estado de alto riesgo!<br /> Alerta enviada'}, dom.byId('divALERTAS'));

				ctrl.maule = true;
				layer.maule.addTo(mapa).bringToFront();
				layer.control.addOverlay(layer.maule,'Planta Maule'); 

				var zoom = true;
				ctrl.feaktime = true;

				layer.realtime = realTime(url.fakeGeoJSON,jobId).addTo(mapa).bringToFront().on('update', function(e) {
					if(zoom) mapa.fitBounds(layer.realtime.getBounds());
					zoom = false;
					console.log('rt job pmaule: ',cont++);
					});
				layer.control.addOverlay(layer.realtime,'Trabajadores');

				domAttr.set(dom.byId('job'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
				}

			if(planta == 'enap'){
				mapa.setView(coord.ENAP, 15);
				domAttr.set(dom.byId('job'), "src", 'images/punto.png');
				domAttr.set(dom.byId('work'), "src", 'images/punto.png');
				}
			}};

		/*Funciones de Realtime */
		var realTime = function(urlGeoJSON,ID){
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
						});
					}

				);

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

		/* Seleccion de mapas */
		function query_Planta(valor) {
			var Planta = registry.byId("plantaQuery").item.plant;

			ctrl.maule_heatmap = removeLayer(layer.heatmap,ctrl.maule_heatmap,false);
			ctrl.maule_cluster = removeLayer(layer.markers,ctrl.maule_cluster,false);
			ctrl.est_cluster = removeLayer(layer.markers,ctrl.est_cluster,false);
			ctrl.maule = removeLayer(layer.maule,ctrl.maule,false);
			ctrl.feaktime = removeLayer(layer.realtime,ctrl.feaktime,true);
			ctrl.gps = removeLayer(layer.gps,ctrl.gps,true);
			domConstruct.destroy("aviso");

			domAttr.set(dom.byId('jobHM'), "src", 'images/punto.png');
			domAttr.set(dom.byId('workHM'), "src", 'images/punto.png');
			dom.byId("resultHeatmap").innerHTML = "planta: " + registry.byId("plantaQuery").item.name;

			if(Planta === '*'){
				mapa.setView(coord.CENTRAL, 8);
				layer.control.removeLayer(layer.maule);
				}

			if(Planta === 'pmaule'){
				mapa.setView(coord.MAULE, 16);
				layer.control.addOverlay(layer.maule,'Planta Maule');
				}

			if(Planta === 'enap'){
				mapa.setView(coord.ENAP, 15);
				layer.control.removeLayer(layer.maule);
				}

			if(Planta === 'est'){
				mapa.setView(coord.EST, 18);
				layer.control.removeLayer(layer.maule);
				}
			};

		/* mapa de calor */
		var heatMap =  function (){
			var planta = registry.byId("plantaQuery").item.plant;

			ctrl.maule_heatmap = removeLayer(layer.heatmap,ctrl.maule_heatmap,false);
			ctrl.maule_cluster = removeLayer(layer.markers,ctrl.maule_cluster,false);
			ctrl.est_cluster = removeLayer(layer.markers,ctrl.est_cluster,false);
			ctrl.maule = removeLayer(layer.maule,ctrl.maule,false);
			ctrl.feaktime = removeLayer(layer.realtime,ctrl.feaktime,true);
			ctrl.gps = removeLayer(layer.gps,ctrl.gps,true);
			domConstruct.destroy("aviso");

			if(planta == 'pmaule'){
				ctrl.maule_heatmap = true;
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
				layer.heatmap.addTo(mapa).bringToFront();
				layer.control.addOverlay(layer.heatmap,'heatmap');

				layer.realtime = realTime(url.fakeGeoJSON,'ALL').addTo(mapa).bringToFront().on('update', function(e) {console.log('heatmap: ',cont++)});
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

		/* markerCluster */
		var markerCluster =  function (){
			var planta = registry.byId("plantaQuery").item.plant;

			ctrl.maule_heatmap = removeLayer(layer.heatmap,ctrl.maule_heatmap,false);
			ctrl.maule_cluster = removeLayer(layer.markers,ctrl.maule_cluster,false);
			ctrl.est_cluster = removeLayer(layer.markers,ctrl.est_cluster,false);
			ctrl.maule = removeLayer(layer.maule,ctrl.maule,false);
			ctrl.feaktime = removeLayer(layer.realtime,ctrl.feaktime,true);
			ctrl.gps = removeLayer(layer.gps,ctrl.gps,true);
			domConstruct.destroy("aviso");

			if(planta == 'pmaule'){
				ctrl.maule_cluster = true;

				/*Marker cluster*/
				layer.markers = L.markerClusterGroup({ singleMarkerMode: true, spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false});
				layer.markers.addLayer(L.geoJson(xhrGeoJSON(url.fakeGeoJSON,'ALL'), {onEachFeature: function (feature, layer) {layer.bindPopup(feature.properties.nivel_ries);}})).addTo(mapa);
				layer.markers.on('click', function (a) {
					console.log('marker ' + a.layer);
					});

				layer.markers.on('clusterclick', function (a) {
					// a.layer is actually a cluster
					console.log('cluster ' + a.layer.getAllChildMarkers().length);
					});
				layer.control.addOverlay(layer.markers,'Trabajadores');
				/*fin de marker cluster*/

				domAttr.set(dom.byId('jobHM'), "src", url.leyendaTrabajador);
				domAttr.set(dom.byId('workHM'), "src", 'images/punto.png');
				dom.byId("resultHeatmap").innerHTML = "";
				}
			else if(planta == 'est'){
				layer.markers = L.markerClusterGroup({ spiderfyOnMaxZoom: false, showCoverageOnHover: false, zoomToBoundsOnClick: false });
				ctrl.est_cluster = true;

				function populate() {
					for (var i = 0; i < 30; i++) {
						var m = L.marker(getRandomLatLng(mapa));
						layer.markers.addLayer(m);
					}
					return false;
				}
				function getRandomLatLng(mapa) {
					var bounds = mapa.getBounds(),
						southWest = bounds.getSouthWest(),
						northEast = bounds.getNorthEast(),
						lngSpan = northEast.lng - southWest.lng,
						latSpan = northEast.lat - southWest.lat;

					return L.latLng(
							southWest.lat + latSpan * Math.random(),
							southWest.lng + lngSpan * Math.random());
				}

				layer.markers.on('clusterclick', function (a) {
					a.layer.spiderfy();
				});

				populate();
				mapa.addLayer(layer.markers);
				}
			else {
				domAttr.set(dom.byId('jobHM'), "src", 'images/punto.png');
				domAttr.set(dom.byId('workHM'), "src", 'images/punto.png');
				dom.byId("resultHeatmap").innerHTML = "sin datos";
				};

			};
		/* consultas */
		function query_CN(valor) {}
		function query_Job(valor) {}

		/*** funciones secundarias ***/

		//remover capa del mapa y de su control
		var removeLayer = function(layerRemove,ctrl,ifRealTime){
			if(ctrl){
				mapa.removeLayer(layerRemove);
				layer.control.removeLayer(layerRemove);
				if(ifRealTime)layerRemove.stop();
				}
			return false;
			}

		function ShowWMSLayersInfo(evt){
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
				//srs: layer._crs.code,
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
					}
				});
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
			dom.byId("divInfoGPS").innerHTML = inner;
			if(change.tr)mapa.fitBounds(layer.realtime.getBounds());
			}

		function plantTime() {
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
			if(registry.byId("trabajadorQuery").item.value == '*') dom.byId("resultJob").innerHTML = "Seleccione un trabajador";
			else if(registry.byId("fromDate").value == 'Invalid Date') dom.byId("resultJob").innerHTML = "Seleccione fecha inicial";
			else if(registry.byId("toDate").value == 'Invalid Date') dom.byId("resultJob").innerHTML = "Seleccione fecha final";
			else dom.byId("resultJob").innerHTML = inner;
			};

		function enDesarrollo() {};
		});
/*END*/