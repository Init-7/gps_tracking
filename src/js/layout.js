dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.ContentPane");

dojo.require("dijit.form.Button");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.HorizontalRuleLabels");

dojo.require("dojox.form.RangeSlider");
dojo.require("dojox.form.DropDownSelect");
dojo.require("dojox.form.CheckedMultiSelect");

dojo.require("dojo.domReady!");
dojo.require("dojo.parser");
dojo.require("dojo.number");
dojo.require("dojo.data.ObjectStore");
dojo.require("dojo.store.Memory");


//Edificaciones/Areas con su riesgos:
// http://104.196.40.15:8080/geoserver/est40516/wms?service=WMS&version=1.1.0&request=GetMap&styles=&bbox=-71.59356418337775,-35.609444896273274,-71.5824568379388,-35.605179045497955&width=768&height=330&srs=EPSG:4326&format=application/openlayers&layers=est40516:Edificacion

//people:
// http://104.196.40.15:8080/geoserver/est40516/wms?service=WMS&version=1.1.0&request=GetMap&styles=&bbox=808860.7101161322,6054190.876024606,809239.8662073202,6054295.726372454&width=768&height=330&srs=EPSG:32718&format=application/openlayers&layers=est40516:people

/*-----------------------------------------------------------------------------------------*/
/*  ------------------------------         INIT()          ------------------------------  */
/*-----------------------------------------------------------------------------------------*/

var db = {};
var mapas = {};

var url = {};
           url.central = 'http://104.196.40.15:8080/geoserver/est40516/wms';
 url.leyendaTrabajador = 'http://104.196.40.15:8080/geoserver/est40516/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:on&LAYER=est40516:people&style=Trabajador'
url.leyendaEdificacion = 'http://104.196.40.15:8080/geoserver/est40516/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:on&LAYER=est40516:Edificacion&style=Edificacion';
     url.leyendaPMaule = 'http://104.196.40.15:8080/geoserver/est40516/wms?REQUEST=GetLegendGraphic&VERSION=1.1.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LEGEND_OPTIONS=forceLabels:on&LAYER=est40516:Edificacion&style=PMaule';

function init() {
	//Generamos formulario de seleccion
	Slct();

	mapas.central = L.map('map', {center: [-36.3,-72.3],zoom: 8});

	//mapas.PlantaMaule = L.map('map', {center: [-35.607,-71.588],zoom: 16}); //Planta Maule
	//mapas.ENAP = L.map('map', {center: [-36.780,-73.125],zoom: 15}); //Enap
	//mapas.OficEST = L.map('map', {center: [-36.8395,-73.114],zoom: 18}); //Oficina EST
	//mapas.Chile = L.map('map', {center: [-37,-73],zoom: 4}); //Chile
	
	// for all possible values and explanations see "Template Parameters" in https://msdn.microsoft.com/en-us/library/ff701716.aspx
	var imagerySet = 'Aerial'; // AerialWithLabels | Birdseye | BirdseyeWithLabels | Road
	var bing = new L.BingLayer('LfO3DMI9S6GnXD7d0WGs~bq2DRVkmIAzSOFdodzZLvw~Arx8dclDxmZA0Y38tHIJlJfnMbGq5GXeYmrGOUIbS2VLFzRKCK0Yv_bAl6oe-DOc', {type: imagerySet});

	var ggl = new L.Google();
	var gglH = new L.Google('HYBRID');

	//mapas.central.addLayer(bing);
	mapas.central.addLayer(gglH);
	//mapas.central.addLayer(ggl);
	//mapas.central.addControl(new L.Control.Layers( {'Bing':bing, 'Google':ggl, 'Google Hibrido':gglH}, {}));
	mapas.central.addControl(new L.Control.Layers( {'Google':ggl, 'Google Hibrido':gglH}, {}));
	//L.Control.Layers( {'Google Hibrido':gglH, 'Google':ggl}, {}).addTo(mapas.central);

	L.tileLayer.wms(url.central, {
		layers: 'est40516:Edificacion',
		transparent: true,
		format: 'image/png',
		styles: 'PMaule'
		}).addTo(mapas.central);

	/**/
	L.tileLayer.wms(url.central, {
		layers: 'est40516:people',
		transparent: true,
		format: 'image/png',
		styles: 'Trabajador'
		}).addTo(mapas.central);

	/*genera leyenda*/
	getLegend();

	/*FILTROS*/
	dojo.connect(dijit.byId("planta"), "onChange", actFiltros);
	dojo.connect(dijit.byId("centro"), "onChange", actFiltros);
	dojo.connect(dijit.byId("trabajador"), "onChange", actFiltros);
	/*fin*/
	}

/*-----------------------------------------------------------------------------------------*/
/*  ------------------------------         Slct()          ------------------------------  */
/*-----------------------------------------------------------------------------------------*/


//Filtros...
function actFiltros(valor) {
	//vectores de Filtro
	var vecPlanta = dijit.byId("planta").get("value");
	console.log(vecPlanta);
	if(vecPlanta === '*'){mapas.central.setView([-36.3,-72.3], 8);
		dojo.attr(dojo.byId('work'), "src", url.leyendaEdificacion);
		}
	if(vecPlanta === '01'){
		mapas.central.setView([-35.607,-71.588], 16);
		dojo.attr(dojo.byId('work'), "src", url.leyendaPMaule);
		}
	if(vecPlanta === '02'){mapas.central.setView([-36.780,-73.125], 15);
		dojo.attr(dojo.byId('work'), "src", url.leyendaEdificacion);
		}
	}


function Slct() {
	db.plantas =  [
		{ plant: "*", value: "*", name: "todas las plantas", selected: true },

		{ plant: "01", value: "01", name: "CMPC-Planta Maule" },
		{ plant: "02", value: "02", name: "ENAP" },
		];

	db.centros =  [
		{ center: "*", plant: "*", value: "*", name: "Todos los centros", selected: true },

		{ center: "01-201507", plant: "01", value: "01-201507", name: "Contrato Fibra Mecánico" },
		{ center: "01-201508", plant: "01", value: "01-201508", name: "Contrato Bodega de Repuestos" },
		];

	db.trabajadores =  [
		{ job: "*", center: "*", plant: "*", value: "*", name: "Todos los trabajadores"},
		{ job: "job-0501", center: "01-201507", plant: "01", value: "job-0501", name: "Fredy Nuñez" },
		{ job: "job-0502", center: "01-201507", plant: "01", value: "job-0502", name: "Felipe Salinas" },

		{ job: "job-0506", center: "01-201508", plant: "01", value: "job-0506", name: "Juan Carlos Gonzalez" },
		{ job: "job-0507", center: "01-201508", plant: "01", value: "job-0507", name: "Jorge Gajardo" },
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
				dijit.byId('centro').query.plant = this.item.plant || /.*/;
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
		style: "font-size:90%;"
		}, "trabajador");
	}

//Crear DIV para logo en el mapa
function getLegend() {
	dojo.create('img', {src: url.leyendaTrabajador, id:'job'}, dojo.byId('leyenda'));
	dojo.create('br', null, dojo.byId('leyenda'));
	dojo.create('img', {src: url.leyendaEdificacion,id:'work'}, dojo.byId('leyenda'));
	}

//dojo ready init
dojo.ready(init);


