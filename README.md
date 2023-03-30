# ChatRPC

ChatRPC is a framework that allows large language models to interact with external services.

Users of the library define methods and services:
```typescript
const isEvenMethod = new Method<number, boolean>(
  { type: 'number' }, // Schema for input
  { type: 'boolean' }, // Schema for output
  async (input) => input % 2 === 0 // Implementation
);

const calculatorService = new Service('calculator').registerMethod(
  'isEven',
  isEvenMethod
);
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
A working example that integrates TMDB into ChatGPT can be found here: [examples/tmdb-openai](https://github.com/floriscornel/chatrpc/examples/tmdb-openai).

<img src="https://github.com/floriscornel/chatrpc/blob/main/ChatRPC-tmdb-demo.gif" width="655" height="422">

<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


## Acknowledgments

* [typescript-starter](https://github.com/bitjson/typescript-starter) has helped me get started with this project.
  