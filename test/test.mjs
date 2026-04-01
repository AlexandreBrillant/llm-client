import { dirname, join } from 'path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const chunk = readFileSync( join( __dirname, "chunk.txt" ), "UTF8" ); 



const regexp = new RegExp( `"text":\\s+"(.*)"`, "g" );

const res = regexp.exec( chunk );
if ( res ) {
    console.log( res[1] );
}
