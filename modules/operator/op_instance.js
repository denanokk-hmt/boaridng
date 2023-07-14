'use strict'

//config
const conf = require(REQUIRE_PATH.configure);

let op_instance = []
for (let idx in conf.env_client) {

  //Set op system info
  op_instance[idx] = {clinet: idx}
  op_instance[idx]['system'] = conf.env_client[idx].operator.system_name || null
  if (conf.env_client[idx].operator.system_name) {
    op_instance[idx]['stop_default_msg_text'] = conf.env_client[idx].operator.stop_default_msg.text
    op_instance[idx]['stop_default_msg_image'] = conf.env_client[idx].operator.stop_default_msg.image
  
    // Set initializer and initialize for each OP's initialization.
    op_instance[idx].index = require(`./${conf.env_client[idx].operator.system_name}/index`)
    op_instance[idx].index.init(op_instance[idx])
  }
}
module.exports = op_instance