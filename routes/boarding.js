'use strict';

//config
const conf = require(REQUIRE_PATH.configure);
const code = conf.status_code
const status = conf.status

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//for cargo
const multer = require('multer');
const cors = require('cors');
const Promise = require('bluebird');
const fs = require('fs');
const unlinkAsync = Promise.promisify(fs.unlink);

//express
const express = require('express');
const router = express.Router()
router.use(cors());
const express_res = conf.express_res


//System modules
const valid = moduler.validation
const fr = moduler.recorder.FlightRecorder  //flight-recorder
const adf = require(`${REQUIRE_PATH.modules}/api_default_func`).apiDefaultFunc
const op_system = conf.op_system

//routes modules
const putInitialize = require(`./bwing/put_initialize`)
const putSignIn = require(`./bwing/put_signin`)
const getMessage = require(`./bwing/get_messages`)
const postMessage = require(`./bwing/post_message`)
const postInvoke = require(`./bwing/post_invoke`)
const postOpSendHistories = require(`./bwing/post_op_send_histories`)
const postOpReceiveMessage = require(`./bwing/post_op_receive_message`)
const postImage = require(`./bwing/post_image`)
const postOpUser = require(`./bwing/post_op_user`)
const postUploadImage = require(`./bwing/post_upload_image`)
const postUploadData = require(`./bwing/post_upload_data`)
const postOpRegLineworksBot = require ('./bwing/post_op_reg_lineworks_bot')
const putOpSignIn = require(`./bwing/put_op_signin`)
const putOpInitialize = require(`./bwing/put_op_initialize`)
const putOpMarkRead = require(`./bwing/put_op_mark_read`)
const getOpUnread = require(`./bwing/get_op_unread`)
const postAttachmentSearch = require(`./bwing/post_attachment_search`)
const postAttachmentDetails = require(`./bwing/post_attachment_details`)
const postSpltagSearch = require('./bwing/post_spltag_search')

//Asker
const getAskerAnswersUpdate = require(`./bwing/get_asker_answers_update`)
const postAskerAnswersUpdate = require(`./bwing/post_asker_answers_update`)
const getAskerResponseUpdate = require(`./bwing/get_asker_response_update`)
const postAskerResponseUpdate = require(`./bwing/post_asker_response_update`)

//Marshaller
const postMarshallerRegisterCoupon = require('./bwing/post_marshaller_register_coupon')
const postMarshallerGenerateCoupon = require('./bwing/post_marshaller_generate_coupon')
const getMarshallerCleanupCoupon = require('./bwing/get_marshaller_cleanup_coupon')
const getMarshallerRulebase = require('./bwing/get_marshaller_rulebase')
const getMarshallerRulebaseScenario = require('./bwing/get_marshaller_rulebase_scenario')
const postMarshallerRulebase = require('./bwing/post_marshaller_rulebase')
const postMarshallerSysmsg = require('./bwing/post_marshaller_sysmsg')
const getMarshallerSysmsg = require('./bwing/get_marshaller_sysmsg')
const getMarshallerMessageContainer = require('./bwing/get_marshaller_message_container')
const getMarshallerMessageContainerParents = require('./bwing/get_marshaller_message_container_parents')
const postMarshallerMessageContainer = require('./bwing/post_marshaller_message_container')
const getMarshallerDialog = require('./bwing/get_marshaller_dialog')
const getMarshallerDialogMessage = require('./bwing/get_marshaller_dialog_message')
const getMarshallerDialogDeleted = require('./bwing/get_marshaller_dialog_deleted')
const getMarshallerDialogHeads = require('./bwing/get_marshaller_dialog_heads')
const postMarshallerDialog = require('./bwing/post_marshaller_dialog')
const postMarshallerDialogRelease = require('./bwing/post_marshaller_dialog_release')
const deleteMarshallerDialog = require('./bwing/delete_marshaller_dialog')

// Wish
const getWishes = require('./bwing/get_wishes');
const postWishCreate = require('./bwing/post_wish_create');
const postWishDelete = require('./bwing/post_wish_delete');
const postWishGetDetails = require(`./bwing/post_wish_get_details`);


