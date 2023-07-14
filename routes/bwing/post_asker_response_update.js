'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequest } = moduler.http


/**
 * Update Asker Response request
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const postAskerResponseUpdate = async (req, res, params) => {

  //Batch id
  params.batch_id = req.body.batch_id;

  //Request to KEEL
  const result = await postRequest('POST', `https://${req.keel_url}/post/asker/response/update`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = postAskerResponseUpdate