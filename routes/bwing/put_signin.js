'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code
const status = conf.status

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequest } = moduler.http
const ds_conf = moduler.kvs

//OAuth
const oAuth = moduler.oAuth


/**
 * Put Sign In request
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const putSignIn = async (req, res, params) => {

  const logiD = req.logiD
  const client = req.valid_client

  // TODO: APP-772 specification changed
  // // Restriction.
  // if (conf.env_client[client].signup_limitation && conf.env_client[client].signup_limitation.limit_by) {
  //   console.log(`======${logiD} Boarding Stopper is enabled. (${conf.env_client[client].signup_limitation.limit_by}) `)
  //   const rester = new Restrictor(req.ns)
  //   for (let i = 0; i < conf.env_client[client].signup_limitation.limit_by.length; i++) {
  //     let limit_by = conf.env_client[client].signup_limitation.limit_by[i]
  //     let limiter = rester[limit_by]
  //     console.log(`Check by ${limit_by}`)
  //     if (limiter) {
  //       if (!await limiter()) {
  //         // Signup is already limited.
  //         console.log(`=====${logiD} client ${client} reached the limit by ${limit_by}.`)
  //         // response and exit.
  //         OAuthReachedLimit(req, res)
  //         return
  //       }
  //     } else {
  //       console.log(`*****${logiD} WARNING: Restrictor don't support limitation by ${limit_by}`)
  //     }
  //   }
  //   console.log(`======${logiD} Boarding Stopper all tests were passed.`)
  // }

  //Set session_expire required or not
  params.expired = conf.env_client[req.valid_client].session_expire.required

  //OAuth
  const oauth = await oAuth.func({ns: req.ns, client, id: params.id, pw: params.pw, token: params.token, logiD})
  console.log(`=========${logiD} OAUTH C RESULT:${JSON.stringify(oauth)}`)

  if (oauth.approval) {
    /////////////////////
    //OAuth Success
    oauthSuccess({oauth, params, res, req})
  } else {
    /////////////////////
    //OAuth Error
    switch (oauth.status_code) {
      case code.ERR_A_OAUTH_API_901:
      case code.ERR_A_OAUTH_DEL_304:
      case code.ERR_A_OAUTH_NONHUMAN_305:
        oauthErrResponse({logiD, oauth, res})
      default:
        await oauthErrCreateSession({logiD, oauth, params, req, res})
    }
  }

  //Return oauth result
  return oauth
}
module.exports.func = putSignIn

/**
 * OAuth Success
 */
const oauthSuccess = async ({oauth, params, res, req}) => {
  if (params.signin_flg) {
    //UserStatusにsignin_flgを設定する処理
    console.log(`=========${req.logiD} OAUTH SUCCESS UPDATE SIGN IN FLG===========`)
    await postRequest('POST', `https://${req.keel_url}/post/user_status/update/signin_flg`, params, response => {})
    .catch(err => {
      //UserStatusの更新に失敗した場合も以降の処理を実行する
      console.log(`${req.logiD} FAIL TO UPDATE WHATYA ID`, err.message);
    })
  }

  if (!oauth.op_session) {
    //以前の仕様（Session生成時にop_sessionが生成されない仕様）で作成されたSessionのための処理
    console.log(`=========${req.logiD} OAUTH SUCCESS UPDATE WHATYA ID===========`)
    //Request to KEEL
    await postRequest('POST', `https://${req.keel_url}/post/session/update/hmtid`, params, response => {
      express_res.func(res, response.data)
    }).catch(err => {
      throw Error(err)
    })
    return
  }
  
  const result = {
    type : "API",
    status_code : oauth.status_code,
    status_msg : "Sign In Success.",
    token : oauth.token,
    hmt_id: oauth.op_session,
  }
  //response token
  res.status(200)
  express_res.func(res, result)
  console.log(`=========${req.logiD} SIGN IN SUCCESS:`, JSON.stringify(result))
  return result;
}

/**
 * OAuth Errors. Response error
 */
const oauthErrResponse = ({logiD, oauth, res}) => {
  express_res.func(res, oauth);
  console.log(`=========${logiD} OAUTH ERROR:`, oauth.status_code)
  return oauth;
}

/**
 * OAuth Errors. Create Session
 */
const oauthErrCreateSession = async ({oauth, params, req, res}) => {

  const logiD = req.logiD
  let options

  //Set session_expire required or not -->keel use to seed creation
  params.expired = conf.env_client[req.valid_client].session_expire.required

  if (oauth.status_code == code.WAR_EXPIRED_SESS_102) {
    /////////////////////
    //Session expired
    console.log(`=========${logiD} OAUTH ERROR SESSION EXPIRED===========`)
    
    //Set old token from OAuth, replace_reason
    params.token = oauth.token
    params.replace_reason = 'token_expired'

    //Set session replace token request options
    options = {
      url: `https://${req.keel_url}/post/session/replace/token`,
      method: 'POST',
      form: params
    }

  } else {
    
    //Check old token for Session replace PW. Use force encrypt.
    // It may rescue having invalid hash but valid token.
    let test_oauth = oauth;
    if (params.token) {
      test_oauth = await oAuth.func({ns: req.ns, client: req.client, force_token: params.token, logiD})
    }

    if (test_oauth.approval) {
      /////////////////////
      //Session replace PW
      console.log(`=========${logiD} OAUTH ERROR SESSION REPLACE PW===========`)
      
      //Set old token from OAuth, replace_reason
      params.replace_reason = 'pw_changed'

      //Set session replace request options
      options = {
        url: `https://${req.keel_url}/post/session/replace/pw`,
        method: 'POST',
        form: params
      }

    } else {
      /////////////////////
      //Sign Up
      console.log(`=========${logiD} OAUTH ERROR SIGN UP===========`)

      //Set sign up request options
      options = {
        url: `https://${req.keel_url}/post/signup`,
        method: 'POST',
        form: params
      }

    }
  }

  //Request to KEEL
  await postRequest(options.method, options.url, options.form, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })
}

/**
 * Restrict sign-in prototype object.
 * 
 * TODO: currently not in use due to changes in APP-772.
 */
const Restrictor = function(ns) {
  // MAU (Monthly Active User) limitation /Month.
  this.mau = async function() {
    const query = ds_conf.restriction
    const today = new Date()
    const result = await query.getByMauDate(ns, `${today.getFullYear()}-${('0' + (today.getMonth()+1)).slice(-2)}`)
    // true to pass, false to fail.
    return !(result.length > 0 && result[0].status == "suspend") // pass if got empty result.
  }

  // Temporary suspend /ever
  this.always = async function() {
    return false
  }
}

/**
 * Reply rejection to unsigned user.
 * @param {*} req Express request
 * @param {*} res Express response
 * 
 * TODO: currently not in use due to changes in APP-772.
 */
const OAuthReachedLimit = function(req, res) {
  // set client form pass
  const client = req.valid_client

  // set rejection msg. it is rejection_msg on env_client or default string.
  let rej_msg = (conf.env_client[client].signup_limitation && conf.env_client[client].signup_limitation.rejection_msg ) || "ただいま満室です。日を改めてご利用ください。"

  // Response rejection message
  console.log(rej_msg)
  const resMessages = {
    type : "API",
    status_code : code.ERR_A_BOARDING_STOPPER_306,
    status_msg : status.ERR_A_BOARDING_STOPPER_306,
    qty: 1,
    messages : [
      {
        mtime: new Date().getTime(),
        mtype: 'bot',
        talk: {
          type : 'text',
          content : { message : rej_msg }
        }
      }
    ]
  }
  express_res.func(res, resMessages);
}