/**
 * ///////////////////////////////////////////////////
 * Error Response
 * @param {*} err 
 * @param {*} next 
 */
function errHandle2Top(err, next) {
  const result = {
    type: "API",
    status_code: code.ERR_S_API_REQ_902,
    status_msg : status.ERR_S_API_REQ_902,
    approval: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
  }
  next(result)
}

/**
* ///////////////////////////////////////////////////
* Basic validation
* Required parameter, Version, Domain
* @param {*} req
* @param {*} res
* @param {*} params
*/
function basicValidation({req, res, params}) {

  //Validation IsValue
  let valid_result
  valid_result = valid.isParamValue(params)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'IsValue valid error.'
  }

  //Validation Version auth
  valid_result = valid.versionAuth(params.version, true)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version valid error.'
  }

  //Validation Domain auth
  valid_result = valid.domainAuth(req.valid_client, params.domain, true)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Domain valid error.'
  }
}

/**
 * ///////////////////////////////////////////////////
 * Get node process env
 */
router.get('/get/env', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  let result = process.env
  result.node_version = process.version
  express_res.func(res, result)
  next()
}, adf.Final);

/**
 * ///////////////////////////////////////////////////
 * Get config
 */
router.get('/get/config', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //Parameter
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
  }

  //Basic validation
  const result = basicValidation({req, res, params});
  if (result) {
    return result
  }

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  //Response configures
  express_res.func(res, conf)

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Customer initialize.
 * [put sign-in], [get messages] and [post invoke], All in One.
 */
router.put('/put/initialize', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  // TODO: delete after testing
  const startTime = new Date().getTime();
  try {
    const paramsPutSignIn = putInitialize.buildParamsForPutSignIn(req);
    // call PUT sign-in
    const oauth = await putInitialize.callPutSignIn(paramsPutSignIn);

    const paramsGetMessages = putInitialize.buildParamsForGetMessages(req);
    const paramsPostInvoke = putInitialize.buildParamsForPostInvoke(req);

    // update token if it has changed
    if (paramsPutSignIn.body.token !== oauth.token) {
      paramsGetMessages.body.token = oauth.token;
      paramsPostInvoke.body.token = oauth.token;
    }

    const [resultGetMessages, resultPostInvoke] = await new Promise.all([
      putInitialize.callGetMessages(paramsGetMessages),
      putInitialize.callPostInvoke(paramsPostInvoke),
    ]);

    const content = {
      oauth_data: oauth,
      messages_data: resultGetMessages,
      invoke_data: resultPostInvoke,
    };

    // TODO: delete after testing
    const endTime = new Date().getTime();
    console.log(
      `*** Initialize Completed 'put/initialize' completed *** in sec:`,
      (endTime - startTime) / 1000
    );

    //flight-recorder
    res.oauth = oauth;

    express_res.func(res, content);
    console.log(
      `=========${req.logiD} SIGN IN SUCCESS:`,
      JSON.stringify(oauth)
    );
    next();
  } catch (err) {
    errHandle2Top(err, next);
    return "error at [initialize]";
  }
}, fr.Final)

router.put('/put/op/initialize', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  try {
    const paramsPutOpSignIn = putOpInitialize.buildParamsForPutOpSignIn(req);
    const paramsPostHistories = putOpInitialize.buildParamsForPostHistories(req);

    // request to /put/op/signin
    const oauth_data = await putOpInitialize.callPutOpSignIn(paramsPutOpSignIn);
    //flight-recorder
    res.oauth = oauth_data;

    // request to /post/op/send/histories
    putOpInitialize
      .callPostHistories(paramsPostHistories)
      .catch((err) => {
        console.log("*** Initialize OP FAILED request to /post/op/send/histories:", err);
      });

    express_res.func(res, oauth_data);
    console.log(
      `=========${req.logiD} SIGN IN STATUS:`,
      JSON.stringify(oauth_data)
    );

    next();
  } catch (err) {
    errHandle2Top(err, next);
    return "*** Initialize OP err : 'put/op/initialize'";
  }
}, fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Customer sign in
 */
