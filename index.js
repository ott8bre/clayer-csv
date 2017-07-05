// ARGS CHECK //
if(process.argv.length < 2){
	process.abort();
} else if(process.argv.length < 3){
	console.log("fail: missing client_id");
	return;	
} else if(process.argv.length < 4){
	console.log("fail: missing client_secret");
	return;	
}

// REQUIRES //
var config = require('./config');
var clayer = require('./clayer');
var csv 	 = require('./csv');

// CONSTANTS //
var CLIENT_ID 		= process.argv[2],
    CLIENT_SECRET	= process.argv[3],
		CSV_FOLDER		= process.argv[4] || "DATA";

// HELPERS //
function before_update(keys){
	return function(array){
		return array.map(function(e){ 
			var obj = {};
			["id"].concat(keys).forEach(function(k){ obj[k] = e[k]; });
			return obj;
		});
	};
}

function after_fetch(keys){
	return function(array){
		return array.map(function(e){ 
			var obj = {};
			["id","created_at","updated_at"].concat(keys).forEach(function(k){ obj[k] = e[k]; });
			return obj;
		});
	};
}


function done(){
	process.stdout.write("success.\n");

	process.stdout.write("done");
	process.exit(0);
}

function save(products){
	process.stdout.write("success.\n");

	process.stdout.write("saving  .. ");
	return csv.save(products, CSV_FOLDER+"/products.csv");
}

function fetch(){
	process.stdout.write("success.\n");

	var filter = after_fetch(config["account/products"]);

	process.stdout.write("fetching.. ");
	return filter( clayer.products_fetch() );	
}

function update(products){
	process.stdout.write("success.\n");

	var filter = before_update(config["account/products"]);

	process.stdout.write("updating.. ");
	return clayer.products_update(filter(products));	
}

function load(){
	process.stdout.write("success.\n");

	process.stdout.write("loading .. ");
	return csv.load(CSV_FOLDER+"/products.csv");	
}

function authenticate(){
	process.stdout.write("tokening.. ");
	return clayer.auth_login(CLIENT_ID, CLIENT_SECRET);
}

function init(){
	return mkdir(CSV_FOLDER);
}

// MAIN //
authenticate()	
	.then(load)
	.then(update)
	.then(fetch)
	.then(save)
	.then(done)
	.catch(function(error){
		process.stdout.write("fail.\n");
		console.log(error);
		process.exit(1);
	});

