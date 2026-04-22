/**
 * provider.mjs
 * (c) 2026 Alexandre Brillant
 * https://github.com/AlexandreBrillant/llm-client
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

export class Provider {

    static TEXT_DECODER = new TextDecoder();

    defaultHeaders( {host,apiKey}) {
        return [];
    }

    defaultHost() {
        throw "defaultHost not implemented";
    }

    endPoints() {
        throw "endPoints not implemented";
    }

    modelsResponseNormalizer( response ) {
        throw "modelsResponseNormalizer not implemented";
    }

    chatResponseNormalizer( response ) {
        throw "chatResponseNormalizer not implemented";
    }

    chatBodyRequest( { model, maxTokens, messages, stream } ) {
        return { model, messages, stream };
    }

    #traceMode;

    trace(traceMode) {
        this.#traceMode = traceMode;
    }

    #reader;

    async chat( { host, apiKey, maxTokens, model, messages, stream } ) {    
        stream = stream ?? false;
        host = host ?? this.defaultHost();

        const bodyRequest = this.chatBodyRequest( { model, maxTokens, messages, stream } );

        this.#traceMode && ( console.log( bodyRequest ) );

        const headers = this.defaultHeaders( {host,apiKey,maxTokens} );
        let body = JSON.stringify( bodyRequest );

        const rep = await fetch( host + this.endPoints( model, stream ).chat, {
            method: "POST",
            format:"json",
            headers,
            body
        } );

        if ( !rep.ok ) {
            const errorData = await rep.json();
            const message = errorData.error?.message || errorData.error;

            throw { 
                code : rep.status,
                message : message || " no message " 
            };

        }

        if ( !stream ) {
            return this.chatResponseNormalizer( await rep.json() );
        } else {       
            this.#reader = await rep.body.getReader();
            return this.simple_iterator( maxTokens );
        }
    }

    async models( { host, apiKey } ) {
        host = host ?? this.defaultHost();
        const rep = await fetch( host + this.endPoints().models, {
            headers: this.defaultHeaders( {host,apiKey} )
        } );
        if ( !rep.ok ) {
            throw "Invalid request : " + rep.status
        }
        const response = await rep.json();
        return this.modelsResponseNormalizer( response );
    }

    /////////////////////////////////////////

    parse( chunk ) {
        return JSON.parse( chunk );
    }

    normalizeIt( result ) {
        return result;
    }

    splitChunk( textChunk ) {
        return textChunk.split( "\n" ).filter( line => line.trim() != "" );
    }

    isReading() {
        return this.#reader != null;
    }

    cancel() {
       this.#reader && this.#reader.cancel(); 
    }

    async *simple_iterator( maxTokens ) {
        const that = this;
        let index = 1;
        let chunkAccumulator = "";
        const reader = that.#reader;

        while ( true ) {
            const { done, value } = await reader.read();
            if ( done ) break;
            const textChunk = Provider.TEXT_DECODER.decode( value );
            const tab = that.splitChunk( chunkAccumulator + textChunk );
            if ( tab == null ) {
                chunkAccumulator += textChunk;
            } else {        
                chunkAccumulator = "";
                for ( let chunk of tab ) {
                    if ( chunk ) {
                        try {
                            const parsedChunk = that.parse( chunk );
                            if ( typeof parsedChunk == "boolean" )
                                break;
                            const result = this.normalizeIt( parsedChunk );
                            if ( !result )
                                break;
                            yield result;
                        } catch( error ) {
                            break;
                        }
                    }
                }
            }
        }

        that.#reader = null;
    }

}