router.put('/put/signin', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //Parameters
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    customer_uuid: req.body?.customer_uuid || '__dummy__',
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Force anonymous
  if (conf.force_anonymous[req.valid_client]) {
    params.id = null
    params.pw = null
    params.token = conf.token.anonymous_token
  } else {
    params.id = req.body.id
    params.pw = req.body.pw
    params.token = req.body.token
  }

  if (params.id && params.pw) {
    params.signin_flg = true;
  }

  //Put sing in request
  const oauth = await putSignIn.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'sign up error'
  });

  //flight-recorder
  res.oauth = oauth
  next()
}, fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Get messages
 */
router.get('/get/messages', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    mtime: req.query.mtime,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Get messages request
  const result = await getMessage.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'get messages error'
  });
  
  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Customer post Message
 */
router.post('/post/message', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    talk_type: req.body.talk.type,
    talk_content_message : req.body.talk.content.message,
    send_to: (req.body.send_to) ? req.body.send_to : 'bot',
    customer_uuid: req.body?.customer_uuid || '__dummy__',
  };

  //Text message
  params.talk_content_message = req.body.talk.content.message;

  //Basic validation
  if (basicValidation({req, res, params})) return

  //C2O checks
  if (params.send_to != 'bot' && checkC2O(req, res, params.talk_type, params.send_to)) return

  //Image message
  if (params.talk_type === "image") {
    params = {
      ...params,
      img_url: req.body.img_url,
      alt: req.body.alt || 'not image',
    }
  }

  // wy params
  params = {
    ...params,
    ...fetchObjectByKeys(req.body.talk.content, ["current_url", "wy_event", "wy_login", "wy_data"])
  };
  
  //testing flag
  params.testing = req.body.testing || false;

  //Post message request
  const oauth = await postMessage.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post message error'
  });
  
  //flight-recorder
  res.oauth = oauth
  next();
}, fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Ivoke
 * For Auto message
 * in the keel Invoke is changed to post Message
 */
router.post('/post/invoke', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    type: req.body.type,
    send_to: req.body.send_to,
    content: JSON.stringify(req.body.content),
    customer_uuid: req.body?.customer_uuid || '__dummy__',
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //State parameter
  params.state = req.body.content.wy_st

  //WorthWords parameters
  if (req.body.content.wy_ww) {
    params.worth_words = {
      worth_word : req.body.content.wy_ww,
      user_prof : req.body.content.wy_upf,
      chatwindow_open : req.body.content.wy_opn,
    }
  }
  if (req.body.response_context) {
    try{
      params.response_context = JSON.stringify(req.body.response_context)
    }
    catch(e){
      console.log(`======${req.logiD} BOARDING INVOKE Invalid response_context:`, req.body.response_context)
    }
  }

  // wy params
  params = {
    ...params,
    ...fetchObjectByKeys(req.body.content, ["current_url", "wy_event", "wy_login", "wy_data"])
  };

  //testing flag
  params.testing = req.body.testing || false;

  //Post message request
  const oauth = await postInvoke.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'invoke error'
  });

  //flight-recorder
  res.oauth = oauth
  next()
},　fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Post message histories to Operator system
 */
router.post('/post/op/send/histories', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
  };

  //Basic validation
  if (basicValidation({req, res, params})) return

  //pre C2O gard
  if (checkC2O(req, res, 'histories')) return

  //Post message request
  await postOpSendHistories.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post op send histories error'
  });
  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Post op receive message
 * receive message from op and send to keel's /post/op/receive/message
 */
router.post('/post/op/receive/message', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    token: op_system[req.valid_client].getToken(req),
    body: op_system[req.valid_client].getBody(req.body),
    op_name: op_system[req.valid_client].system,
  }
 
  //Value validation
  let valid_result;
  valid_result = valid.isParamValue(params)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'IsValue valid error.'
  }
 
  //Token validation
  valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Now validation is completed. Return 200 NOW IMMIDIATELY for OKSKY!
  express_res.func(res, status.SUCCESS_ZERO);

  //Post message request
  const result = await postOpReceiveMessage.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post op receive message error'
  });

  //flight-recorder
  res.oauth = result?.oauth
  res.fr_response = result?.send
  next()
}, fr.Final)


