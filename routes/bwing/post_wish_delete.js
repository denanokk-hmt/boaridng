'use strict';

// config
const conf = require(REQUIRE_PATH.configure);

// express
const express_res = conf.express_res;

// moduler
const moduler = require(REQUIRE_PATH.moduler);

// System modules
const { postRequest } = moduler.http;

// OAuth
const oAuth = moduler.oAuth;

/**
 * Delete Wish Attachment item.
 * @param {*} req
 * @param {*} res
 * @param {*} params
 */
const postWishDelete = async (req, res, params) => {
  console.log(`======${req.logiD} WISH POST DELETE:`);
  // OAuth
  const oauth = await oAuth.func({ ns: req.ns, client: req.valid_client, token: params.token, logiD: req.logiD });
  console.log(`=========${req.logiD} OAUTH C RESULT:${JSON.stringify(oauth)}`);
  if (!oauth.approval) {
    express_res.func(res, oauth);
    return 'Oauth error';
  }
  // Request to WISH
  const result = await postRequest('POST', `https://${req.keel_url}/post/wish/delete`, params, (response) => {
    express_res.func(res, response.data);
  }).catch((err) => {
    err.message = err.response?.data?.message || err.message;
    throw Error(err);
  });

  return result;
};
module.exports.func = postWishDelete;
