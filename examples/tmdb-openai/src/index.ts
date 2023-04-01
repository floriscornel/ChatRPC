/* eslint-disable no-constant-condition */
import dotenv from 'dotenv';
import {
  Configuration,
  ChatCompletionRequestMessage as Message,
  OpenAIApi,
} from 'openai';
import readline from 'readline-sync';

import { chatGptServiceHandler } from '../../../build/main';

import { tmdbService } from './tmdb';

// Setup
dotenv.config();
const promptSuffix = `Always check the TMDB ID for a movie before using the getMovieDetails method.`;
const services = [tmdbService];
let messages: Message[] = [];

// Main loop
(async () => {
  messages = await chatGptServiceHandler(messages, services, promptSuffix);
  console.log(messages[0].content);
  console.log("Started TMDBot. Type 'exit' to exit.");
  while (true) {
    const userInput = readline.question('User: ');
    if (userInput === 'exit') {
      break;
    }
    if (userInput === 'print') {
      console.log(messages);
      continue;
    }
    messages.push({
      content: JSON.stringify({ message: userInput }),
      role: 'user',
    });
    await resolveResponses();
  }
})();

// This function will keep asking the services for responses until no more responses are returned.
async function resolveResponses() {
  while (true) {
    messages.push(await getOpenAIResponse(messages));
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.content.startsWith('{"service')) {
      console.log(
        '\x1b[35mAssistent:',
        messages[messages.length - 1].content,
        '\x1b[0m'
      );
    } else {
      console.log(
        '\x1b[33mAssistent:',
        messages[messages.length - 1].content,
        '\x1b[0m'
      );
    }
    const previousCount = messages.length;
    messages = await chatGptServiceHandler(messages, services, promptSuffix);
    if (messages.length === previousCount) {
      break;
    }
    console.log(
      '\x1b[90mService:',
      messages[messages.length - 1].content,
      '\x1b[0m'
    );
  }
}

// This function will call OpenAI to get a response.
async function getOpenAIResponse(messages: Message[]): Promise<Message> {
  const openAi = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    })
  );
  const response = await openAi.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    max_tokens: 200,
    temperature: 0.2,
    presence_penalty: -1.0,
    frequency_penalty: -1.0,
    n: 1,
    stream: false,
  });
  if (response.data.choices.length === 0) {
    throw new Error('No response from OpenAI');
  }
  const firstChoice = response.data.choices[0];
  const responseContent = firstChoice.message?.content.trim() ?? '';
  if (responseContent === '') {
    throw new Error('No response from OpenAI');
  }
  const responseMessage: Message = {
    content: responseContent,
    role: 'assistant',
  };
  return responseMessage;
}
