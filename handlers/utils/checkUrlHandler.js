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
    const id =
        typeof requestProperties.queryString.id === 'string' &&
        requestProperties.queryString.id.trim().length === 20
            ? requestProperties.queryString.id
            : false;

    console.log(id, 'id')
    if (id) {
        // lookup the check
        lib.read( 'checks', id, ( err, checkData ) =>
        {
            console.log(checkData, err)
            if (!err && checkData) {
                const token =
                    typeof requestProperties.headers.token === 'string'
                        ? requestProperties.headers.token
                        : false;

                verify(
                    token,
                    parsedJson(checkData).userPhone,
                    (tokenIsValid) => {
                        if ( tokenIsValid )
                        {
                            const parsedCheckData = parsedJson( checkData );
                            callback(200, parsedCheckData);
                        } else {
                            callback(403, {
                                error: 'Authentication failure!',
                            });
                        }
                    }
                );
            } else {
                callback(500, {
                    error: 'You have a problem in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
}

checkUrlHandler.put = ( requestProperties, callback ) =>
{
    let protocol = typeof ( requestProperties.body.protocol ) === 'string' && [ 'http', 'https' ].indexOf( requestProperties.body.protocol ) > -1 ? requestProperties.body.protocol : false;

    let url = typeof ( requestProperties.body.url ) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    let method = typeof ( requestProperties.body.method ) === 'string' && [ 'GET', 'POST', 'PUT', 'DELETE' ].indexOf( requestProperties.body.method ) > -1 ? requestProperties.body.method : false;

    let successCode = typeof ( requestProperties.body.successCode ) === 'object' && requestProperties.body.successCode instanceof Array ? requestProperties.body.successCode : false;

    const id =
        typeof requestProperties.body.id === 'string' &&
            requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    let timeOfSecs =
        typeof requestProperties.body.timeOfSecs === 'number' &&
            requestProperties.body.timeOfSecs % 1 === 0 &&
            requestProperties.body.timeOfSecs >= 1 &&
            requestProperties.body.timeOfSecs <= 5
            ? requestProperties.body.timeOfSecs
            : false;

    if ( protocol || url || method || successCode || timeOfSecs && id )
    {
        lib.read( 'checks', id, ( error, checkData ) =>
        {
            if ( !error && checkData )
            {
                const checkObject = parsedJson( checkData );
                const token =
                    typeof requestProperties.headers.token === 'string'
                        ? requestProperties.headers.token
                        : false;
                
                
                verify( token, checkObject.userPhone, ( tokenIsValid ) =>
                {
                    if ( tokenIsValid )
                    {
                        if ( protocol )
                        {
                            checkObject.protocol = protocol;
                        }
                        if ( url )
                        {
                            checkObject.url = url;
                        }
                        if ( method )
                        {
                            checkObject.method = method;
                        }
                        if ( successCodes )
                        {
                            checkObject.successCode = successCode;
                        }
                        if ( timeoutSeconds )
                        {
                            checkObject.timeOfSecs = timeOfSecs;
                        }
                        // store the checkObject
                        lib.update( 'checks', id, checkObject, ( error ) =>
                        {
                            if ( !error )
                            {
                                callback( 200 );
                            } else
                            {
                                callback( 500, {
                                    message: 'There was a server side error!',
                                } );
                            }
                        } );
                    } else
                    {
                        callback( 403, {
                            message: 'Authentication error!',
                        } );
                    }
                } )
            } else
            {
                callback( 400, {
                    message: "something wrong tried with id to read the file"
                } )
            }
        } )
    }
};

checkUrlHandler.delete = ( requestProperties, callback ) =>
{
    const id =
        typeof requestProperties.queryString.id === 'string' &&
            requestProperties.queryString.id.trim().length === 20
            ? requestProperties.queryString.id
            : false;

    if ( id )
    {
        // lookup the check
        lib.read( 'checks', id, ( err1, checkData ) =>
        {
            if ( !err1 && checkData )
            {
                const token =
                    typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;

                verify(
                    token,
                    parsedJson( checkData ).userPhone,
                    ( tokenIsValid ) =>
                    {
                        if ( tokenIsValid )
                        {
                            // delete the check data
                            lib.delete( 'checks', id, ( err2 ) =>
                            {
                                if ( !err2 )
                                {
                                    lib.read(
                                        'users',
                                        parsedJson( checkData ).userPhone,
                                        ( err3, userData ) =>
                                        {
                                            const userObject = parsedJson( userData );
                                            if ( !err3 && userData )
                                            {
                                                const userChecks =
                                                    typeof userObject.checks === 'object' &&
                                                        userObject.checks instanceof Array
                                                        ? userObject.checks
                                                        : [];

                                                // remove the deleted check id from user's list of checks
                                                const checkPosition = userChecks.indexOf( id );
                                                if ( checkPosition > -1 )
                                                {
                                                    userChecks.splice( checkPosition, 1 );
                                                    // resave the user data
                                                    userObject.checks = userChecks;
                                                    lib.update(
                                                        'users',
                                                        userObject.phone,
                                                        userObject,
                                                        ( err4 ) =>
                                                        {
                                                            if ( !err4 )
                                                            {
                                                                callback( 200 );
                                                            } else
                                                            {
                                                                callback( 500, {
                                                                    error:
                                                                        'There was a server side problem!',
                                                                } );
                                                            }
                                                        }
                                                    );
                                                } else
                                                {
                                                    callback( 500, {
                                                        error:
                                                            'The check id that you are trying to remove is not found in user!',
                                                    } );
                                                }
                                            } else
                                            {
                                                callback( 500, {
                                                    error: 'There was a server side problem!',
                                                } );
                                            }
                                        }
                                    );
                                } else
                                {
                                    callback( 500, {
                                        error: 'There was a server side problem!',
                                    } );
                                }
                            } );
                        } else
                        {
                            callback( 403, {
                                error: 'Authentication failure!',
                            } );
                        }
                    }
                );
            } else
            {
                callback( 500, {
                    error: 'You have a problem in your request',
                } );
            }
        } );
    } else
    {
        callback( 400, {
            error: 'You have a problem in your request',
        } );
    }
};

module.exports = checkUrlHandler;