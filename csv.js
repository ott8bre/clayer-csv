var Promise     = require('bluebird');
var mkdirp      = require('mkdirp');
var fs          = require('fs');
var readFile    = Promise.promisify(fs.readFile);
var writeFile   = Promise.promisify(fs.writeFile);

function format(obj){
  return (typeof obj === 'string') ? '"'+obj+'"' : obj;
}

function stringify(array){
  var header = Object.getOwnPropertyNames( array[0] );
  var rows = array.map(function(e) {
    return header.map(function(h){ return format(e[h]); });
  });

  return [].concat([header.map(format)], rows).join('\n');
}

function valueof(str){
  if(str === ""){
    return null;
  } else if(str === "true" || str === "false"){
    return Boolean(str);
  } else if(str[0] === '"'){
    return str.substr(1, str.length-2);
  } else {
    return Number(str);
  }
}

function parse(array){
  var keys = array[0].split(',').map(valueof);
  return array.slice(1).map(function(s){ 
    var arr = s.split(",");
    var obj = {};
    keys.forEach(function(k,i){ 
      obj[k] = valueof(arr[i]); 
    });
    return obj;
  });
}

module.exports.save = function(array, path){
  mkdirp.sync( require('path').dirname(path) );
  return writeFile (path, array.length === 0 ? '' : stringify(array));
};

module.exports.load = function(path){
  return readFile(path)
  .then ( function (data) {
    var lines = data.toString().split('\n');
    return lines.length === 0 ? [] : parse(lines);
  })
  .catch( function(error) {
    return [];
  });
};