'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

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
const postMessage = async (req, res, params) => {

  //////////////////////////////////////////
  //ANONYMOUS TYPE
  if (req.body.token == conf.token.anonymous_token) {
    console.log(`======${req.logiD} BOARDING GO TO GET QUEST:`)

    //Set talk content value
    params.talk_content_value = req.body.talk?.content?.value

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
  console.log(`======${req.logiD} BOARDING GO TO POST MSG:`)

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

  //set value(for chips, lists)
  params.talk_content_value = req.body.talk.content.value

  //set dialog_values(for )
  params.talk_content_dialog_values = req.body.talk.content.dialog_values

  //set operator system values
  params.op_system = oauth.op_system
  params.op_room_id = oauth.op_room_id
  params.op_cust_uid = oauth.op_cust_uid
  params.op_access_token = oauth.op_access_token

  //Post Request to Keel
  await postRequest('POST', `https://${req.keel_url}/post/message`, params, response => {
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
module.exports.func = postMessage