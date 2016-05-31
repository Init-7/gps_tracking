require([
	"dojo/on", //Captura eventos en objetos ejemplo onChange: function(planta){
	"dojo/mouse", // Captura eventos desde el mouse
	"dijit/layout/BorderContainer", 
    "dojo/fx/Toggler", //custom animation functions
    "dojo/fx",
    "dojo/request", // Carga datos desde la url definida ejemplo: request.get(defaultUrl+ "/gps/plantas/"
    "dojo/store/Memory", // usado adaptar datos obtenidos Json ejemplo store: new Memory({ idProperty: "id", data: data }),
    "dijit/registry", //usado en la busqueda por id ejemplo: registry.byId("negocio").destroyRecursive();
    "dijit/layout/ContentPane", 
    "dijit/form/DateTextBox",
    "dojo/dom",

    "dojo/dom-attr",
    "dijit/layout/AccordionContainer", 
    "dojox/grid/DataGrid",
    "dijit/form/Button",
    "dojo/data/ObjectStore",
    "dojo/dom-construct", // constructor objetos ejemplo: domConstruct.toDom(" <input id='negocio' />");
    "dijit/form/FilteringSelect", // Crear desplegables con información dijit.form.FilteringSelect({
    "dojo/domReady!"
], function(on, mouse,BorderContainer,Toggler, coreFx, request, Memory, registry,ContentPane, DateTextBox,dom,domAttr,AccordionContainer,DataGrid,Button,ObjectStore, domConstruct, FilteringSelect){
   






    //coordenadas de interes...
    var coord = [];
    coord.EST = [-36.778224,-73.080980];
    coord.ENAP = [-36.780,-73.125];
    coord.MAULE = [-35.607,-71.588];
    coord.CENTRAL = [-36.3,-72.3];

    var alerta= false;

    var out2 = [];

    var defaultUrl ="http://cloud1.estchile.cl";
    //var defaultUrl = "localhost:8000";//local
    var defaultUrlGeoServer ="http://104.196.40.15:8080";

    var urlRealTime;

	var map = new L.Map('map', {center: coord.CENTRAL, zoom: 2});

    //TEST MOSTRAR OCULTAR
    var togglerInfoT = new Toggler({
        node: "infoTrabajador",
        showFunc: coreFx.wipeIn,
        hideFunc: coreFx.wipeOut
    });

    var togglerAlerta = new Toggler({
        node: "divALERTAS",
        showFunc: coreFx.wipeIn,
        hideFunc: coreFx.wipeOut
    });


    var togglerRightPanel = new Toggler({
        node: "rightPanel",
        showFunc: coreFx.wipeIn,
        hideFunc: coreFx.wipeOut
    });

    var togglerInfoEdificacion = new Toggler({
        node: "infoEdificacion",
        showFunc: coreFx.wipeIn,
        hideFunc: coreFx.wipeOut
        });

    on(dom.byId("hideButton"), "click", function(e){
        togglerRightPanel.hide();  
    });

    on(dom.byId("showButton"), "click", function(e){
        togglerRightPanel.show();

    });

/********************************************/

        var url = {};
        url.wmsroot = 'http://104.196.40.15:8080/geoserver/est40516/wms';
        url.owsroot = 'http://104.196.40.15:8080/geoserver/est40516/ows';

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



                    

/********************************************/

    /*Lista de Desplegables*/	
    /* Lectura archivo Json Plantas*/
    request.get(defaultUrl+ "/gps/plantas/", {
            handleAs: "json"
        }).then(function(data){
            new dijit.form.FilteringSelect({
            id: "planta",
            store: new Memory({ idProperty: "id", data: data }),
            autoComplete: true,
            //value: data[0].id,          
            style: "width: 150px;",
            onChange: function(planta){ 
                                
                
                var posicion = dijit.byId('planta').get('value');
                var zoom;
                if(data[posicion].name=== "Todos"){zoom=2;}
                else {zoom= 17;}

                if(data[posicion].name=== "Maule"){
                    domAttr.set(dom.byId('work'), "src", url.leyendaPMaule_edificacion);
                    domAttr.set(dom.byId('infoEdificacion'), "src", url.leyendaPMaule_edificacion);
                    togglerInfoEdificacion.show();
                }
                else {  
                    domAttr.set(dom.byId('infoEdificacion'), "src","" );
                    
                    togglerInfoEdificacion.hide();            
                }

                map.addLayer(edificios);
                map.setView([data[posicion].lat,data[posicion].lon], zoom);
                //alert(dijit.byId('planta').get('value'));
                //alert(dijit.byId('planta').get('displayedValue'));  

                /* Lectura archivo Json Negocios*/
                var cn= dijit.byId('planta').get('displayedValue');



                urlRealTime = defaultUrl+"/gps/trabajadores/"+cn+"/puntos2/";


                request.get(defaultUrl+ "/gps/centrosdenegocio/"+cn+"/", {
                        handleAs: "json"
                    }).then(function(data){
                        /* Funcion Buscar si existe registro en caso afirmativo lo elimina 
                        de lo contrario lo crea*/
                        if(typeof registry.byId("negocio") != "undefined"){
                            registry.byId("negocio").destroyRecursive();
                        }
                        var row = domConstruct.toDom(" <input id='negocio' />");
                            domConstruct.place(row, "CN"); // "CN" es la id donde se creará "row"

                        new dijit.form.FilteringSelect({
                            id: "negocio",
                            store: new Memory({idProperty:"id", data: data }),
                            autoComplete: true,
                            style: "width: 150px;",
                            required: true,
                            //value: data[0].id,
                            searchAttr: "name",
                            onChange: function(negocio){   
                                //urlRealTime = "http://localhost:8000/gps/trabajadores/CMMA01/puntos2/";

                                /* Funcion Buscar si existe registro en caso afirmativo lo elimina 
                                de lo contrario lo crea*/
                                

                                       
                                if(typeof registry.byId("trabajador") != "undefined"){
                                    registry.byId("trabajador").destroyRecursive();
                                }
                                var row = domConstruct.toDom(" <input id='trabajador' />");
                                    domConstruct.place(row, "TB"); // "TB" es la id donde se creará "row"

                                /* Lectura archivo Json Trabajadores*/

                                //
                                var tb= dijit.byId('negocio').get('Value');
                                var url2= defaultUrl+ "/gps/trabajadores/"+tb+"/";
                                //console.log(url2);
                                request.get(url2, {
                                    handleAs: "json"
                                }).then(function(data){
                                
                                    new dijit.form.FilteringSelect({
                                        id: "trabajador",
                                        store: new Memory({idProperty: "id", data: data }),
                                        autoComplete: true,
                                        style: "width: 150px;", 
                                        //value: data[0].id,                                   
                                        onChange: function(trabajador){


                                            var posicion = dijit.byId('trabajador').get('value');
                                            map.setView([data[posicion].lat,data[posicion].lon], 18);
                                           /***FUNCION POSICION ACTUALIZADA FUNCIONAL PERO EXISTE TIEMPO DE ESPERA***/
                                            //alert(dijit.byId('trabajador').get('value'));
/*                                          console.log(data);
                                            var url3= defaultUrl+ "/gps/trabajador/"+data[posicion].i+"/";
                                            //console.log(url3);
                                            request.get(url3, {
                                                    handleAs: "json"
                                                }).then(function(data){    
                                                        //console.log(data[0].lat);
                                                        map.setView([data[0].lat,data[0].lon], 18);
                                            });
*/
                                            /**********************/
                                        }
                                    }, "trabajador").startup();

                            });
                            }
                        }, "negocio").startup();
                });
            }
        }, "planta").startup();
    });
    /*Fin Listas Desplegables*/


    var urlINFORME;

        /*consulta informes*/           
    /* Lectura archivo Json Plantas*/
    request.get(defaultUrl+ "/gps/plantas/", {
            handleAs: "json"
        }).then(function(data){
            new dijit.form.FilteringSelect({
            id: "planta2",
            store: new Memory({ idProperty: "id", data: data }),
            autoComplete: true,
            //value: data[0].id,          
            style: "width: 150px;",
            onChange: function(planta2){ 
                var posicion = dijit.byId('planta2').get('value');
                /* Lectura archivo Json Negocios*/
                var cn= dijit.byId('planta2').get('displayedValue');
                request.get(defaultUrl+ "/gps/centrosdenegocio/"+cn+"/", {
                        handleAs: "json"
                    }).then(function(data){
                        /* Funcion Buscar si existe registro en caso afirmativo lo elimina 
                        de lo contrario lo crea*/
                        if(typeof registry.byId("negocio2") != "undefined"){
                            registry.byId("negocio2").destroyRecursive();
                        }
                        var row = domConstruct.toDom(" <input id='negocio2' />");
                            domConstruct.place(row, "CN2"); // "CN" es la id donde se creará "row"

                        new dijit.form.FilteringSelect({
                            id: "negocio2",
                            store: new Memory({idProperty:"id", data: data }),
                            autoComplete: true,
                            style: "width: 150px;",
                            required: true,
                            //value: data[0].id,
                            searchAttr: "name",
                            onChange: function(negocio2){
                                /* Funcion Buscar si existe registro en caso afirmativo lo elimina 
                                de lo contrario lo crea*/
                                       
                                if(typeof registry.byId("trabajador2") != "undefined"){
                                    registry.byId("trabajador2").destroyRecursive();
                                }
                                var row = domConstruct.toDom(" <input id='trabajador2' />");
                                    domConstruct.place(row, "TB2"); // "TB" es la id donde se creará "row"

                                /* Lectura archivo Json Trabajadores*/
                                //
                                var tb= dijit.byId('negocio2').get('Value');
                                var url2= defaultUrl+ "/gps/trabajadores/"+tb+"/";
                                request.get(url2, {
                                    handleAs: "json"
                                }).then(function(data){                                
                                    new dijit.form.FilteringSelect({
                                        id: "trabajador2",
                                        store: new Memory({idProperty: "id", data: data }),
                                        autoComplete: true,
                                        style: "width: 150px;", 
                                        //value: data[0].id,                                   
                                        onChange: function(trabajador2){


                                            
                                            var posicion = dijit.byId('trabajador2').get('value');
                                            //map.setView([data[posicion].lat,data[posicion].lon], 18);                                            

                                            urlINFORME = defaultUrl+"/gps/datosinforme/ESTThno"+"/02/"+data[posicion].i+"/";
                    
                                            //var url3 = "http://localhost:8000/gps/datosinforme/ESTThno/02/29/2016-05-11/2016-05-30/";


                                         }
                                    }, "trabajador2").startup();

                            });
                            }
                        }, "negocio2").startup();
                });
            }
        }, "planta2").startup();
    });
    /*Fin Listas Desplegables*/


/* Informe Fecha */

            on(document.getElementById("qwerty"), "click", function(e){
                    if(typeof registry.byId("gridDiv") != "undefined"){
                            registry.byId("gridDiv").destroyRecursive();
                        }
                    var row = domConstruct.toDom("<div id='gridDiv'>    </div>");
                            domConstruct.place(row, "divFecha");
                    var grid, dataStore;
                    var fechaFF,fechaII;
                    
                    // get value
                    fechaII = date1.value
                    //fechaII = "2016-03-01";
                    fechaFF = date2.value
                    //fechaFF = "2016-09-10";
                    var url3 = urlINFORME+ fechaII +"/"+ fechaFF+"/";
                    
                    //var url3 = "http://localhost:8000/gps/datosinforme/ESTThno/02/29/2016-05-11/2016-05-30/";
                    request.get(url3, {
                        handleAs: "json"
                    }).then(function(data){
                        dataStore =  new ObjectStore({ objectStore:new Memory({ data: data }) });
                        grid = new DataGrid({
                            store: dataStore,
                            query: { id: "*" },
                            queryOptions: {},
                            structure: [//nombre columnas
                                { name: "Nombre", field: "name", width: "50%" },
                                { name: "Tiempo", field: "id", width: "25%" }
                                //{ name: "Horas", field: "horas", width: "25%" },
                                //{ name: "Minutos", field: "minutos", width: "25%" }
                            ]
                        }//).placeAt("gridDiv");
                        ,"gridDiv");
                        grid.startup(); 
                    });
                    console.log(url3);
            });

/****TODO MAPA*****/

    var osm = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

    var ctb = new L.tileLayer.wms('http://demo.opengeo.org/geoserver/ows?', {
        layers: 'ne:ne_10m_admin_0_countries,ne:ne_10m_admin_0_boundary_lines_land'});

    var zonas = new L.LayerGroup();

    var trabajadores = new L.LayerGroup();
    
/*
        L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.').addTo(zonas),
        L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.').addTo(zonas),
        L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.').addTo(zonas),
        L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.').addTo(zonas);
*/
//Primera Forma de mostrar los edificios
    //var tempUrl= defaultUrlGeoServer+ 
    var edificios = new L.tileLayer.wms(defaultUrlGeoServer+'/geoserver/wms?', {
                layers: 'est40516:Edificacion',
                transparent: true,
                format: 'image/png',
                //styles: 'PMaule',
                //attribution: 'Edificacion',
                crs:L.CRS.EPSG4326,
                opacity: 0.7
                }
        );






    var styles = [{
          featureType: 'all',
          stylers: [{hue: '#ff0000'}]
        }];

    var ggl = new L.Google('HYBRID', {
            mapOptions: {
            //styles: styles
        }});

    var overlays = {//Capa con marcadores 
            "Zonas": zonas,
            "Construcciones": edificios,
            "Trabajadores": trabajadores

        };

    //L.control.layers(baseLayers,overlays).addTo(map);

    map.addLayer(ggl);
    lcontrol = L.control.layers({'OSM':osm, 
        'Google':ggl, 
        'Countries, then boundaries':ctb
    }, overlays).addTo(map);
    
  
    /**********************************/
    function popUpPersona(f,l){//Consulta por cada uno de los objetos     
         

        //console.log(f.geometry.coordinates);//
        //console.log(f);
        l.bindPopup("<div id='wrapperCard'><img id='logoEstCard' src='./images/estchile.png' ><img id='imgQRCard' src='./images/estchile.png' ><div id='datosTrabajadorCard'><b>Nombre : </b>"+f.properties["nombre"]+"</br><b>Cargo : </b>"+f.properties["cargo"]+"</br><b>Fono : </b>"+f.properties["fono"]+"</br><b>Riesgo : </b>"+f.properties["nivel_riesgo"]+"</br><b>Fono Emergencia : </b>"+f.properties["nro_emergencia"]+"</br><b>Contacto : </b>"+f.properties["tipo_contacto"]+"</br></div><img id='imgTrabajadorCard' src="+defaultUrl+"/gps_tracking/src/"+f.properties["foto"]+"></div>"); 

        if(f.properties["nivel_riesgo"] < 5 ){
            l.setIcon(hombreAmarillo);}
        if(f.properties["nivel_riesgo"] < 2 ){
            l.setIcon(hombreNormal);}        
        if(f.properties["nivel_riesgo"] >= 5 ){
            alerta=true;
            l.setIcon(hombreRojo);
            togglerAlerta.show();            

            out2.push( "<p>"+f.properties["nombre"]+"</p>");
            //document.getElementById("aviso").innerHTML = out2;
            //out2.join("<br />");          
        }
        
        //console.log(f.properties["nivel_riesgo"]);w
        l.on('dblclick', onClick);
        l.addTo(trabajadores);
    }

    function onClick(e) {
        var tempLatLng =this.getLatLng();    
        map.setView([tempLatLng.lat,tempLatLng.lng], 18);
        //map.removeControl();
    }   

    function popUpEdificios(f,l){
        var out = [];
        if (f.properties){
            for(key in f.properties){
                out.push( "<b>"+  key+"</b>"+" : "+f.properties[key]);
            }
            l.bindPopup(out.join("<br />"));
        }
        l.addTo(zonas);
    }


    /********ICONOS PERSONALIZADO***************/
    var LeafIcon = L.Icon.extend({
                options: {
                    //shadowUrl: './images/leaf-shadow.png',
                    iconSize:     [25, 50],
                    //shadowSize:   [50, 64],
                    iconAnchor:   [12, 50],
                    //shadowAnchor: [4, 62],
                    popupAnchor:  [0, -46]
                }
            });

    var hombreNormal = new LeafIcon({iconUrl: './images/ico/marker.png'}),
        hombreAmarillo = new LeafIcon({iconUrl: './images/ico/alerta.png'}),
        hombreRojo = new LeafIcon({iconUrl: './images/ico/peligro.png'});
    ///////////////****************////////////////

    //L.marker([51.5, -0.09], {icon: hombreNormal}).addTo(map).bindPopup("I am a green leaf.");

   

    //urlRealTime = "http://localhost:8000/gps/ESTThno/EST08/puntos2/";
    var urlRealTime = defaultUrl+"/gps/puntos3/";
    realtime = L.realtime({
            url: urlRealTime,
            crossOrigin: true,
            type: 'json'
        }, 
        {
            interval: 20* 1000
        ,        
        onEachFeature:popUpPersona
    }).addTo(map);

    realtime.on('update', function() {//
        if(!alerta) {
            togglerAlerta.hide();
            //console.log(alerta);
        }
        //console.log("PASO");
        //console.log(out2);
        console.log(urlRealTime);
        alerta=false;

        document.getElementById("divALERTAS").innerHTML = "<div id='aviso'><img id='alertaImg' src='./images/ico/Alerta.png'><h2>¡¡ALERTA!!</h1>"+out2+"</div> ";
        var temp = [];
        out2= temp;



    });

    map.addLayer(zonas);
    map.addLayer(trabajadores);


    var urlGeoserverEdificios= defaultUrlGeoServer+"/geoserver/est40516/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=est40516:est_zona&maxFeatures=50&outputFormat=application%2Fjson";
    var jsonTest = new L.GeoJSON.AJAX([urlGeoserverEdificios/*,"counties.geojson"*/],{onEachFeature:popUpEdificios}).addTo(map);
});