var trabajadores = [{"name": "TB Maule", "planta": "1"}, {"name": "TB ESTThno 1", "planta": "2"}, {"name": "TB Enap", "planta": "3"}];

var negocios = [{"name": "CN Maule", "planta": "1"}, {"name": "Maule ESTThno 1", "planta": "2"}, {"name": "CN ESTThno 2", "planta": "2"}, {"name": "CN Enap", "planta": "3"}]
;
var plantas =  [{"name": "Maule", "planta": "1"}, {"name": "ESTThno", "planta": "2"}, {"name": "Enap", "planta": "3"}];

require([
    "dojo/store/Memory",
    "dijit/form/ComboBox", "dijit/form/FilteringSelect",
    "dojo/domReady!"
], function(Memory, ComboBox, FilteringSelect){
	

	new dijit.form.ComboBox({
        id: "trabajador",
        store: new Memory({data: trabajadores }),
        autoComplete: true,
        query: {negocio: /.*/},
        style: "width: 150px;",
        required: true,
        searchAttr: "name",
        onChange: function(trabajador){
            console.log("combobox trabajador ", trabajador, this.item);
            //dijit.byId('negocio').set('value', this.item ? this.item.planta : null);
        }
    }, "trabajador").startup();

    new dijit.form.ComboBox({
        id: "negocio",
        store: new Memory({data: negocios }),
        autoComplete: true,
        query: {planta: /.*/},
        style: "width: 150px;",
        required: true,
        searchAttr: "name",
        onChange: function(negocio){
            console.log("combobox Negocios ", negocio, this.item);
            dijit.byId('trabajador').query.planta = this.item.planta || /.*/;
            //dijit.byId('planta').set('value', this.item ? this.item.planta : null);
        }
    }, "negocio").startup();

    new dijit.form.FilteringSelect({
        id: "planta",
        store: new Memory({ idProperty: "planta", data: plantas }),
        autoComplete: true,
        style: "width: 150px;",
        onChange: function(planta){
           dijit.byId('negocio').query.planta = this.item.planta || /.*/;
        }
    }, "planta").startup();
});
