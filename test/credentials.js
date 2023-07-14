//Get this file of project root dir path(~/boarding)
let dir = __dirname.split('/')
dir.pop();

////////////SET YOUR LOCAL GCP CREDENTIAL FILE PATH///////////
const credential_json_path = 'iam-key/learnlearn-iam-key.json'
//////////////////////////////////////////////////////////////

//Set env var for gcp
process.env.GOOGLE_APPLICATION_CREDENTIALS = `${dir.join('/')}/${credential_json_path}`