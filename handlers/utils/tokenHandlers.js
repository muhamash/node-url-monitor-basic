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

tokenHandlers.get = ( requestProperties, callback ) =>
{ 
    const tokenId = typeof ( requestProperties.queryString.tokenId ) === 'string' && requestProperties.queryString.tokenId.trim().length === 20 ? requestProperties.queryString.tokenId : false;

    if ( tokenId )
    {
        lib.read( 'tokens', tokenId, ( error, tokenData ) =>
        {
            if ( !error )
            { 
                const parsedToken = parsedJson(tokenData)
                callback( 200, {
                    message: 'token found',
                    token:parsedToken,
                } );
            }
            else
            {
                callback( 400, {
                    message:'something was wrong while getting the token!'
                })
            }
        } );
    } else
    {
        callback( 404, {
            message: "token not found!"
        })
    }

};

tokenHandlers.put = ( requestProperties, callback ) =>
{ 
    const tokenId = typeof ( requestProperties.body.tokenId ) === 'string' && requestProperties.body.tokenId.trim().length === 20 ? requestProperties.body.tokenId : false;

    const updateTokenExpiration = typeof ( requestProperties.body.update ) === 'boolean' && requestProperties.body.update === true ? true : false;

    if ( tokenId && updateTokenExpiration )
    {
        lib.read( 'tokens', tokenId, ( error, tokenData ) =>
        {
            const parsedToken = parsedJson( tokenData );
            
            if ( parsedToken.expires > Date.now() )
            {
                parsedToken.expires = Date.now() + 60 + 60 * 1000;

                lib.update( 'tokens', tokenId, parsedToken, ( error ) =>
                {
                    if ( !error )
                    { 
                        callback( 200, {
                            message: "updated",
                            token : parsedToken
                        })
                    }
                    else
                    {
                        callback( 500, {
                            message: 'server error!!'
                        })
                    }
                })
            }
            else
            {
                callback( 400, {
                    message: 'token expired!'
                })
            }
        } );
    } else
    {
        callback( 400, {
            message:'there was something wrong!'
        })
    }

};

tokenHandlers.delete = (requestProperties, callback) =>
{
    const tokenId = typeof ( requestProperties.queryString.tokenId ) === 'string' && requestProperties.queryString.tokenId.trim().length === 20 ? requestProperties.queryString.tokenId : false;
    
    if ( tokenId )
    {
        lib.read( 'tokens', tokenId, ( error, data ) =>
        {
            // console.log( error, data );
            if ( !error && data )
            {
                lib.delete( 'tokens', tokenId, ( error ) =>
                {
                    if ( !error )
                    {
                        callback( 200, {
                            message: 'deleted!'
                        } )
                    }
                    else
                    {
                        callback( 500, {
                            message: 'there was an error on server'
                        } )
                    }
                } )
            } else
            {
                callback( 404, {
                    message: 'requested user token was not found from the database! or there is an error'
                } );
            }
        } )
    }
    else
    {
        callback( 404, {
            message: 'requested user was not found!!!'
        } )
    }
};

module.exports = tokenHandlers;