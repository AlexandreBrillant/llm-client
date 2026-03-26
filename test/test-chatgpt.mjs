/**
 * test1.mjs
 * (c) 2026 Alexandre Brillant
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

// Test for Chatgpt
// It requires an API KEY

const YOUR_API_KEY = "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";

import { LLMClient } from "../src/llmClient.mjs";
import { ChatGptProvider as MyProvider } from "../src/providers/chatgpt.mjs";

const provider = new MyProvider();
const client = new LLMClient( provider );

client.setAPIKey( YOUR_API_KEY );

console.log( "CHATGPT TESTS..." );
console.log( "\n\nList of models :" );

const models = await client.models();

models.forEach( model => {
    console.log( "-" + model.name )
});

const model = "gpt-5-nano";

const messages = [ { role : "user", content : "hello" }];

// No streaming
let stream = false;
console.log( `\n\nStream : ${stream}` );
console.log( messages );

let response = await client.chat( { model, messages, stream } );
console.log( response.message.content );

// With streaming
stream = true;
messages.push( { role : "system", content : "be concise" });

console.log( `\n\nStream : ${stream}` );
console.log( messages );

const response2 = await client.chat( { model, messages, stream } );
for await ( response of response2 ) {
    process.stdout.write( response.message.content );
}

console.log( "\n" );