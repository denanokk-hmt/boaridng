'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

//System modules
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequest } = moduler.http


/**
 * Put op mark_read
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const putOpMarkRead = async (req, res, params) => {

  /////////////////////////////
  //Put Request to Keel
  const result = await postRequest('PUT', `https://${req.keel_url}/put/op/mark_read`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = putOpMarkRead