'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

//express
const express_res = conf.express_res;

//moduler
const moduler = require(REQUIRE_PATH.moduler);

//System modules
const { getRequest } = moduler.http;

/**
 * Get MessageContainer parents for catwalk.
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const getMessageContainerParents = async (req, res, params) => {
  //Request to KEEL
  try {
    const result = await getRequest(`https://${req.keel_url}/get/marshaller/mc/parents`, params);
    express_res.func(res, result?.data);
    return result;
  }
  catch (err) {
    err.message = err.response?.data?.message || err.message;
    throw err;
  }
};
module.exports.func = getMessageContainerParents;