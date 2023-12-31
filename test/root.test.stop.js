#!/usr/bin/env node
var app
const opening = async () => {

  //Get root
  //appli name, server code, environment
  const root = require('../config/root.json');  

  //Set express app
  app = await require('../app').initAppSet(root)

  const debug = require('debug')('wnc:server');
  const http = require('http');

  //Require configueration
  const conf = require(`../config/configure.js`);
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
  
  return app
}
//const { opening }= require('../bin/www')

const request = require("supertest");

app = beforeAll( async() => {
  return await opening()
});

describe("Test API", () => {
  test("GET /", async () => {
    const response = await request(app).get("/");
    
    //expect(true).toBe(true);
    //expect(response.statusCode).toBe(300);
    //expect('Content-Type', /json/);
    //console.log(response)
    expect(response.statusCode).toBe(200);
  });
});

afterAll(async (done) => {
  done();
});