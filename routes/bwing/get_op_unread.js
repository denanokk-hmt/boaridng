'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

//System modules
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { getRequest } = moduler.http


/**
 * Get op unread
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const getOpUnread = async (req, res, params) => {

  /////////////////////////////
  //Get Request to Keel
  const result = await getRequest(`https://${req.keel_url}/get/op/unread`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = getOpUnread