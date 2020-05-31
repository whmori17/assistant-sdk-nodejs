import * as dotenv from 'dotenv';
import { GoogleAssistant, promptUser } from '../build';

dotenv.config();

const { env } = process;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deviceCredentials = require(env.DEVICECREDENTIALS_FILE);
const assistantCredentials = {
  client_id: deviceCredentials.client_id,
  client_secret: deviceCredentials.client_secret,
  refresh_token: deviceCredentials.refresh_token,
  type: 'authorized_user',
};

const assistant = new GoogleAssistant(assistantCredentials);

typeof process.argv[2] !== 'undefined'
  ? assistant.assist(process.argv[2]).then(({ text }) => {
      console.log(text ?? '✔');
    })
  : promptUser(assistant);
