require('dotenv').config();

const homedir = require('homedir');
const { env } = process;
const deviceCredentials = require(env.DEVICECREDENTIALS_FILE);
const GoogleAssistant = require('./src/services/GoogleAssistant/googleassistant');

const CREDENTIALS = {
  client_id: deviceCredentials.client_id,
  client_secret: deviceCredentials.client_secret,
  refresh_token: deviceCredentials.refresh_token,
  type: 'authorized_user',
};

const assistant = new GoogleAssistant(CREDENTIALS);
const stdio = require('stdio');
// Allow user to continually input questions and receive answers.
const promptUser = () => {
  stdio.question('> ', (err, prompt) => {
    assistant.assist(prompt).then(({ text }) => {
      console.log(text); // Will log the answer
      promptUser();
    });
  });
};

if (typeof process.argv[2] !== 'undefined') {
  assistant.assist(process.argv[2]).then(({ text }) => {
    console.log(text);
  });
} else {
  promptUser();
}
