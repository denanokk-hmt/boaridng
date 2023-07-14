'use strict';
const fileType = require('file-type')

//config
const conf = require(REQUIRE_PATH.configure);

//express
const express_res = conf.express_res

//moduler
const moduler = require(REQUIRE_PATH.moduler)

//System modules
const { postRequestWithOptions } = moduler.http

//OAuth
const oAuth = moduler.oAuth


/**
 * Post image to Cargo
 * @param {*} req 
 * @param {*} res
 * @param {*} params
 */
const postUploadData = async (req, res, params, buf) => {

  const cargo_domain = conf.cargo_domains[req.client]

  console.log(`======${req.logiD} BOARDING UPLOAD TO CARGO:`, cargo_domain)

  //Set Local IP & Referer
  params.ip = req.IP
  params.referer = req.headers.referer

  if(!params.isInternal){   

    //OAuth
    const oauth = await oAuth.func({ns: req.ns, client: req.valid_client, token: params.token ,logiD: req.logiD})
    console.log(`=========${req.logiD} OAUTH C RESULT:${JSON.stringify(oauth)}`)
    if (!oauth.approval) {
      express_res.func(res, oauth);
      return 'Oauth error'
    }

    //Set parameter rid & uid
    params.rid = oauth.rid
  }

  /////////////////////////////
  //Post Image to Cargo
  const type = await fileType.fromBuffer(buf);
  const options = {
    headers: {
      'Content-Type': type ? type.mime : null,
    },
    qs: {
      logiD: req.logiD,
      version: conf.version,
      rid: params.rid,
      token: conf.conf_keel.token  
    },
  };
  //Post request data to Cargo
  let result = null;
  await postRequestWithOptions('POST', `https://${cargo_domain}/${conf.env.routes.url_api}/${req.client}/post/data`, buf, options, response => {
    result = response.data;
    if(!params.isInternal){
      //Result judgement
      if (response.data.status_code != conf.status_code.SUCCESS_ZERO){
        express_res.func(res, {
          type : "API",
          status_code : conf.status_code.ERR_S_STORAGE_SERVICE_909,
          status_msg :  "Data Storage Error.",
          qty: 0,
          messages : [],
        })
      }else{
        express_res.func(res, {
          type : "API",
          status_code : conf.status_code.SUCCESS_ZERO,
          status_msg :  "Data post success.",
          img_url: response.data.url,
          qty: 0,
          messages : [],
        })
      }
    }
  })
  .catch(err => {
    throw err
  })
  
  return oauth
};
module.exports.func = postUploadData;