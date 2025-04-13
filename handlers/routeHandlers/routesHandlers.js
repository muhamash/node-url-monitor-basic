const lib  = require( "../../utils/data" );
const {  parsedJson, hashing } = require("../../utils/helper")

const handler = {};

handler.testRoute = (requestProperties, callback) => {
    // console.log(requestProperties);

    callback(200, {
        message: 'This is a test url',
    });
};

handler.homeRoute = (requestProperties, callback) => {
    // console.log(requestProperties);

    callback(200, {
        message: 'This is a home url',
    });
};

handler.userRoute = ( requestProperties, callback ) =>
{
    // console.log(requestProperties)
    const acceptedMethods = [ 'get', 'post', 'put', 'delete' ];
    if ( acceptedMethods.indexOf( requestProperties.method ) > -1 )
    {
        handler._users[ requestProperties.method ]( requestProperties, callback );
    }
    else
    {
        callback( 405, {
            message: "Brother your method is not allowed"
        })
    }
    // callback( 200, {
    //     message: "This is user handler"
    // })
}


handler._users = {};

handler._users.post = ( requestProperties, callback ) =>
{
    const firstName = typeof ( requestProperties.body.firstName ) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof ( requestProperties.body.lastName ) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phoneNumber = typeof ( requestProperties.body.phoneNumber ) === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false;

    const password = typeof ( requestProperties.body.password ) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
 
    const agreement = typeof ( requestProperties.body.agreement ) === "boolean" ? requestProperties.body.agreement : false;

    if ( firstName && lastName && phoneNumber && password && agreement )
    {
        lib.read( 'users', phoneNumber, ( error, user ) =>
        {
            if ( error )
            {
                let userObject = {
                    firstName,
                    lastName,
                    phoneNumber,
                    agreement,
                    password: hashing( password )
                }

                // console.log( userObject );
                lib.create( 'users', phoneNumber, userObject, ( error ) =>
                {
                    delete userObject.password
                    if ( !error )
                    {
                        callback( 200, {
                            message: "created!!",
                            userObject
                        })
                    }
                    else
                    {
                        callback( 500, {
                            message: 'can not create the user!!'
                        } );
                    }
                } )
            }
            else
            {
                callback( 500, {
                    message: 'There was a problem in server side!!'
                } )
            }
        } );
    } else
    {
        callback( 400, {
            message: "Something wrong while creating a user!!"
        } )
    }

};

handler._users.get = (requestProperties, callback) =>
{
    const phoneNumber = typeof ( requestProperties.queryString.phoneNumber ) === 'string' && requestProperties.queryString.phoneNumber.trim().length === 11 ? requestProperties.queryString.phoneNumber : false;

    if ( phoneNumber )
    {
        lib.read( 'users', phoneNumber, ( error, data ) =>
        {
            // console.log( error, data );
            if ( !error && data )
            {
                const user = {...parsedJson( data )};

                delete user.password;
                callback( 200, {
                    message: "found!!",
                    user
                })
            } else
            {
                callback( 404, {
                    message: 'requested user was not found from the database!'
                } );
            }
        })
    }
    else
    {
        callback( 404, {
            message: 'requested user was not found!!!'
        })
    }
}

handler._users.put = (requestProperties, callback) =>
{
    const firstName = typeof ( requestProperties.body.firstName ) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof ( requestProperties.body.lastName ) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phoneNumber = typeof ( requestProperties.body.phoneNumber ) === 'string' && requestProperties.body.phoneNumber.trim().length === 11 ? requestProperties.body.phoneNumber : false;

    const password = typeof ( requestProperties.body.password ) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if ( phoneNumber )
    {
        if ( firstName || lastName || password )
        {
            lib.read( 'users', phoneNumber, ( error, data ) =>
            {
                const userData = { ...parsedJson(data) };
                console.log( userData, data );

                if( !error && data ){
                    if ( firstName )
                    {
                        userData.firstName = firstName
                    }
                    if ( lastName )
                    {
                        userData.lastName = lastName
                    }
                    if ( password )
                    {
                        userData.password = hashing(password)
                    }

                    lib.update( 'users', phoneNumber, userData, ( error ) =>
                    {
                        if ( !error )
                        {
                            callback( 200, {
                                message: "updated!",
                                userData
                            })
                        }
                        else
                        {
                            callback( 500, {
                                message: "error on server"
                            } );
                        }
                    })
                }
                else
                {
                    callback( 400, {
                        message: "error while reading the database"
                    } );
                }
            })
        }
        else
        {
            callback( 400, {
                message: "maybe body is not correctly passing through the functions!"
            })
        }
    }
    else
    {
        callback( 400, {
            message: "Invalid phone number!"
        })
    }
}

handler._users.delete = (requestProperties, callback) =>
{
    
}

module.exports = handler;