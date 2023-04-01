/* eslint-disable no-constant-condition */
import { Chat, ChatMessage, getChatGpt3Prompt } from 'chatrpc';
import dotenv from 'dotenv';
import {
  Configuration,
  ChatCompletionRequestMessage as Message,
  OpenAIApi,
} from 'openai';
import readline from 'readline-sync';

import { tmdbService } from './tmdb';

// Setup
dotenv.config();
const prompt =
  getChatGpt3Prompt() +
  '\n' +
  'Always check the TMDB ID for a movie before using the getMovieDetails method.';

const chat = new Chat({ prompt });
chat.registerService('getOpenAIResponse', tmdbService);

// Main loop
(async () => {
  console.log("Started TMDBot. Type 'exit' to exit.");
  while (true) {
    const userInput = readline.question('User: ');
    if (userInput === 'exit') {
      break;
    }
    if (userInput === 'print') {
      console.log(chat.messages);
      continue;
    }
    chat.addUserInput(userInput);
    await resolveResponses();
  }
})();

function print(message: ChatMessage) {
  console.log(`${message.role}: ${message.content}}`);
}

function convertMessages(chat: ChatMessage[]): Message[] {
  return chat.map((message) => {
    return {
      content: JSON.stringify(message.content),
      role: message.role,
    };
  });
}

// This function will keep asking the services for responses until no more responses are returned.
async function resolveResponses() {
  while (true) {
    switch (chat.lastMessage.role) {
      case 'assistant':
        print(chat.lastMessage);
        return;
      case 'system':
        print(chat.lastMessage);
      // eslint-disable-next-line no-fallthrough
      case 'user':
        // eslint-disable-next-line no-case-declarations
        const chatGptResponse = await getOpenAIResponse(
          convertMessages(chat.messages)
        );
        await chat.addAssistantOutput(chatGptResponse.content);
        break;
    }
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
