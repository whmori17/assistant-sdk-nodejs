import { GoogleAssistant } from './src/services/GoogleAssistant';
import { readLine } from 'stdio';

require('dotenv').config();

const { env } = process;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deviceCredentials = require(env.DEVICECREDENTIALS_FILE);

const CREDENTIALS = {
  client_id: deviceCredentials.client_id,
  client_secret: deviceCredentials.client_secret,
  refresh_token: deviceCredentials.refresh_token,
  type: 'authorized_user',
};

const assistant = new GoogleAssistant(CREDENTIALS);
// Allow user to continually input questions and receive answers.
async function promptUser() {
  console.log('> ');
  const command = await readLine();

  if (command === 'exit') {
    console.log('Good bye');
    await readLine({ close: true });
    return;
  }

  assistant.assist(command).then(({ text }) => {
    console.log(text);
    promptUser();
  });
}

if (typeof process.argv[2] !== 'undefined') {
  assistant.assist(process.argv[2]).then(({ text }) => {
    console.log(text);
  });
} else {
  promptUser();
}
