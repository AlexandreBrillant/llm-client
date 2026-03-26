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

import { OllamaProvider } from "./ollama.mjs ";


const DEFAULT_HOST = "https://ollama.com";

export class OllamaCloudProvider extends OllamaProvider {

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
        return "ollama-cloud";
    }

/* 
    {
        "name":"ministral-3:14b",
        "model":"ministral-3:14b",
        "modified_at":"2026-03-20T16:36:25.485217708+01:00",
        "size":9082537546,
        "digest":"4760c35aeb9d9e9c6174c2492562c0b999e80a222804fd96b1915ab72bbcdcf7",
        "details":
            {
                "parent_model":"",
                "format":"gguf",
                "family":"mistral3",
                "families":["mistral3"],
                "parameter_size":"13.9B",
                "quantization_level":"Q4_K_M"}
    }
*/

}

