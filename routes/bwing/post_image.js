'use strict';
const fs = require('fs');
const FormData = require('form-data');

//config
const conf = require(REQUIRE_PATH.configure);

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequest, postRequestWithOptions } = moduler.http

//OAuth
const oAuth = moduler.oAuth


/**
 * Post image to Cargo
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const postImage = async (req, res, params) => {

  const cargo_domain = conf.cargo_domains[req.client]

  console.log(`======${req.logiD} BOARDING POST TO CARGO:`, cargo_domain)

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

  /////////////////////////////
  //Post Image to Cargo
  const form = new FormData();
  const file = fs.createReadStream(params.path);
  form.append('image', file, {
    contentType: params.mimetype,
  });
  const options = {
    headers: {
      ...form.getHeaders(),
    },
    qs: {
      logiD: req.logiD,
      version: conf.version,
      rid: params.rid,
      token: conf.conf_keel.token  
    },
  };
  //Post request image to Cargo
  let result = null;
  await postRequestWithOptions('POST', `https://${cargo_domain}/${conf.env.routes.url_api}/${req.client}/post/image`, form, options, response => {
    result = response.data;
  })
  .catch(err => {
    throw err
  })

  //Empty meessage parse for cockpit
  const msg = {
    type : "API",
    status_code : conf.status_code.SUCCESS_ZERO,
    status_msg :  "Image post success.",
    img_url: result.url,
    qty: 0,
    messages : [],
  }

  //Response to cockpit
  express_res.func(res, msg);

  //Result judgement
  if (result.status_code != conf.status_code.SUCCESS_ZERO) return 'Image Storage Error.'


  /////////////////////////////
  //Post Op message to Keel

  //Set post (image) message parameter
  params.talk_type = 'image'
  params.talk_content_message = 'post image'
  params.send_to = 'operator'
  params.img_url = result.url
  params.alt = 'not image'

  //Set operator system values
  params.op_system = oauth.op_system
  params.op_room_id = oauth.op_room_id
  params.op_cust_uid = oauth.op_cust_uid
  params.op_access_token = oauth.op_access_token

  //Request to KEEL
  await postRequest('POST', `https://${req.keel_url}/post/message`, params, response => {
    express_res.func(res, response.data)
  })
  .catch(err => {
    throw Error(err)
  })

  //Return oauth success result
  return oauth
};
module.exports.func = postImage;