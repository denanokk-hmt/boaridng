'use strict'

/**
 * Check recieve message is own msg or not.
 * @param {*} session 
 * @param {*} requestBody 
 * 
 * example from OKSKY message object after send msg reply message.
   {"op_rid":872,
    "op_ope_uid":1277,
    "talk_type":"text",
    "content":{
    "message":"【会話履歴3件を送信します。】\nB:[Hello!!]\nC:[C2B 1]\nB:[Oh,Sorry... Please once again.]\n【以上】です。",
    "settings":{"src_url":"","alt":""}
   }}
 */
const checkOpMessage = (session, requestBody) => {

  console.log("checkOpMessage session", JSON.stringify(session))
  console.log("checkOpMessage requestBody", JSON.stringify(requestBody))

  if (!session.op_cust_uid && !session.op_rid && requestBody.action == "post" ) {
    //this message is history message --> end exec
    console.log("checkOpMessage result 【passing session updating】[op_cust_uid is NULL && op_rid is NULL]", false)
    return false
  } else if (session.op_cust_uid == requestBody.op_ope_uid && session.op_rid == requestBody.op_rid && requestBody.action == "post" ) {
    //this message is own message replay. --> end exec
    console.log("checkOpMessage result", false)
    return false
  } else {
    console.log("checkOpMessage result", true)
    return true
  }
};
module.exports.func = checkOpMessage;