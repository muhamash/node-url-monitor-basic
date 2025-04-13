const lib  = require( "../../utils/data" );
const { hashing } = require("../../utils/helper")

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

                lib.create( 'users', phoneNumber, userObject, ( error ) =>
                {
                    if ( !error )
                    {
                        callback( 200, {
                            message: "created!!"
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
    
}

handler._users.patch = (requestProperties, callback) =>
{
    
}

handler._users.delete = (requestProperties, callback) =>
{
    
}

module.exports = handler;