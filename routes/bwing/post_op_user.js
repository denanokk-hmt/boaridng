'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const op_system = conf.op_system

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequest } = moduler.http


/**
 * Post op user
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const postOpUser = async (req, res, params) => {

  //Prepare message
  //Do not care for PRE
  const op_data = params.body

  /////////////////////////////
  //Post request

  //Set params
  delete params['body']
  params = {
    ...params,
    ...op_data,
    system: op_system[req.valid_client].system
  }
  
  //Post Request to Keel
  const result = await postRequest('POST', `https://${req.keel_url}/post/op/user`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = postOpUser