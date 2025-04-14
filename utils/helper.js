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

helper.generateRandStr = (strLen) =>
{
    // let length = strlength;
    // length = typeof strlength === 'number' && strlength > 0 ? strlength : false;

    // if (length) {
    //     const possiblecharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    //     let output = '';
    //     for (let i = 1; i <= length; i += 1) {
    //         const randomCharacter = possiblecharacters.charAt(
    //             Math.floor(Math.random() * possiblecharacters.length)
    //         );
    //         output += randomCharacter;
    //     }
    //     return output;
    // }
    // return false;

    const machine = (length) =>
    {
        const possiblecharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let output = '';
        for (let i = 1; i <= length; i += 1) {
            const randomCharacter = possiblecharacters.charAt(
                Math.floor(Math.random() * possiblecharacters.length)
            );
            output += randomCharacter;
        }
        return output;
    }

    return typeof ( strLen ) === 'number' && strLen > 0 ? machine(strLen) : false;
}

module.exports = helper;