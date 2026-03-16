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

import { Provider} from "./provider.mjs";

const DEFAULT_HOST = "http://localhost:11434";

export class OllamaProvider extends Provider {
    async chat( { host, model, messages, stream } ) {    
       stream = stream ?? false;
        host = host ?? DEFAULT_HOST;

        const rep = await fetch( host + "/api/chat", {
            method: "POST",
            format:"json",
            body: JSON.stringify( { model, messages, stream } ) 
        } );

        if ( !rep.ok ) {
            throw "Invalid request : " + rep.status
        }

        if ( !stream ) {
            return await rep.json();
        } else {        
            const reader = await rep.body.getReader();
            return super.simple_iterator( reader );
        }
    }
}

