require([
	"dojox/grid/DataGrid",
	"dojo/store/Memory",
	"dojo/data/ObjectStore",
	"dojo/request",
	"dojo/domReady!"
], function(DataGrid, Memory, ObjectStore, request){
var grid,  dataStore;
request.get("hof-batting.json",{
handleAs: "json"
}).then(function(data){
dataStore = new ObjectStore({ objectStore:new Memory({ data: data.items }) });
 
grid = new DataGrid({
store: dataStore,
query: { id: "*" },
queryOptions: {},
structure: [
{ name: "First Name", field: "first", width: "25%" },
{ name: "Last Name", field: "last", width: "25%" },
{ name: "G", field: "totalG", width: "10%" },
{ name: "AB", field: "totalAB", width: "10%" },
{ name: "R", field: "totalR", width: "10%" },
{ name: "H", field: "totalH", width: "10%" },
{ name: "RBI", field: "totalRBI", width: "10%" }
]
}, "grid");
grid.startup();
});
});