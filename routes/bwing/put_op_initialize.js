"use strict";

const moduler = require(REQUIRE_PATH.moduler);
// System modules
const { postRequest } = moduler.http;

const buildParamsForPutOpSignIn = (req) => {
  return {
    ...req,
    body: {
      ...req.body.paramsForPutOpSignIn,
    },
  };
};

module.exports.buildParamsForPutOpSignIn = buildParamsForPutOpSignIn;

const callPutOpSignIn = async (req) => {
  // TODO: delete after testing
  const startTime = new Date().getTime();
  const options = {
    method: "PUT",
    url: `${req.boarding_url}/put/op/signin`,
    form: req.body,
  };

  //Request to BOARDING /put/op/signin
  const result = await postRequest(
    options.method,
    options.url,
    options.form
  ).catch((err) => {
    throw err;
  });

  // TODO: delete after testing
  const endTime = new Date().getTime();
  console.log(`*** Initialize Op: 'put/op/signin' status message:`, result.data?.status_msg);
  console.log(`*** Initialize Op: 'put/op/signin' completed *** in sec:`, (endTime - startTime) / 1000);
  return result?.data;
}

module.exports.callPutOpSignIn = callPutOpSignIn;

const buildParamsForPostHistories = (req) => {
  return {
    ...req,
    body: {
      ...req.body.paramsForPostHistories,
    },
  };
};

module.exports.buildParamsForPostHistories = buildParamsForPostHistories;

const callPostHistories = async (req) => {
  // TODO: delete after testing
  const startTime = new Date().getTime();
  const options = {
    method: "POST",
    url: `${req.boarding_url}/post/op/send/histories`,
    form: req.body,
  };

  //Request to BOARDING /post/op/send/histories
  const result = await postRequest(
    options.method,
    options.url,
    options.form
  ).catch((err) => {
    throw err;
  });

  // TODO: delete after testing
  const endTime = new Date().getTime();
  console.log(`*** Initialize Op : '/post/op/send/histories' completed *** in sec:`, (endTime - startTime) / 1000);

  return result?.data;
};

module.exports.callPostHistories = callPostHistories;