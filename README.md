# ChatRPC

[![NPM version](https://img.shields.io/npm/v/chatrpc.svg)](https://www.npmjs.com/package/ChatRPC)
[![Codecov](https://img.shields.io/codecov/c/github/floriscornel/ChatRPC.svg)](https://codecov.io/gh/floriscornel/ChatRPC)
![License](https://img.shields.io/github/license/floriscornel/ChatRPC.svg)
[![GitHub stars](https://img.shields.io/github/stars/floriscornel/ChatRPC.svg?style=social&logo=github&label=Stars)](https://github.com/floriscornel/ChatRPC)
![GitHub Action](https://img.shields.io/github/actions/workflow/status/floriscornel/ChatGPT/check-main.yaml?branch=main)

ChatRPC is a framework that allows large language models to interact with external services.

Users of the library define methods and services:
```typescript
const isEven = new Method({
  handler: async (input: number) => input % 2 === 0,
  input: { type: 'number' },
  output: { type: 'boolean' },
});

const calculatorService = new Service({ name: 'calculator' })
  .registerMethod('isEven',isEven);
```

The LLM's will be prompted to output only valid JSON that can either contain a `message` to the user or a `method` call, for example:
```
User: {"message":"Hello, I would like to get information about currency conversion."}
Assistant: {"message":"I have have access to a realtime currency conversion service. What currency would you like to convert from?"}
User: {"message":"I would like to convert 500 USD to EUR."}
Assistant: {"service":"currency","method":"convert","input":{"amount":500,"from":"USD","to":"EUR"}}
System: {"output":415.53}
Assistant: {"message":"500 USD is equivalent to 415.53 EUR."}
```

## Example Application
A working example that integrates TMDB into ChatGPT can be found here: [examples/tmdb-openai](https://github.com/floriscornel/ChatRPC/tree/main/examples/tmdb-openai).

<img src="https://floriscornel.nl/ChatRPC-tmdb-demo.gif" width="655" height="422">

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


## Acknowledgments

* [typescript-starter](https://github.com/bitjson/typescript-starter) has helped me get started with this project.
  