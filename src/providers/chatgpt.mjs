/**
 * ollama.mjs
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

import { Provider } from "./provider.mjs ";

const DEFAULT_HOST = "https://api.openai.com/v1";

export class ChatGptProvider extends Provider {

    defaultHeaders( {host,apiKey}) {
        if ( !apiKey )
            throw "apiKey is required for this usage";
        return { 
            "Content-Type": "application/json",
            Accept : "application/json",
            Authorization:"Bearer " + apiKey
        };
    }

    defaultHost() {
        return DEFAULT_HOST;
    }

    toString() {
        return "chatgpt";
    }

    parse( chunk ) {
        const message = chunk.replace(/^data: /, "");
        if ( message == "[DONE]" )
            return false;
        return JSON.parse( message );
    }

/*
{
  id: 'chatcmpl-DNhl6TMV4dhSDiuTMv5EeadoSAJ97',
  object: 'chat.completion.chunk',
  created: 1774542124,
  model: 'gpt-5-nano-2025-08-07',
  service_tier: 'default',
  system_fingerprint: null,
  choices: [ { index: 0, delta: [Object], finish_reason: null } ],
  obfuscation: 'xHo'
}

{
  model: 'ministral-3:3b',
  created_at: '2026-03-26T16:20:13.923200205Z',
  message: { role: 'assistant', content: ' How' },
  done: false
}

*/

    normalizeIt( result ) {
        if ( !result.choices )
            return null;
        if ( !result.choices.length )
            return null;
        if ( !result.choices[0].delta )
            return null;
        if ( !result.choices[0].delta.content )
            return null;
        return { 
            model: result.model,
            created_at: result.created,
            message: { role: 'assistant', content: result.choices[0].delta.content },
            done:false
        }
    }

    async chat( { host, apiKey, model, messages, stream } ) {    
        stream = stream ?? false;
        host = host ?? this.defaultHost();

        const rep = await fetch( host + "/chat/completions", {
            method: "POST",
            format:"json",
            headers: this.defaultHeaders( {host,apiKey} ),
            body: JSON.stringify( { model, messages, stream } ) 
        } );

        if ( !rep.ok ) {
            throw "Invalid request : " + rep.status
        }

        if ( !stream ) {
            const data = await rep.json();
            return data.choices[0];
        } else {        
            const reader = await rep.body.getReader();
            return super.simple_iterator( reader );
        }
    }

/*
{
  id: 'gpt-4-0613',
  object: 'model',
  created: 1686588896,
  owned_by: 'openai'
}
*/

    async models( { host, apiKey } ) {
        host = host ?? this.defaultHost();
        const rep = await fetch( host + "/models", {
            method: "GET",
            headers: this.defaultHeaders( {host,apiKey} )
        } );
        if ( !rep.ok ) {
            throw "Invalid request : " + rep.status
        }
        const gpt_obj = await rep.json();
        return ( gpt_obj.data || [] ).map( model => ( { name:model.id, ...model } ) );
    }

}

