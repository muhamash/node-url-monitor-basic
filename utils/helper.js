const crypto = require( 'crypto' );
const environment = require("../utils/environment")

const helper = {};

helper.parsedJson = (jsonString) =>
{
    let output = {};
    // console.log(jsonString, "to be parsed")

    try
    {
        output = JSON.parse( jsonString );
        
    } catch ( error )
    {
        output = {};
        console.log( "parsing json to string -->> failed", error || error?.message );
    } 

    return output;
}

helper.hashing = (str) =>
{
    // console.log(str)
    if ( typeof ( str ) === 'string' && str.length > 0 )
    {
        return crypto.createHmac( 'sha256', environment.secretKey ).update( str ).digest( 'hex' );

        // return hash
    }
}


module.exports = helper;