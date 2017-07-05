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

module.exports.products_fetch = function(){ 
  return agent
		.get("https://"+DOMAIN+"/account/products")
		.set('Authorization', 'Bearer '+_token)
		.set('Accept', 'application/json')
    .then(function(res) {
      return res.body;
    });
};

function product_post(obj){ 
  return agent
    .post("https://"+DOMAIN+"/account/products")
    .set('Authorization', 'Bearer '+_token)
    .send({ product: obj })
    .set('ContentType', 'application/json')
    .set('Accept', 'application/json');
};

function product_put(obj){ 
  return agent
    .put("https://"+DOMAIN+"/account/products/"+obj.id)
    .set('Authorization', 'Bearer '+_token)
    .send({ product: obj })
    .set('ContentType', 'application/json')
    .set('Accept', 'application/json');
};

module.exports.products_update = function(array){ 
  var promises = array.map(function(p) {
    return p.id ? product_put(p) : product_post(p);
  });
  return Promise.all(promises);
};
