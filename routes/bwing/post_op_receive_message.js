'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code
const status = conf.status
const op_system = conf.op_system

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequest } = moduler.http
const ds_conf = moduler.kvs


/**
 * Post op receive message
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const postOpReceiveMessage = async (req, res, params) => {
  console.log(`=========${req.logiD} POST TO POST OP RECEIVE MESSAGE ===========`)

  let result = {}
  const logiD = req.logiD

  //Set client
  const client = req.valid_client

  const op_data = params.body

  //Set namespace
  const ns = req.ns

  //Get session(token) by op_rid of params
  const session = await ds_conf.session.getByFilter(ns, "op_rid", op_data.op_rid, true);
  if (!session || !session.length) {
    result.send = {
      type: "OAuth",
      status_code : code.ERR_A_OAUTH_NON_303,
      status_msg : status.ERR_A_OAUTH_NON_303,
      approval : false,
      logiD,
      client,
      op_rid: op_data?.op_rid
    }
    console.log(JSON.stringify(result.send))
    return result
  }

  //Again get session with Read only transaction
  const tran_session = await ds_conf.session.getSessionWithReadTran(ns, session[0].key_name)
  .catch(err => {
    throw new Error(err)
  })

  //Set session data for flight recorder
  result.oauth = tran_session[0]
  result.oauth.token = tran_session[0].key_name

  // Temporary way for missing received message.
  // It's essentially unnecessary.
  if (op_data.op_ope_uid < 0) {
    if (tran_session[0].op_ope_uid) {
      op_data.op_ope_uid = tran_session[0].op_ope_uid
    } else {
      throw new Error("no given op_ope_uid and no op_ope_uid in session.")
    }
  }

  // Construct Overall params for Post process.
  let overall = {
    params,
    client,
    session: tran_session,
    req,
    res,
    op_data
  }

  // Post process (post validation)
  if (op_system[client].index.postProc) {
    if (!op_system[client].index.postProc(overall)) { return }
  }

  /////////////////////////////
  //Post request

  //Set params
  delete params['body']
  params = {
    ...params,
    ...op_data,
    rid : tran_session[0].rid,
  }

  //Post Request to Keel
  await postRequest('POST', `https://${req.keel_url}/post/op/receive/message`, params, response => {
    result.send = {
      type: "API",
      status_code: code.SUCCESS_ZERO,
      status_msg: `Message published to keel`,
      published_no: response.data
    }
  })
  .catch(err => {
    throw Error(err)
  })

  return result
}
module.exports.func = postOpReceiveMessage