require([
	"dojo/on", //Captura eventos en objetos ejemplo onChange: function(planta){
	"dojo/mouse", // Captura eventos desde el mouse
	"dojo/request", // Carga datos desde la url definida ejemplo: request.get(defaultUrl+ "/gps/plantas/"
    "dojo/store/Memory", // usado adaptar datos obtenidos Json ejemplo store: new Memory({ idProperty: "id", data: data }),
    "dijit/registry", //usado en la busqueda por id ejemplo: registry.byId("negocio").destroyRecursive();
        "dijit/layout/ContentPane", 
        "dijit/form/DateTextBox",

    "dijit/layout/AccordionContainer", 
            "dojox/grid/DataGrid",
    "dijit/form/Button",
            "dojo/data/ObjectStore",
    "dojo/dom-construct", // constructor objetos ejemplo: domConstruct.toDom(" <input id='negocio' />");
    "dijit/form/FilteringSelect", // Crear desplegables con información dijit.form.FilteringSelect({
    "dojo/domReady!"
], function(on, mouse, request, Memory, registry,ContentPane, DateTextBox,AccordionContainer,DataGrid,Button,ObjectStore, domConstruct, FilteringSelect){
    var defaultUrl ="http://localhost:8000";
	


    /*Lista de Desplegables*/			
    /* Lectura archivo Json Plantas*/
    request.get(defaultUrl+ "/gps/plantas/", {
            handleAs: "json"
        }).then(function(data){
        new dijit.form.FilteringSelect({
            id: "planta",
            store: new Memory({ idProperty: "id", data: data }),
            autoComplete: true,          
            style: "width: 150px;",
            onChange: function(planta){  
                //alert(dijit.byId('planta').get('value'));
                //alert(dijit.byId('planta').get('displayedValue'));  

                /* Lectura archivo Json Negocios*/
                var cn= dijit.byId('planta').get('displayedValue');
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
                            searchAttr: "name",
                            onChange: function(negocio){                    
                                /* Funcion Buscar si existe registro en caso afirmativo lo elimina 
                                de lo contrario lo crea*/

                                if(typeof registry.byId("trabajador") != "undefined"){
                                    registry.byId("trabajador").destroyRecursive();
                                }
                                var row = domConstruct.toDom(" <input id='trabajador' />");
                                    domConstruct.place(row, "TB"); // "TB" es la id donde se creará "row"

                                /* Lectura archivo Json Trabajadores*/
                                var tb= dijit.byId('negocio').get('Value');
                                var url= defaultUrl+ "/gps/trabajadores/"+tb+"/";
                                request.get(url, {
                                    handleAs: "json"
                                }).then(function(data){
                                
                                new dijit.form.FilteringSelect({
                                    id: "trabajador",
                                    store: new Memory({idProperty: "id", data: data }),
                                    autoComplete: true,
                                    style: "width: 150px;",
                                    onChange: function(trabajador){
                                       //dijit.byId('negocio').query.planta = this.item.planta || /.*/;             
                                        //alert(dijit.byId('trabajador').get('value'));
                                        //alert(dijit.byId('trabajador').get('displayedValue'));
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
                    //var url = "http://localhost:8000/gps/datosinforme/ESTThno/2/22/"+ fechaII +"/"+ fechaFF+"/";
                    
                    var url = "http://localhost:8000/gps/datosinforme/ESTThno/02/29/2016-05-11/2016-05-30/";
                    request.get(url, {
                        handleAs: "json"
                    }).then(function(data){
                        dataStore =  new ObjectStore({ objectStore:new Memory({ data: data }) });
                        grid = new DataGrid({
                            store: dataStore,
                            query: { id: "*" },
                            queryOptions: {},
                            structure: [//nombre columnas
                                { name: "Nombre", field: "name", width: "50%" },
                                { name: "ID", field: "id", width: "25%" }
                                //{ name: "Horas", field: "horas", width: "25%" },
                                //{ name: "Minutos", field: "minutos", width: "25%" }
                            ]
                        }//).placeAt("gridDiv");
                        ,"gridDiv");
                        grid.startup(); 
                    });
                    console.log(url);
            });




   


});
