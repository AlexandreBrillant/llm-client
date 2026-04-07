/**
 * test-cancel.mjs
 * (c) 2026 Alexandre Brillant
 * https://www.alexandrebrillant.com
 */

/* 
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Test canceling the streaming with OLLAMA
// Use node test/test-cancel.mjs for running

import { LLMClient } from "../src/llmClient.mjs";
import { OllamaProvider as MyProvider } from "../src/providers/ollama.mjs";

const provider = new MyProvider();
const client = new LLMClient( provider );

console.log( "Cancel TESTS..." );
console.log( "\n\nList of models :" );

const model = "ministral-3:3b";

const messages = [ 
    { role : "user", content : "hello" },
    { role : "assistant", content : "hello !" },
    { role : "user", content : "hello ?" }
];

// With long streaming

const stream = true;
messages.push( { role : "system", content : "write 10 lines" });

console.log( `\n\nStream : ${stream}` );
console.log( messages );

setTimeout( () => {
    client.cancel();
}, 1500 );

const chatResponse = await client.chat( { model, messages, stream } );
console.log( chatResponse );
for await ( const response of chatResponse ) {
    process.stdout.write( response.message.content );
}

console.log( "\n" );