/**
 * ///////////////////////////////////////////////////
 * Asker server AI instatnce update
 * For Auto message
 * in the keel Invoke is changed to post Message
 */
router.get('/get/asker/answers/update', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    token: req.query.token,
  }

  //Validation IsValue
  let valid_result
  valid_result = valid.isParamValue(params)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'IsValue valid error.'
  }
  //Validation Version auth
  valid_result = valid.versionAuth(params.version, true)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version valid error.'
  }

  //Validation Token client auth
  valid_result = valid.tokenAuthClient(req.valid_client, params.token)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version token error.'
  }

  //Get asker answers update request
  const result = getAskerAnswersUpdate.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'asker answer update error'
  });

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Asker server AI instatnce update
 * For Auto message
 * in the keel Invoke is changed to post Message
 */
router.post('/post/asker/answers/update', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    token: req.body.token,
    credentials: req.body.credentials,
    config: req.body.config,
    default_messages: req.body.default_messages,
  }

  //Validation IsValue
  let valid_result
  valid_result = valid.isParamValue(params)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'IsValue valid error.'
  }
  //Validation Version auth
  valid_result = valid.versionAuth(params.version, true)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version valid error.'
  }

  //Validation Token client auth
  valid_result = valid.tokenAuthClient(req.valid_client, params.token)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version token error.'
  }

  //Get asker answers update request
  const result = postAskerAnswersUpdate.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'asker answer update error'
  });

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Asker server response update
 * For Auto message
 * in the keel Invoke is changed to post Message
 */
router.get('/get/asker/response/update', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    token: req.query.token,
  }

  //Validation IsValue
  let valid_result
  valid_result = valid.isParamValue(params)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'IsValue valid error.'
  }
  //Validation Version auth
  valid_result = valid.versionAuth(params.version, true)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version valid error.'
  }

  //Validation Token client auth
  valid_result = valid.tokenAuthClient(req.valid_client, params.token)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version token error.'
  }

  //Get asker response update request
  const result = getAskerResponseUpdate.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'asker response update error'
  });

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Asker server response update
 * For Auto message
 * in the keel Invoke is changed to post Message
 */
router.post('/post/asker/response/update', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    token: req.body.token,
    response: req.body.response,
    header_line: req.body.header_line || '["No Header"]', //nullable!
  }

  //Validation IsValue
  let valid_result
  valid_result = valid.isParamValue(params)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'IsValue valid error.'
  }
  //Validation Version auth
  valid_result = valid.versionAuth(params.version, true)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version valid error.'
  }

  //Validation Token client auth
  valid_result = valid.tokenAuthClient(req.valid_client, params.token)
  if (!valid_result.approval) {
      express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
      return 'Version token error.'
  }

  //Get asker response update request
  postAskerResponseUpdate.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'asker response update error'
  });

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Register talk bot to LINE WORKS.
 * This function called by MANUALLY.
 */
router.post('/post/op/reg/lineworks/bot', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    token: req.body.token,
  }

  if (!valid.tokenAuthKeel(params.token)) {
    return "Failed to authorization."
  }
  
  //Get asker answers update request
  postOpRegLineworksBot.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'asker answer update error'
  });

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Post image messae
 * recive image file from ,Send to Cargo, return url
 */
// 重要: multipart/formdata で受け取るデータを定義
/**
 * ///////////////////////////////////////////////////
 * Post upload image
 * recive image file from , upload to S3, return url
 * for LINE??
 */
