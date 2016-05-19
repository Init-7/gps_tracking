var trabajadores = [{"name": "TB Maule","cn": "1", "planta": "1"}, {"name": "TB ESTThno 1","cn": "2", "planta": "2"}, {"name": "TB Enap","cn": "3", "planta": "3"}];

/*
var negocios = [{"name": "CN Maule", "planta": "1","cn": "1"}, {"name": "Maule ESTThno 1", "planta": "2","cn": "2"}, {"name": "CN ESTThno 2", "planta": "2","cn": "2"}, {"name": "CN Enap", "planta": "3","cn": "3"}]
;

var plantas =  [{"name": "Maule", "planta": "1"}, {"name": "ESTThno", "planta": "2"}, {"name": "Enap", "planta": "3"}];
*/
require([
	"dojo/on", 
	"dojo/mouse",
	"dojo/data/ObjectStore",
	"dojo/request",
    "dojo/store/Memory",
    "dijit/form/ComboBox", 
    "dijit/form/FilteringSelect",
    "dojo/domReady!"
], function(on, mouse, ObjectStore,request, Memory, ComboBox, FilteringSelect){	
				
    

    /* Lectura archivo Json Plantas*/
    request.get("http://localhost:8000/gps/plantas/", {
            handleAs: "json"
        }).then(function(data){
        new dijit.form.FilteringSelect({
            id: "planta",
            store: new Memory({ idProperty: "id", data: data }),
            autoComplete: true,
            name: "nombre",
            style: "width: 150px;",
            onChange: function(planta){

                //alert(dijit.byId('planta').get('displayedValue'));
                //alert(dijit.byId('planta').get('value'));
                //dijit.byId('negocio').query.planta = this.item.planta || /.*/;                
                
                /* Lectura archivo Json Negocios*/
                var cn= dijit.byId('planta').get('displayedValue');
                var url= "http://localhost:8000/gps/centrosdenegocio/"+cn+"/";
                console.log(url);
                request.get(url, {
                        handleAs: "json"
                    }).then(function(data){
                        new dijit.form.ComboBox({
                            id: "negocio",
                            store: new Memory({idProperty:"id", data: data }),
                            autoComplete: true,
                            //query: {planta: /.*/},
                            style: "width: 150px;",
                            required: true,
                            searchAttr: "name",
                            onChange: function(negocio){                    
                                alert(dijit.byId('negocio').get('value'));
                                alert(dijit.byId('negocio').get('displayedValue'));
                                //console.log("combobox Negocios ", negocio, this.item);
                                //dijit.byId('trabajador').query.planta = this.item.cn || /.*/;
                                //dijit.byId('planta').set('value', this.item ? this.item.planta : null);

                                /* Lectura archivo Json Trabajadores*/
                                url= "plantas.json";
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
                                        }
                                    }, "trabajador").startup();
                                });








                            }
                        }, "negocio").startup();
                });
            }
        }, "planta").startup();
    });

   


});
