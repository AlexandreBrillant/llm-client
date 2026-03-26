/**
 * provider.mjs
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

export class Provider {

    static TEXT_DECODER = new TextDecoder();

    async chat( { host, apiKey, model, messages, stream } ) {
        throw "not implemented !";
    }

    async models( { host, apiKey } ) {
        throw "not implemented !";
    }

    parse( chunk ) {
        return JSON.parse( chunk );
    }

    normalizeIt( result ) {
        return result;
    }

    async *simple_iterator( reader ) {
        const that = this;
        while ( true ) {
            const { done, value } = await reader.read();
            if ( done ) break;
            const textChunk = Provider.TEXT_DECODER.decode( value );            
            const tab = textChunk.split( "\n" ).filter( line => line.trim() != "" );
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

}

