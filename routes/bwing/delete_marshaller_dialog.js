'use strict';

//config
const conf = require(REQUIRE_PATH.configure);

//express
const express_res = conf.express_res;

//moduler
const moduler = require(REQUIRE_PATH.moduler);

//System modules
const { deleteRequest } = moduler.http;

/**
 * Delete Dialog with JSON.
 * @param {*} req 
 * @param {*} res 
 * @param {*} params
 */
const deleteDialog = async (req, res, params) => {
  //Request to KEEL
  try {
    const result = await deleteRequest(`https://${req.keel_url}/delete/marshaller/dialog`, params);
    express_res.func(res, result.data);
    return result;
  }
  catch (err) {
    err.message = err.response?.data?.message || err.message;
    throw err;
  }
};
module.exports.func = deleteDialog;