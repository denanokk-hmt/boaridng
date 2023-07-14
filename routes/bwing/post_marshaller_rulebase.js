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
 * Register new coupons with JSON.
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const postRulebase = async (req, res, params) => {

  //Request to KEEL
  const result = await postRequest('POST', `https://${req.keel_url}/post/marshaller/rulebase`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    err.message = err.response?.data?.message || err.message
    throw Error(err)
  })

  return result
}
module.exports.func = postRulebase