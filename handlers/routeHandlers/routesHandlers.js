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

module.exports = handler;