require([
	"dojox/grid/DataGrid",
	"dojo/store/Memory",
	"dojo/data/ObjectStore",
	"dojo/request",
	"dojo/store/JsonRest",
	"dojo/domReady!"
], function(DataGrid, Memory, ObjectStore,JsonRest, request){
		var grid,  dataStore;
		

		  var store = new JsonRest({
		    target: "plantas.json"
		  });



		request.get("plantas.json",{
		handleAs: "json"
		}).then(function(data){
		dataStore = new ObjectStore({ objectStore:new Memory({ data: data }) });
		 
		grid = new DataGrid({
		store: dataStore,
		query: { id: "*" },
		queryOptions: {},
		structure: [
				{ name: "Model Name", field: "nombre", width: "25%" },
				{ name: "PK Name", field: "empresa", width: "25%" }
		]
		}, "grid");
		grid.startup();
		});
});