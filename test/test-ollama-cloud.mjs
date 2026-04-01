/**
 * test-ollama-cloud.mjs
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

// Test for OLLAMA Cloud
// It requires an API KEY, stored inside the JSON file apikeys.json { "ollamacloud" : "YOUR_KEY" }

import { dirname, join } from 'path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const keys = JSON.parse( readFileSync( join( __dirname, "apikeys.json" ) ) );

const YOUR_API_KEY = keys.ollamacloud;

import { LLMClient } from "../src/llmClient.mjs";
import { OllamaCloudProvider as MyProvider } from "../src/providers/ollamaCloud.mjs";

const provider = new MyProvider();
const client = new LLMClient( provider );

client.setAPIKey( YOUR_API_KEY );

console.log( "OLLAMA CLOUD TESTS..." );
console.log( "\n\nList of models :" );

const models = await client.models();

models.forEach( model => {
    console.log( "-" + model.name )
});

// Very big model for our test
const model = "mistral-large-3:675b";
const messages = [ 
    { role : "user", content : "hello" },
    { role : "assistant", content : "hello !" },
    { role : "user", content : "hello ?" }
];

// No streaming
let stream = false;
console.log( `\n\nStream : ${stream}` );
console.log( messages );

let response = await client.chat( { model, messages, stream } );
console.log( response.message.content );

// With streaming
stream = true;
messages.push( { role : "system", content : "be funny" });

console.log( `\n\nStream : ${stream}` );
console.log( messages );

const response2 = await client.chat( { model, messages, stream } );
for await ( response of response2 ) {
    process.stdout.write( response.message.content );
}

console.log( "\n" );