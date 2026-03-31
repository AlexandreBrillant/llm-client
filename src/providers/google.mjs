/**
 * google.mjs
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

const DEFAULT_HOST = "https://generativelanguage.googleapis.com/v1beta";

export class GoogleProvider extends Provider {

    defaultHeaders( {host,apiKey}) {
        if ( !apiKey )
            throw "apiKey is required for this usage";
        return {
            "Content-Type" : "application/json",
            "x-goog-api-key" : apiKey
        };
    }

    defaultHost() {
        return DEFAULT_HOST;
    }

    endPoints(model,stream) {
        return { 
            models : "/models",
            chat : "/models/" + model + ( !stream ? ":generateContent" : ":streamGenerateContent" )
        };
    }

    modelsResponseNormalizer( response ) {
        response.models.filter( ( model ) => { 
            if ( model.name.startsWith( "models/" ) )
                model.name = model.name.substring( 7 );
        });
        return response.models;
    }

    chatBodyRequest( { model, maxTokens, messages, stream } ) {
        const tmpcontents = messages.map( message => {
            if ( message.role == "assistant" )
                message.role = "model";
            if ( message.role != "system" )
                return {
                    "role" : message.role,
                    "parts" : [
                        { "text" : message.content }
                    ]
                }
            else
                return message;
        } );

        const { system_instruction, contents } = tmpcontents.reduce(
            (acc, msg) => {
                if (msg.role == "system" ) {
                    const text = msg.content;
                    acc.system_instruction = { 
                        parts:[
                            {
                                text
                            }
                        ]
                    }
                } else {
                    acc.contents.push( msg );
                }
                return acc;
            }, {
                contents:[],
                system_instruction:undefined
            }
        );
        return { system_instruction, contents };
    }

    chatResponseNormalizer( response ) {
        const content = response.candidates[ 0 ]?.content?.parts[0]?.text;
        return { message:{ role:'assistant', content } }
    }

    normalizeIt( chunk ) {
        if ( chunk.candidates )  {
            return { 
                role:"assistant",
                content:chunk.candidates[0]?.content?.parts[0]?.text
            }
        } else
            return null;
    }

}
