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
 * Flagging coupons
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const cleanCoupon = async (req, res, params) => {

  //Get Request to Keel
  const result = await getRequest(`https://${req.keel_url}/get/marshaller/cleanup/coupon`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = cleanCoupon