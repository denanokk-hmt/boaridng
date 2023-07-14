"use strict";

const moduler = require(REQUIRE_PATH.moduler);
// System modules
const { postRequest, getRequest } = moduler.http;

module.exports.buildParamsForPutSignIn = (req) => {
  return {
    ...req,
    body: req.body.paramsForPutSignIn,
  };
};

module.exports.buildParamsForGetMessages = (req) => {
  return {
    ...req,
    body: {
      ...req.body.paramsForGetMessages,
    },
  };
};

module.exports.buildParamsForPostInvoke = (req) => {
  return {
    ...req,
    body: {
      ...req.body.paramsForPostInvoke,
    },
  };
};

module.exports.callPutSignIn = async (req) => {
  // TODO: delete after testing
  const startTime = new Date().getTime();
  const options = {
    method: "PUT",
    url: `${req.boarding_url}/put/signin`,
    form: req.body,
  };

  //Request to BOARDING /put/signin
  const result = await postRequest(
    options.method,
    options.url,
    options.form
  ).catch((err) => {
    console.log(err);
    throw err;
  });

  // TODO: delete after testing
  const endTime = new Date().getTime();
  console.log(`*** Initialize: [PUT/signin] status message:`, '\x1b[35m', result.data?.status_msg, '\x1b[0m');
  console.log(`*** Initialize: [PUT/signin] completed *** in sec:`, (endTime - startTime) / 1000);
  return result?.data;
};

module.exports.callGetMessages = async (req) => {
  // TODO: delete after testing
  const startTime = new Date().getTime();
  const options = {
    url: `${req.boarding_url}/get/messages`,
    params: req.body,
  };

  //Request to BOARDING /get/messages
  const result = await getRequest(options.url, options.params).catch((err) => {
    console.log(err);
    throw err;
  });

  // TODO: delete after testing
  const endTime = new Date().getTime();
  console.log(`*** Initialize: [GET/messages] completed *** in sec:`, (endTime - startTime) / 1000);

  return result?.data;
};

module.exports.callPostInvoke = async (req) => {
  // TODO: delete after testing
  const startTime = new Date().getTime();
  const options = {
    url: `${req.boarding_url}/post/invoke`,
    method: "POST",
    form: req.body,
  };

  //Request to BOARDING /post/invoke
  const result = await postRequest(
    options.method,
    options.url,
    options.form
  ).catch((err) => {
    console.log(err);
    throw err;
  });

  // TODO: delete after testing
  const endTime = new Date().getTime();
  console.log(`*** Initialize: [POST/invoke] completed *** in sec:`, (endTime - startTime) / 1000);

  return result?.data;
};
