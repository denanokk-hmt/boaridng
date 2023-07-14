//config
const conf = require(REQUIRE_PATH.configure);
const env = conf.env

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const crypto = moduler.crypto
const {getIP} = moduler.getIP


const apiDefaultFunc = {

  //End next
  Final : (req, res) => {
    try {
      console.log()
    } catch(err) {
      console.error(err)
    }
  },

  //Setting logiD & Client code
  firstSet: (req, res, next) => {
    try {

      //Create logiD
      req.logiD = `${crypto.seedRandom8()}${(new Date).getTime()}`

      //Get client code from url path
      let client = req.baseUrl.split("/")[2]

      //Set use
      let use = env.environment
      
      //Set keel url
      let url = `${conf.keel_domains[client]}/${env.routes.url_api}/${client}`

      //domainAuth validation client code
      const valid_client = client

      //Case pre
      if (conf.regions[client] == 'ALL') {
        client = (req.query.client_id)? req.query.client_id : req.body.client_id    //convert client by req parameter for pre.
        url = `${conf.keel_domains[valid_client]}/${env.routes.url_api}/${client}`  //change client in url.
        use = 'pre'
      }
      
      //Set valid_client & client, keel url
      req.valid_client = valid_client
      req.client = client
      req.keel_url = url
      
      // Set boarding url
      const boarding_protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
      req.boarding_url = `${boarding_protocol}://${conf.boarding_domains[valid_client]}/${env.routes.url_api}/${valid_client}`

      //Datastore namespace
      req.ns = `WhatYa-${req.client}-${use}`

      //API
      req.api = String(req.url.split('?')[0]).split('/').slice(1,).join('_').toUpperCase()

      //Get & set IP
      req.IP = getIP(req)

      //Mock
      req.mock = (req.method == 'GET')? req.query.mock : req.body.mock

      req.log = {
        url : req.url,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body,
      }

      //body
      if (req.api != 'POST_UPLOAD_DATA') {
        req.params = (req.method == 'GET')? req.query : (Object.keys(req.body).length)? req.body : req.query
      } else {
        req.params = req.query
      }

      next()
    } catch(err) {
      console.error(err)
    }
  },

  //Logging request parameter
  loggingParams : (req, res, next) => {
    try {

      //Logging parameter
      console.log(`======${req.logiD} BOARDING ${req.api}:`, JSON.stringify(req.params))

      //Logging header
      console.log(`======${req.logiD} BOARDING HEADERS:`, JSON.stringify(req.headers))

      //IP
      console.log(`======${req.logiD} BOARDING REQUEST IP:`, req.IP)

      next()
    } catch(err) {
      console.error(err)
    }
  },

};
module.exports = {
  apiDefaultFunc
};