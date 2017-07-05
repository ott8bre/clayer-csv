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
var Promise     = require('bluebird');

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

	//process.stdout.write("done");
	process.exit(0);
}

function save(name){
	return function(array){
		process.stdout.write("success.\n");

		process.stdout.write("saving  .. ");
		return csv.save(array, CSV_FOLDER+"/"+name+".csv");
	}
}

function fetch(url){
	return function() {
		process.stdout.write("success.\n");

		process.stdout.write("fetching.. ");
		return clayer.fetch(url);	
	};
}

function update(url){
	return function(array){
		process.stdout.write("success.\n");

		process.stdout.write("updating.. ");
		return clayer.update(url, array);	
	}
}

function load(name){
	return function() {
		//process.stdout.write("success.\n");

		process.stdout.write("loading .. ");
		return csv.load(CSV_FOLDER+"/"+name+".csv");			
	};
}

function authenticate(){
	process.stdout.write("tokening.. ");
	return clayer.auth_login(CLIENT_ID, CLIENT_SECRET);
}

function synch_one(obj){
	var load_fn = load(obj.name),
			pref_fn = before_update(obj.fields),
			updt_fn = update(obj.url),
			ftch_fn = fetch(obj.url),
			post_fn = after_fetch(obj.fields),
			save_fn = save(obj.name);
	return load_fn()
		.then(pref_fn)
		.then(updt_fn)
		.then(ftch_fn)
		.then(post_fn)
		.then(save_fn)
		;
}

function synch_all(){
	return Promise.each(config.data, function(d, i) {
		process.stdout.write("success.\n");
		console.log("");
		console.log("--- "+d.name+" ---");
//		console.log("::: "+i+". "+d.name+" :::");
		return synch_one(d);
	});
}

// MAIN //
authenticate()	
	.then(synch_all)
	.then(done)
	.catch(function(error){
		process.stdout.write("fail.\n");
		console.log(error);
		process.exit(1);
	});