const image_upload = multer(
{
  dest: './tmp/',
  limits: {
    fileSize: conf.env.max_filesize_byte ? (conf.env.max_filesize_byte.image || 0) : 0,
  }
}).fields([
  { name: 'image', maxCount: 1, },　// 'image' というキーで画像が来る想定
]); // ./tmp/ に画像を保存。
const post_image_fields = function(req, res, next){
  return image_upload(req, res, function (err) {
    if (err) {
      console.log('multer err', err)
      express_res.func(res, {
        type : "API",
        approval: false,
        status_code : conf.status_code.ERR_S_STORAGE_SERVICE_909,
        status_msg :  err.message,
        qty: 0,
        messages : [],
      });
      return;
    }
    // Everything went fine.
    next()
  });
}
router.post('/post/image', post_image_fields, adf.firstSet, adf.loggingParams, async (req, res, next) => {
  try{

    //logging
    console.log(`======${req.logiD} BOARDING POST IMAGE IMAGEFILES:`, JSON.stringify(req.files.image))
  
    //parameter
    let params = {
      logiD: req.logiD,
      version: req.query.version,
      domain: req.query.domain,
      token: req.query.token,
      send_to: req.query.send_to || 'bot',
      path: req.files.image[0].path,
      mimetype: req.files.image[0].mimetype,
      customer_uuid: req.query?.customer_uuid || '__dummy__',
    };

    //token suffix shooting (+ --> space --> +)
    params.token = params.token.replace(/\s/g,"+") 
      
    //Basic validation
    let result = basicValidation({req, res, params});
    if (result) {
      return result
    }

    //C2O check
    if (checkC2O(req, res, 'image', params.send_to)) return
  
    //Post image
    const oauth = await postImage.func(req, res, params)
      .catch(err => {
        errHandle2Top(err, next)
        return 'post image error'
      });

    //flight-recorder
    res.oauth = oauth
  }
  finally{
    Promise.all(req.files.image.map(img => {
      return unlinkAsync(img.path)
    }))
  }
  next()
},　fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Post op user
 * webhook from op and send to keel's /post/op/user
 * for read oerator data in O2C
 */
router.post('/post/op/user', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //Get client from url pass
  let client = req.valid_client

  //for oksky response
  if (process.env.NODE_ENV == 'prd' && op_system[client].system === 'oksky') {
    express_res.func(res, status.SUCCESS_ZERO);
  }

  //Convert request body Op format --> hmt format
  const body = op_system[client].conversions.requestUserBody(req.body)
  if(!body){
    return 'no update data.'
  }
  //parameter
  const op_name = op_system[client].system
  let params = {
    token: req[conf.api_conn.operator[op_name].credentials.token_place][conf.api_conn.operator[op_name].credentials.token_name],
    body,
  };
 
  //Value validation
  let valid_result;
  valid_result = valid.isParamValue(params)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'IsValue valid error.'
  }

  //Token validation
  valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }
 
  //Post message request
  const result = postOpUser.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post op receive message error'
  });

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Post upload image
 * recive image file from ,Send to Cargo, return url
 * for LINE??
 */
router.post('/post/upload/image', post_image_fields, adf.firstSet, adf.loggingParams, async (req, res, next) => {
  try{

    //logging
    console.log(`======${req.logiD} BOARDING POST UPLOAD IMAGE IMAGEFILES:`, JSON.stringify(req.files?.image))
  
    //parameter
    let params = {
      logiD: req.logiD,
      version: req.query.version,
      domain: req.query.domain,
      token: req.query.token,
      path: req.files.image[0].path,
      mimetype: req.files.image[0].mimetype,
      customer_uuid: req.query?.customer_uuid || '__dummy__',
    };

    //token suffix shooting (+ --> space --> +)
    params.token = params.token.replace(/\s/g,"+")
      
    //Basic validation
    let result = basicValidation({req, res, params});
    if (result) {
      return result
    }

    //Post image
    const oauth = await postUploadImage.func(req, res, params)
      .catch(err => {
        errHandle2Top(err, next)
        return 'post image error'
      });

      //flight-recorder
      res.oauth = oauth
  }
  finally{
    Promise.all(req.files.image.map(img => {
      return unlinkAsync(img.path)
    }))
  }
  next()
}, fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Post upload data
 * recive image binary file from LINE, Send to Cargo, return url
 * for LINE
 */
router.post('/post/upload/data', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    customer_uuid: req.query?.customer_uuid || '__dummy__',
  };

  //token suffix shooting (+ --> space --> +)
  params.token = params.token.replace(/\s/g,"+") 
    
  //Basic validation
  let result = basicValidation({req, res, params});
  if (result) {
    return result
  }

  //Post image
  const oauth = await postUploadData.func(req, res, params, req.body)
    .catch(err => {
      errHandle2Top(err, next)
      return 'post data error'
    });

    //flight-recorder
    res.oauth = oauth
    next()
  }, fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Operator system sign in
 */
