'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { getRequest } = moduler.http

/**
 * Get All Rulebase for catwalk.
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const getAllRulebaseScenario = async (req, res, params) => {

  //Request to KEEL
   const result = await getRequest(`https://${req.keel_url}/get/marshaller/rulebase/scenario`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    err.message = err.response?.data?.message || err.message
    throw Error(err)
  })

  return result
}
module.exports.func = getAllRulebaseScenario