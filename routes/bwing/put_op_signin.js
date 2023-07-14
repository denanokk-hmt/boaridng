'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequest } = moduler.http

//OAuth
const oAuth = moduler.oAuth


/**
 * Post histories to operator system
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const putOpSignIn = async (req, res, params) => {

  //OAuth
  const oauth = await oAuth.func({ns: req.ns, client: req.valid_client, token: params.token, logiD: req.logiD})
  console.log(`=========${req.logiD} OAUTH C RESULT:${JSON.stringify(oauth)}`)  
  if (!oauth.approval) {
    express_res.func(res, oauth);
    return 'Oauth error'
  }

  //Request to KEEL
  await postRequest('PUT', `https://${req.keel_url}/put/op/signin`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  //Return oauth result
  return oauth
}
module.exports.func = putOpSignIn