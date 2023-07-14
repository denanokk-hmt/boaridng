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
const postInvoke = async (req, res, params) => {

  console.log(`======${req.logiD} BOARDING INVOKE MSG:`)

  //////////////////////////////////////////
  //Finish Invoke init no need
  if (req.body.type == 'init' && conf.env_client[req.valid_client].invoke_init_no_need) {
    console.log(`=========${req.logiD} NO NEED INVOKE INIT===========`)
    const resMessages = {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : "Invoke init no need.",
    }
    //Response
    res.set('Access-Control-Allow-Origin', '*')
    res.send(JSON.stringify(resMessages));
    return "Invoke init no need"
  }

  //////////////////////////////////////////
  //ANONYMOUS TYPE(no session)
  if (params.token == conf.token.anonymous_token) {
    console.log(`======${req.logiD} BOARDING INVOKE GO TO GET`)
    //Get Request to Keel
    await getRequest(`https://${req.keel_url}/get/quest`, params, response => {
      express_res.func(res, response.data)
    })
    .catch(err => {
      throw Error(err)
    })
    return {}
  }

  //////////////////////////////////////////
  //SESSEION TYPE
  console.log(`======${req.logiD} BOARDING INVOKE GO TO POST MSG`)

  //OAuth
  const oauth = await oAuth.func({ns: req.ns, client: req.valid_client, token: params.token, logiD: req.logiD})
  console.log(`=========${req.logiD} OAUTH C RESULT:${JSON.stringify(oauth)}`)
  if (!oauth.approval) {
    express_res.func(res, oauth);
    //Return oauth error result
    return 'Oauth error'
  }
  
  //Set parameter rid & uid
  params.rid = oauth.rid
  params.uid = oauth.uid
  params.hmt_id = oauth.op_session || null

  //Post Request to Keel
  await postRequest('POST', `https://${req.keel_url}/post/invoke`, params, response => {
    // 「responded」はログに必要だけどユーザには不要のため削除
    const responded = response.data.responded
    delete response.data.responded
    express_res.func(res, response.data, responded)
  })
  .catch(err => {
    throw Error(err)
  })

  //Return oauth success result
  return oauth
}
module.exports.func = postInvoke