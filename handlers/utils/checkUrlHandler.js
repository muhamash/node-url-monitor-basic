const lib = require( "../../utils/data" );
const { hashing, generateRandStr, parsedJson } = require( "../../utils/helper" );
const { verify } = require( "./tokenHandlers" );

const checkUrlHandler = {};

checkUrlHandler.post = ( requestProperties, callback ) =>
{
    let protocol = typeof ( requestProperties.body.protocol ) === 'string' && [ 'http', 'https' ].indexOf( requestProperties.body.protocol ) > -1 ? requestProperties.body.protocol : false;

    let url = typeof ( requestProperties.body.url ) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof ( requestProperties.body.method ) === 'string' && [ 'GET', 'POST', 'PUT', 'DELETE' ].indexOf( requestProperties.body.method ) > -1 ? requestProperties.body.method : false;

    let successCode = typeof ( requestProperties.body.successCode ) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false;

    let timeOfSecs =
        typeof requestProperties.body.timeOfSecs === 'number' &&
            requestProperties.body.timeOfSecs % 1 === 0 &&
            requestProperties.body.timeOfSecs >= 1 &&
            requestProperties.body.timeOfSecs <= 5
            ? requestProperties.body.timeOfSecs
            : false;

    if ( protocol && url && method && successCode && timeOfSecs )
    {
        let token = typeof requestProperties.headers.token === 'string' ? requestProperties.headers.token : false;

        lib.read( 'tokens', token, ( error, tokenData ) =>
        {
            if ( !error && tokenData )
            {
                const parsedData = parsedJson( tokenData );
                const userPhone = parsedData.phoneNumber;

                lib.read( 'users', userPhone, ( error, userData ) =>
                {
                    if ( !error && userData )
                    {
                        verify( token, userPhone, ( tokenIsValid ) =>
                        {
                            if ( tokenIsValid )
                            {
                                const userObject = parsedJson( userData );
                                const userChecks =
                                    typeof userObject.checks === 'object' &&
                                        userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];

                                if ( userChecks.length < 5 )
                                {
                                    const checkId =generateRandStr( 20 );
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCode,
                                        timeOfSecs,
                                    };
                                    // save the object
                                    lib.create( 'checks', checkId, checkObject, ( err3 ) =>
                                    {
                                        if ( !err3 )
                                        {
                                            // add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push( checkId );

                                            // save the new user data
                                            lib.update( 'users', userPhone, userObject, ( err4 ) =>
                                            {
                                                if ( !err4 )
                                                {
                                                    // return the data about the new check
                                                    callback( 200, checkObject );
                                                } else
                                                {
                                                    callback( 500, {
                                                        error:
                                                            'There was a problem in the server side!',
                                                    } );
                                                }
                                            } );
                                        } else
                                        {
                                            callback( 500, {
                                                error: 'There was a problem in the server side!',
                                            } );
                                        }
                                    } );
                                } else
                                {
                                    callback( 401, {
                                        error: 'Userhas already reached max check limit!',
                                    } );
                                }
                            } else
                            {
                                callback( 403, {
                                    message: 'authentication failed!!'
                                } )
                            }
                        } )
                    }
                    else
                    {
                        callback( 403, {
                            message: 'user not found'
                        } )
                    }
                } )
            }
            else
            {
                callback( 403, {
                    message: "authentication problem!"
                } )
            }
        } )
    }
    else
    {
        callback( 400, {
            message: 'problem in server!'
        } )
    }

};

checkUrlHandler.get = (requestProperties, callback) =>
{
    
}

checkUrlHandler.put = (requestProperties, callback) =>
{
    
}

checkUrlHandler.delete = (requestProperties, callback) =>
{
    
}

module.exports = checkUrlHandler;