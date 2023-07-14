#!/usr/bin/env node

//Set gcp var of env
require('./credentials')

//Listen server
//本当はbin/wwwを共通化して呼び込みたい-->リファクタリング対象
var app, conf
const opening = async () => {

  //Get root
  //appli name, server code, environment
  const root = require('../config/root.json');  

  //Set express app
  const init = await require('../app').initAppSet(root)
  app = init.app

  const debug = require('debug')('wnc:server');
  const http = require('http');

  //Require configueration
  conf = require(`../config/configure.js`);
  const env = conf.env;
  const port = env.port;

  /**
   * Get port from environment and store in Express.
   */
  //var port = (env.environment == 'prd')? 8080 : 8989;
  app.set('port', port);
  console.log("Port:" + port);

  /**
   * Create HTTP server.
   */

  var server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */

  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
  console.log("node start.")

  /**
   * Normalize a port into a number, string, or false.
   */

  function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }

  /**
   * Event listener for HTTP server "error" event.
   */

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   */
  function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    debug('Listening on ' + bind);
  }

  return
}

//////////////////////////////////////////////////////////
//Integration test by JEST with supertest
//////////////////////////////////////////////////////////
const isNull = val => (!val)? true : false
const request = require("supertest");

//initialize(listen server)
beforeAll( async() => {
  return await opening()
});

//Setting(sign in) for each api testing & set common paramters
let client, version, domain, keel_auth_token, hmt_id
let token = '1WErbHs8WXsPH/anljOAmy6BN64gsErGj7PIRlpWkC1vZhwhVN5KB642TxUOb4FVDqpX0d3GDcu7opg0Oi0w7cPFkMyt5wOB'
beforeEach( async(done) => {
  //Set config from initialize configuration values
  client = conf.formation[0].client
  version = conf.version
  domain = conf.env_client[client].client_domain[0]
  keel_auth_token = conf.conf_keel.token
  
  //Request put sign in to svc with svc client
  const response = await request(app).put(`/hmt/${client}/put/signin`)
    .send({
      mock: true,
      version: version,
      domain: domain,
      token: token
    })
  //console.log(response.body)
  token = response.body.token
  hmt_id = response.body.hmt_id
  done();
});

//Integration api test
describe("Test API", () => {

  test("PUT /put/signin", async () => {
    expect(isNull(token)).toBe(false);
    expect(isNull(hmt_id)).toBe(false);
  });

  test("GET /get/config", async (done) => {
    const response = await request(app).get(`/hmt/${client}/get/config`)
    .query({ 
      mock: true,
      version: version,
      domain: domain,
      token: keel_auth_token
    })
    //console.log(response.body)
    expect(response.statusCode).toBe(200);
    done();
  });

  test("GET /get/messages", async (done) => {
    const response = await request(app).get(`/hmt/${client}/get/messages`)
    .query({ 
      mock: true,
      version: version,
      domain: domain,
      token: token,
      mtime: new Date().getTime(),
    })
    //console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body.status_code).toBe(0);
    done();
  });

  test("POST /post/invoke", async (done) => {
    const response = await request(app).post(`/hmt/${client}/post/invoke`)
    .send({
      mock: true,
      version: version,
      domain: domain,
      token: token,
      type: "init",
      send_to: "bot",
      content: {
        message : "init_bot",
        last_mtime: null,
      },
      mtime: new Date().getTime(),
    })
    //console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body.status_code).toBe(0);
    expect(response.body.qty).toBeGreaterThanOrEqual(1);
    done();
  });

  test("POST /post/message", async (done) => {
    const response = await request(app).post(`/hmt/${client}/post/message`)
    .send({
      mock: true,
      version: version,
      domain: domain,
      token: token,
      send_to: "bot",
      talk: {
        content: { message : "jest test" },
        type: "text",
      },
      mtime: new Date().getTime(),
    })
    console.log(response.body)
    expect(response.statusCode).toBe(200);
    expect(response.body.status_code).toBe(0);
    expect(response.body.qty).toBeGreaterThanOrEqual(1);
    done();
  });
});

/*
test('DUMMY', () => {
  expect('dummy').toMatch(/dummy/);
});*/

afterAll(async (done) => {
  done();
});