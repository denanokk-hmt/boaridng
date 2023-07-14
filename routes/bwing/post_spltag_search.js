'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { getRequest, postRequest } = moduler.http

//OAuth
const oAuth = moduler.oAuth


/**
 * Post message request
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const postSpltagSearch = async (req, res, params) => {

  console.log(`======${req.logiD} BOARDING POST SPLTAG SEARCH:`)

  //OAuth
  const oauth = await oAuth.func({ns: req.ns, client: req.valid_client, token: params.token, logiD: req.logiD})
  console.log(`=========${req.logiD} OAUTH C RESULT:${JSON.stringify(oauth)}`)
  if (!oauth.approval) {
    express_res.func(res, oauth);
    //Return oauth error result
    return 'Oauth error'
  }

  //Post Request to Keel
  await postRequest('POST', `https://${req.keel_url}/post/spltag/search`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  //Return oauth success result
  return oauth
}
module.exports.func = postSpltagSearch