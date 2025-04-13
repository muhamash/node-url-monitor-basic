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

handler.userHandler = ( requestProperties, callback ) =>
{
    const acceptedMethods = [ 'get', 'put', 'patch', 'delete' ];
    if ( acceptedMethods.indexOf( requestProperties.method ) > -1 )
    {
        handler._user[ requestProperties.method ]( requestProperties, callback );
    }
    else
    {
        callback( 405, {
            message: "Brother you are method is not allowed"
        })
    }
    // callback( 200, {
    //     message: "This is user handler"
    // })
}


handler._users = {};

handler._users.post = (requestProperties, callback) =>
{
    
}

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