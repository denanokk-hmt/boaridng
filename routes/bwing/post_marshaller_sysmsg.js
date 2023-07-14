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
 * Post new system message.
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const marshallerNext = async (req, res, params) => {

  console.log(JSON.stringify(params))

  //Request to KEEL
  const result = await postRequest('POST', `https://${req.keel_url}/post/marshaller/sysmsg`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = marshallerNext