router.put('/put/op/signin', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //Parameters
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  params.data = req.body.data

  //Put sing in request
  const oauth = await putOpSignIn.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'op sign up error'
  });

  //flight-recorder
  res.oauth = oauth
  next()
}, fr.Final)

/**
 * ///////////////////////////////////////////////////
 * Operator system set mark read
 */
 router.put('/put/op/mark_read', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //Parameters
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  params.mtime = req.body.mtime

  //Put mark_read in request
  const result = putOpMarkRead.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'put op mark read error'
  });
})

/**
 * ///////////////////////////////////////////////////
 * Get unread operator message count
 */
 router.get('/get/op/unread', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //Parameters
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  params.qty = req.query.qty;

  //Get unread in request
  const result = getOpUnread.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'get op unread error'
  });
})

/**
 * ///////////////////////////////////////////////////
 * Post Attachment search
 * search attachment
 */
 router.post('/post/attachment/search', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    current_url: req.body.current_url,
    query: req.body.query,
    chained_tags: req.body.chained_tags,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  params.current_params = req.body.current_params
  params.customer_uuid   = req.body.customer_uuid
  params.hmt_id      = req.body.hmt_id

  //Post message request
  const oauth = await postAttachmentSearch.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post attachment search error'
  });

  //flight-recorder
  res.oauth = oauth
  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Post Attachment search
 * search attachment
 */
 router.post('/post/attachment/details', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    current_url: req.body.current_url,
    query: req.body.query,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  params.current_params = req.body.current_params
  params.customer_uuid   = req.body.customer_uuid
  params.hmt_id      = req.body.hmt_id
  params.chained_tags   = req.body.chained_tags

  //Post message request
  const oauth = await postAttachmentDetails.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post attachment details error'
  });

  //flight-recorder
  res.oauth = oauth
  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Post specialtag search
 * search specialtag
 */
 router.post('/post/spltag/search', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    current_url: req.body.current_url,
    query: req.body.query,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  params.current_params = req.body.current_params
  params.customer_uuid   = req.body.customer_uuid
  params.hmt_id      = req.body.hmt_id
  params.chained_tags   = req.body.chained_tags

  //Post message request
  const oauth = await postSpltagSearch.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post spltag search error'
  });

  //flight-recorder
  res.oauth = oauth
  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Register new coupons with JSON.
////////////////////////////////////////////////////////////
router.post('/post/marshaller/register/coupon', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  
  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    content: req.body.content.coupons, // Array
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }
  
  // More validation.
  let coupons = params.content
  console.log(params.logiD, JSON.stringify(coupons))
  for (let i=0; i < coupons; i++) {
    if (!(
      typeof coupons[i].name === 'string' &&
      coupons[i].expire &&
      typeof coupons[i].img_url === 'string' &&
      /^https?:\/\//.test(coupons[i].img_url)
    )) { console.log("ERR"); return }
  }

  // Post 
  postMarshallerRegisterCoupon.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller register coupon error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Generate new coupon with params.
////////////////////////////////////////////////////////////
router.post('/post/marshaller/generate/coupon', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  
  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    content: req.body.content, // Object
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }
  
  // More validation.
  let coupon = params.content
  if (!(
    coupon.name &&
    coupon.code &&
    coupon.expire &&
    typeof coupon.quantity === 'number' &&
    typeof coupon.img_url === 'string' &&
    /^https?:\/\//.test(coupon.img_url)
  )) { return }

  // Post 
  postMarshallerGenerateCoupon.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller register coupon error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Flagging disabled/soldout coupons
////////////////////////////////////////////////////////////
router.get('/get/marshaller/cleanup/coupon', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  
  //parameter
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Get
  getMarshallerCleanupCoupon.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller cleanup coupon error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get All Rulebase for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/rulebase', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Get
  const result = getMarshallerRulebase.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get rulebase error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get All Rulebase Scenario for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/rulebase/scenario', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Get
  const result = getMarshallerRulebaseScenario.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get rulebase error'
  });

  next()
}, adf.Final)


