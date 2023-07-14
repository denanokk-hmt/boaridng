'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { getRequest } = moduler.http

//OAuth
const oAuth = moduler.oAuth


/**
 * Get messages request
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const getMessage = async (req, res, params) => {

  //token suffix shooting (+ --> space --> +)
  params.token = params.token.replace(/\s/g,"+")

  //Set optional params
  params.qty = (req.query)? req.query.qty : 10
  params.eqsign = req.query.eqsign
  if (req.query.asc) {
    params.asc = true
  }
  params.mtype = req.query.mtype || null

  //Anonymous user(id:null, pw:null)
  if (params.token == conf.token.anonymous_token) {

    //Add messages qty
    const resMessages = {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Zero messages.",
      qty: 0,
      messages : [],
    }
    express_res.func(res, resMessages);
    return "anonymous user do not use get messages."
  }

  //OAuth
  const oauth = await oAuth.func({ns: req.ns, client: req.valid_client, token: params.token, logiD: req.logiD})
  console.log(`=========${req.logiD} OAUTH C RESULT:${JSON.stringify(oauth)}`)
  if (!oauth.approval) {
    express_res.func(res, oauth);
    return 'Oauth error'
  }

  //Set room number
  params.rid = oauth.rid

  //Get Request to Keel
  const result = await getRequest(`https://${req.keel_url}/get/messages`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = getMessage