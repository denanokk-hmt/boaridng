'use strict';

//Require module of basement
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//Require configueration
const { configuration } = require(REQUIRE_PATH.configure);


/**
 * Initialize express app set
 * @param args {*} {  
 * @param {*} appli_name 
 * @param {*} server_code 
 * @param {*} environment
 * } 
 */
const initAppSet = async (args) => {

  //Set configure
  const conf = await configuration(args);
  const env = conf.env;
  const code = conf.status_code
  const status = conf.status

  //moduler
  const moduler = require(REQUIRE_PATH.moduler)

  //System modules
  const {getIP} = moduler.getIP

  //Require Log module
  const index = require('./routes/index');
  const boarding = require('./routes/boarding');

  //Imstance express FW
  const app = express();

  //favicon
  const favicon = require('express-favicon');
  app.use(favicon(__dirname + '/public/images/favicon.ico'));

  // view engine.
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  //CROS:Allow [Cross-Origin Resource Sharing]
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Max-Age', '86400');
    res.header('Cache-Control', 'no-cache');
    next();
  });

  //CROS:OPTIONS Method [Preflight]
  app.options('*', function (req, res) {
    res.sendStatus(200);
  });

  //Express using
  app.use(bodyParser.raw({ inflate: true, limit: '100mb', type: 'image/*' }));
  app.use(bodyParser.json({limit: "2mb"}));
  app.use(bodyParser.urlencoded({ limit: '2mb', extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/', index);
  conf.formation.forEach((formation) => {
    console.log(`SET API route is ${formation.client}`);
    app.use(`/${env.routes.url_api}/${formation.client}`, boarding);
  });

  //Start breath
  console.log(`SET server/environment is ${conf.server_code}/${env.environment}.`);
  console.log(`Dammy OAuth mode: ${conf.env.dummy_oauth}`)
  console.log(`Open the GATE. boarding.`)

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    //**//console.log("404!!!!!");
    const err = new Error('Not Found page.')
    err.status = 404;
    next(err, req);
  });

  // error handler
  app.use(function(err, req, res, next) {
    //**//console.log("500!!!!!");
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    //http status
    if (!err.status) err.status = 500;
    res.status(err.status);

    //Set error response
    let result
    let logResult
    if (err.status === 404) {
      result = {
        err : err.message,
        http_status : err.status,     
        referer : req.headers.referer || null,
        ip : getIP(req),
        host : req.headers.host,
        url : req.url,
      }
      logResult = {}
    } else {
      result = {
        type: "API",
        status_code: (err.status_code)? err.status_code : code.ERR_A_SYSTEM_990,
        status_msg : (err.status_msg)? err.status_msg : status.ERR_A_SYSTEM_990,
        approval: false,
        http_status : err.status,
        message: err.message,
      }
      logResult = {
        stack : err.stack,
        logiD: req.logiD,
        ...req.log,
      }
    }

    //Error loggging
    console.error(JSON.stringify({...result, ...logResult}))

    //Responses
    if (res.finished) return
    res.json(result)
  });

  return {app, conf}
}
module.exports.initAppSet = initAppSet