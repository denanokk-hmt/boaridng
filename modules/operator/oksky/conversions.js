'use strict'
const moduler = require(REQUIRE_PATH.moduler)
const msgutil = moduler.utils.message

/**
 * Convert OkSKy message to WhatYa talk
 * @param {*} okSkyMessage 
 */
/*
  OKSKY Webhook request.body
 {
 	"action":"create",
 	"object_name":"Message",
 	"object":{
 		"id":1046,
 		"room_id":776,
 		"content":"O2C 8888",
 		"user_id":10,
 		"created_at":"2020-03-01T18:26:33.853+09:00",
 		"updated_at":"2020-03-01T18:26:33.853+09:00",
 		"kind":"text",
 		"settings":{},
 		"status":"posted",
 		"posted_at":"2020-03-01T18:26:33.842+09:00",
 		"drive_id":null,"info":{},
 		"stamp_id":null,
 		"deleted_at":null
   }
   modifying:
   {
     "action":"update",
     "object_name":"Message",
     "object":{
       "id":4550,
       "room_id":1113,
       "content":"ttttt222",
       "user_id":1477,
       "created_at":"2020-09-03T12:38:35.731+09:00",
       "updated_at":"2020-09-03T12:40:03.180+09:00",
       "kind":"text",
       "settings":{},
       "status":"posted",
       "posted_at":"2020-09-03T12:38:35.720+09:00",
       "drive_id":null,
       "info":{},
       "stamp_id":null,
       "deleted_at":null
      }
    }
    or deleting:
    {
      "action":"delete",
      "object_name":"Message",
      "object":{
        "id":5868
      }
    }
 }*/

 /**
 * Convert from requestBody to WhatYa Message.
 * @param {*} reqestBody 
 */
const prepareRequestBody = (reqestBody) => {
  console.log("Convert OKSKY request body to WhatYa Message.", JSON.stringify(reqestBody))
  if (!reqestBody.object || !reqestBody.action || !reqestBody.object.room_id) {
    return null
  } else {
    // convert OKSKY action to WhatYa action.
    let action_map = {
      create: "post",
      update: "update",
      destroy: "delete"
    }
    let settings = reqestBody.object.settings || {}
    let message = {
      action: action_map[reqestBody.action],
      op_rid : reqestBody.object.room_id,
      op_ope_uid : reqestBody.object.user_id || -1, // Fudge for incomplete "delete" message.
      talk_type: reqestBody.object.kind || "Message", // Fudge for incomplete "delete" message.
      content : {
        message : reqestBody.object.content,
        settings : settings,
        img_url: settings.src_url || null,
        alt: settings.alt || null,
        op_mid: reqestBody.object.id
      }
    }

    // Cockpit recognizes \\n as line separator, but \n don't.
    if (message.content.message && message.content.message != "") {
      message.content.message = msgutil.newline2escaped(message.content.message)
    }
    return message
  }
};
module.exports.requestBody = prepareRequestBody;

/**
 * Prepare message interface
 * @param {*} reqestBody 
 */
const prepareRequestUserBody = (reqestBody) => {
  if (!reqestBody.object) {
    return null
  }
  if(reqestBody.object_name === 'User'){
    if(reqestBody.action === 'update'){
      // User更新時のみ
      return {
        op_ope_uid : reqestBody.object.id,
        name: reqestBody.object.name,
        full_name: reqestBody.object.full_name || null,
        avatar_url: reqestBody.object.avatar_url || null
      }
    }
  }
  return null
};
module.exports.requestUserBody = prepareRequestUserBody;
