const validation = require('./validation')
const conversions = require('./conversions')

/**
 * Wrap OKSKY Validation function.
 * @param {*} overall 
 */
const postProc = (overall) => { return validation.func(overall.session[0], overall.params.body) }

/**
 * Set propaties for op_instance.
 * @param {*} op_instance own op instance (op_instance[client])
 */
const initFunc = (op_instance) => {
  op_instance.getToken = req => { return req["headers"]["x-oksky-secret-token"] }
  op_instance.getBody = conversions.requestBody
  op_instance.conversions = conversions
  op_instance.validation = validation
}

module.exports.init = initFunc
module.exports.postProc = postProc