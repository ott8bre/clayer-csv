var Promise = this.Promise || require('bluebird');
var agent = require('superagent-promise')(require('superagent'), Promise);
 
var DOMAIN = "clayer-api-dev.herokuapp.com";

var _token = null;

module.exports.auth_login = function(id, secret) {
  var url= "https://"+id+":"+secret+"@"+DOMAIN+"/auth/token";
  return agent
  .post(url)
  .send({ grant_type: 'client_credentials', environment_id: 1 })
  .set('ContentType', 'application/json')
  .set('Accept', 'application/json')
  .then(function(res) {
    _token = res.body.access_token;
  });
};

module.exports.get = function(url){ 
  return agent
		.get("https://"+DOMAIN+"/"+url)
		.set('Authorization', 'Bearer '+_token)
		.set('Accept', 'application/json')
    .then(function(res) {
      return res.body;
    });
};

module.exports.post = function(url, obj){ 
  return agent
    .post("https://"+DOMAIN+"/"+url)
    .set('Authorization', 'Bearer '+_token)
    .send(obj)
    .set('ContentType', 'application/json')
    .set('Accept', 'application/json');
};

module.exports.put = function(url, obj, id){ 
  return agent
    .put("https://"+DOMAIN+"/"+url+"/"+id)
    .set('Authorization', 'Bearer '+_token)
    .send(obj)
    .set('ContentType', 'application/json')
    .set('Accept', 'application/json');
};
