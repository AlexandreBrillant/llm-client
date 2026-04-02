/**
 * anthropic.mjs
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

import { Provider } from "../provider.mjs ";

const DEFAULT_HOST = "https://api.anthropic.com/v1";

export class AnthropicProvider extends Provider {

    defaultHeaders( {host,apiKey}) {
        if ( !apiKey )
            throw "apiKey is required for this usage";
        return {
            "Content-Type" : "application/json",
            "anthropic-version" : "2023-06-01",
            "X-Api-Key" : apiKey
        };
    }

    defaultHost() {
        return DEFAULT_HOST;
    }

    endPoints() {
        return { 
            models : "/models",
            chat : "/messages"
        };
    }

    modelsResponseNormalizer( response ) {
        return ( response.data || [] ).map( model => ( { name:model.id, ...model } ) );        
    }

    toString() {
        return "anthropic";
    }

    parse( chunk ) {
        const message = chunk.replace(/^data: /, "");
        if ( message == "[DONE]" )
            return false;
        return JSON.parse( message );
    }

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

    chatBodyRequest( { model, maxTokens, messages, stream } ) {
        const { system, res } = messages.reduce(
            (acc, msg) => {
                if (msg.role == "system") {
                    acc.system = msg.content;
                } else {
                    acc.res.push( msg );
                }
                return acc;
            }, { 
                system:undefined,
                res:[] }
        );
        const bodyRequest = { model, "max_tokens":(maxTokens||1024), messages:res, ...( system ? { system } : {} ), stream };
        return bodyRequest;
    }

    chatResponseNormalizer( response ) {
        return { message: {
            content : response.content[0].text
        } };
    }

    async *simple_iterator( reader ) {
        const that = this;
        all:while ( true ) {
            const { done, value } = await reader.read();
            if ( done ) break;
            const textChunk = Provider.TEXT_DECODER.decode( value );     
            const lines = textChunk.split("\n");
            for ( const line of lines ) {
                if ( line.startsWith( "data:" ) ) {
                    const dataJSON = line.substring( 5 );
                    const dataObj = JSON.parse( dataJSON );
                    if ( dataObj.type == "content_block_delta" ) {
                        const result = dataObj.delta.text;
                        yield { message : { role : 'assistant', content:result } };
                    } else 
                    if ( dataObj.type == "content_block_stop" )
                        break all;
                }
            }
        }
    }

}

