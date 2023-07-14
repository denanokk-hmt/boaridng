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
 * Post message request
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const postOpRegLineworksBot = async (req, res, params) => {

  //Post Request to Keel
  const result = await postRequest('POST', `https://${req.keel_url}/post/op/reg/lineworks/bot`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = postOpRegLineworksBot