//config
const conf = require(REQUIRE_PATH.configure);

/**
 * Convert LINE WORKS callback message to WhatYa message. If it is an image, get it from LINE WORKS and keep its infomations. It will treat after.
 * @param {*} reqBody Express Request Body.
 */
const getBody = (reqBody) => {
  console.log("Convert LINE WORKS request body to WhatYa Message.", JSON.stringify(reqestBody))
  if (reqBody["type"] != "message") { return null } // unsupported type.
  if (!reqBody.content) { return null } // invalid message.

  // Map for LINE WORKS type to WhatYa talk_type.
  const talkTypeMap = {
    "text": "text",
    "image": "image"
  }

  // Pre definition.
  let params = {
    action: "post",
    op_rid: reqBody.roomId,
    talk_type: talkTypeMap[reqBody.content.type],
  }

  // By talk_type
  switch (params.talk_type) {
    case 'text':
      // text message
      params.content = {
        message: reqBody.content.text
      }
      break
    case 'image':
      // image
      params.imgId = reqBody.content.resourceId
      break
    default:
      return null
  }
  return params
}

/**
 * Set propaties for op_instance.
 * @param {*} op_instance own op instance (op_instance[client])
 */
const initFunc = (op_instance) => {
  op_instance.getToken = req => { return conf.conf_keel.token }
  op_instance.getBody = getBody
}

/**
 * Post proc for validation, no check for Lineworks.
 * @param {*} overall 
 * @returns {boolean} always returns true.
 */
const postProc = async overall => { return true }

module.exports.init = initFunc
module.exports.postProc = postProc