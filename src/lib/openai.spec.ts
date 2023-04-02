import test from 'ava';

import { getChatGpt3Prompt } from './openai';

test('getChatGpt3Prompt', (t) => {
  const prompt = getChatGpt3Prompt();
  t.is(typeof prompt, 'string');
});
