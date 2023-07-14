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
 * Update Asker Answers request
 * @param {*} req 
 * @param {*} res 
 * @param {*} params 
 */
const postAskerAnswersUpdate = async (req, res, params) => {

  //Request to KEEL
  const result = await postRequest('POST', `https://${req.keel_url}/post/asker/answers/update`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = postAskerAnswersUpdate