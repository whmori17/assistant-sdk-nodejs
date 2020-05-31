import { readLine } from 'stdio';
import { GoogleAssistant } from '@services/GoogleAssistant';

// Allow user to continually input questions and receive answers.
export async function promptUser(assistant: GoogleAssistant): Promise<any> {
  console.log('> ');
  const command = await readLine();

  if (command === 'exit') {
    console.log('Good bye');
    await readLine({ close: true });
    return;
  }

  assistant.assist(command).then(({ text }) => {
    console.log(text ?? '✔');
    promptUser(assistant);
  });
}
