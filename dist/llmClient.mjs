/**
 * llmClient.mjs
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

import { Provider } from "./provider.mjs";

class LLMClient extends Provider {

    #provider;
    #host;
    #apiKey;

    /**
     * @param provider optional LLM provider only if your didn't call setProvider
     */
    constructor( provider ) {
        super();
        if ( provider ) 
            this.setProvider( provider );
    }

    /**
     * Use this LLM provider (ollama,mistral,openai...)
     * @param provider LLMProvider
     */
    setProvider( provider ) {
        if ( !provider instanceof Provider ) {
            throw "Invalid provider, must be a Provider object";
        }
        this.#provider = provider;
    }

    /**
     * Update the default URL host
     * @param host host URL
     */
    setHost( host ) {
        this.#host = host;
    }

    /**
     * @param apiKey for Authorization usage
     */
    setAPIKey( apiKey ) {
        this.#apiKey = apiKey;
    }

    #maxTokens;

    /**
     * @param maxTokens for the response
     */
    setMaxTokens( maxTokens ) {
        this.#maxTokens = maxTokens;
    }

    /**
     * @param host Optional service Location (using the default one else)
     * @param model Required : LLM Model name 
     * @param messages Required : An array of { role : "", content : "" }
     * @param stream By default to true
     * @returns A complete response or an iterable response with the following format { message: { role:"", content:"" } }
     */
    async chat( { model, messages, stream } ) {       
        if ( !model )
            throw "A model is required";
        if ( !messages )
            throw "A message is required";
        if ( !Array.isArray( messages ) )
            throw "messages must be an array of { role, content }";
        if ( !this.#provider )
            throw "No provider ?";
        return this.#provider.chat( { host:this.#host, apiKey:this.#apiKey, maxTokens:this.#maxTokens, model, messages, stream } );
    }

    /**
     * @param host Optional Service location
     * @return an array with a list of available models with the following format { name:..., ... }
     */
    async models() {
        if ( !this.#provider )
            throw "No provider ?";        
        return this.#provider.models( { host:this.#host, apiKey:this.#apiKey } );
    }

}

export { LLMClient };