////////////////////////////////////////////////////////////
// Post Rulebase for catwalk.
////////////////////////////////////////////////////////////
router.post('/post/marshaller/rulebase', adf.firstSet, adf.loggingParams, async (req, res, next) => {

  //parameter
  let params = {
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    ns: req.ns,
    logiD: req.logiD,
    content: req.body.content
  }

  // Post 
  const result = postMarshallerRulebase.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller post rulebase error'
  });

  next()
}, adf.Final)

  
////////////////////////////////////////////////////////////
// Register System messages.
////////////////////////////////////////////////////////////
router.post('/post/marshaller/sysmsg', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  
  //parameter
  let params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    content: req.body.content,
    committer: req.body.committer
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Post 
  postMarshallerSysmsg.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller post sysmsg error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get System messages.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/sysmsg', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  
  //parameter
  let params = {
    logiD: req.logiD,
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Get
  getMarshallerSysmsg.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get sysmsg error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get All MessageContainer for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/mc', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Get
  const result = getMarshallerMessageContainer.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get mc error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get All MessageContainer parents for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/mc/parents', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Get
  const result = getMarshallerMessageContainerParents.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get mc parents error'
  });

  next()
}, adf.Final)


////////////////////////////////////////////////////////////
// Post MessageContainer for catwalk.
////////////////////////////////////////////////////////////
router.post('/post/marshaller/mc', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    ns: req.ns,
    logiD: req.logiD,
    content: req.body.content,
    committer: req.body.committer
  }

  // Post
  const result = postMarshallerMessageContainer.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller post mc error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get All Dialog for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/dialog', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  //testing flag
  params.testing = req.query.testing || false;

  // Get
  const result = getMarshallerDialog.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get dialog error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get Dialog message for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/dialog/message', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
    response_id: req.query.response_id,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  //testing flag
  params.testing = req.query.testing || false;

  // Get
  const result = getMarshallerDialogMessage.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get dialog message error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get All Dialog deleted for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/dialog/deleted', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  //testing flag
  params.testing = req.query.testing || false;

  // Get
  const result = getMarshallerDialogDeleted.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get dialog deleted error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Get All Dialog heads for catwalk.
////////////////////////////////////////////////////////////
router.get('/get/marshaller/dialog/heads', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    ns: req.ns,
    logiD: req.logiD,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  //testing flag
  params.testing = req.query.testing || false;

  // Get
  const result = getMarshallerDialogHeads.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller get dialog heads error'
  });

  next()
}, adf.Final)


////////////////////////////////////////////////////////////
// Post Dialog for catwalk.
////////////////////////////////////////////////////////////
router.post('/post/marshaller/dialog', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    ns: req.ns,
    logiD: req.logiD,
    content: req.body.content,
    committer: req.body.committer
  }

  // Post
  const result = postMarshallerDialog.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller post dialog error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Post Dialog Release for catwalk.
////////////////////////////////////////////////////////////
router.post('/post/marshaller/dialog/release', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    ns: req.ns,
    logiD: req.logiD,
    content: req.body.content,
    committer: req.body.committer
  }

  // Post
  const result = postMarshallerDialogRelease.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller post dialog error'
  });

  next()
}, adf.Final)

////////////////////////////////////////////////////////////
// Delete Dialog for catwalk.
////////////////////////////////////////////////////////////
router.delete('/delete/marshaller/dialog', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  let params = {
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    ns: req.ns,
    logiD: req.logiD,
    content: req.body.content,
  }

  //Basic validation
  if (basicValidation({req, res, params})) return

  //Token validation
  const valid_result = valid.tokenAuthKeel(params.token)
  if (!valid_result.approval) {
    express_res.funcErr(res, valid_result.status_msg, valid_result.status_code);
    return 'Token valid error.'
  }

  // Delete
  const result = deleteMarshallerDialog.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'marshaller delete dialog error'
  });

  next()
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * POST Wish search
 * Search all Wish
 */
