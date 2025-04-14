const lib = require( "../../utils/data" );
const { hashing, generateRandStr, parsedJson } = require( "../../utils/helper" );

const tokenHandlers = {};

tokenHandlers.post = (requestProperties, callback) =>
{ 
    const phoneNumber = typeof ( requestProperties.body.phoneNumber ) === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false;

    const password = typeof ( requestProperties.body.password ) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if ( phoneNumber && password )
    {
        lib.read( 'users', phoneNumber, ( error, user ) =>
        {
            let hashedPass = hashing( password );

            if ( hashedPass === parsedJson(user).password )
            {
                let tokenId = generateRandStr( 20 );
                let expires = Date.now() + 60 + 60 * 1000;
                let token = {
                    phoneNumber,
                    expires,
                    tokenId 
                }

                lib.create( 'tokens', tokenId, token, ( error ) =>
                { 
                    if ( !error )
                    {
                        callback( 200, token );
                    }
                    else
                    {
                        callback( 500, {
                            message:"there was something unexpected on the server!"
                        })
                    }
                } ); 
            }
            else
            {
                callback( 400, {
                    message: "invalid password"
                })
            }
        })
    }
    else
    {
        callback( 400, {
            message: 'something was wrong on server!'
        })
    }

};

tokenHandlers.get = () => { };

tokenHandlers.put = () => { };

tokenHandlers.delete = () => { };

module.exports = tokenHandlers;