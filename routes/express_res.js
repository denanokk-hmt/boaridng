'use strict';

/**
 * ///////////////////////////////////////////////////Z
 * Express Response
 * @param {*} res 
 * @param {*} content 
 * @param {*} haederKey 
 * @param {*} headerValue
 * @param {*} contextType
 */
const res = (
  res,
  content,
  responded = null,
  haederKey='Access-Control-Allow-Origin',
  headerValue='*',
  contextType='application/json'
) => {
  
  if (res.finished) return
  
  //Header set
  res.set(haederKey, headerValue)
  res.fr_headers = res.getHeaders() //for flight recorder

  //Response
  //Basic is retrun body is JSON value.--> use 'send'
  switch (contextType) {
    case 'send':
      res.send(content);
      res.fr_response = null; //for flight recorder
      break;
    case 'application/json':
    default:
      res.json(content);
      //for flight recorder
      res.fr_responded = responded;
      res.fr_response = content;
  }
}
module.exports.func = res


/**
 * Error Response
 * @param {*} res 
 * @param {*} status 
 * @param {*} status_code 
 */
const errRes = (
  res, 
  status_msg, 
  status_code,
  haederKey='Access-Control-Allow-Origin', 
  headerValue='*', 
  contextType='application/json'
) => {
  //Response array set
  const content = {
    type : "SYSTEM",
    status_code : status_code,
    status_msg : status_msg,
    approval : false
  }

  if (res.finished) return
  res.set(haederKey, headerValue)
  switch (contextType) {
    case 'application/json':
    default:
      res.json(content);
  }
  return true
}
module.exports.funcErr = errRes