router.get('/get/wishes', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  const params = {
    logiD: req.logiD,
    version: req.query.version,
    domain: req.query.domain,
    token: req.query.token,
    hmt_id: req.query.hmt_id,
    type: req.query.type,
  };

  // Basic validation
  if (basicValidation({ req, res, params })) return;

  params.customer_uuid   = req.body.customer_uuid

  // Post search request
  await getWishes.func(req, res, params).catch((err) => {
    errHandle2Top(err, next);
    return 'post Wish search error';
  });
  next();
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * POST Wish create
 * Create Wish
 */
router.post('/post/wish/create', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  const params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    hmt_id: req.body.hmt_id,
    query: req.body.query,
  };

  // Basic validation
  if (basicValidation({ req, res, params })) return;

  params.customer_uuid   = req.body.customer_uuid

  // Post search request
  await postWishCreate.func(req, res, params).catch((err) => {
    errHandle2Top(err, next);
    return 'post Wish create error';
  });
  next();
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * POST Wish delete
 * Delete Wish
 */
router.post('/post/wish/delete', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  //parameter
  const params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    hmt_id: req.body.hmt_id,
    query: req.body.query,
  };

  // Basic validation
  if (basicValidation({ req, res, params })) return;

  params.customer_uuid   = req.body.customer_uuid

  // Post search request
  await postWishDelete.func(req, res, params).catch((err) => {
    errHandle2Top(err, next);
    return 'post Wish delete error';
  });
  next();
}, adf.Final)

/**
 * ///////////////////////////////////////////////////
 * Post wish get item details
 * get wish items with items details
 */
 router.post('/post/wish/get/details', adf.firstSet, adf.loggingParams, async (req, res, next) => {
  // parameter
  const params = {
    logiD: req.logiD,
    version: req.body.version,
    domain: req.body.domain,
    token: req.body.token,
    current_url: req.body.current_url,
    hmt_id: req.body.hmt_id,
  }

  // Basic validation
  if (basicValidation({req, res, params})) return

  params.current_params = req.body.current_params
  params.customer_uuid   = req.body.customer_uuid

  // POST get wish items details
  const oauth = await postWishGetDetails.func(req, res, params)
  .catch(err => {
    errHandle2Top(err, next)
    return 'post attachment items error'
  });

  // flight-recorder
  res.oauth = oauth
  next()
}, adf.Final)


module.exports = router;
/**
 * pre c2o gard
 * if region is ALL(for newest pre:svc) then rewrite client code,
   Set client value by clinet of query parameter.
 * @param {*} req
 * @param {*} res
 * @param {*} talk_type
 * @param {*} send_to
 */
function checkC2O(req, res, talk_type, send_to=null) {
  
  //set clinet form pass
  let client = req.valid_client
  let stop_default_msg
  switch (talk_type) {
    case 'image':
      stop_default_msg = conf.env_client[client].operator.stop_default_msg.image
      break;
    default:
      stop_default_msg = conf.env_client[client].operator.stop_default_msg.text
      break;
  }
  const stop_system_msg = `Did not send to ${talk_type} to ${client} operator system.`
  let result_msg = null

  //The gard
  if (send_to) {
    //mode check
    if (send_to != 'operator') result_msg = stop_system_msg
  } else if (!conf.env_client[client].operator) {
    //env_client setting check
    result_msg = stop_system_msg
  } else if (!valid.response_time(client)) {
    //check response time
    result_msg = stop_system_msg
  } else if (conf.regions[client] == 'ALL') {
    //Region judgement: ALL-->for pre
    result_msg = stop_system_msg
  }

  //Response stop message
  if (result_msg) {
    console.log(result_msg)
    const resMessages = {
      type : "API",
      status_code : code.SUCCESS_ZERO,
      status_msg : status.SUCCESS_ZERO,
      qty: 1,
      messages : [
        {
          mtime: new Date().getTime(),
          mtype: 'bot',
          talk: {
            type : 'text',
            content : { message : stop_default_msg }
          }
        }
      ]
    }
    express_res.func(res, resMessages);
  }

  //Return null or stop result message
  return result_msg
}

function fetchObjectByKeys(obj, keys) {
  const objKeys = Object.keys(obj || {});
  let params = {};
  for (let key of keys) {
    if (objKeys.indexOf(key) != -1) {
      params[key] = obj[key];
    }
  }
  return params;
}