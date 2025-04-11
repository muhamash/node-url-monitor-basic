const handler = {};

handler.routesHandler = (requestProperties, callback) => {
    // console.log(requestProperties);

    callback(200, {
        message: 'This is a sample url',
    });
};

module.exports = handler;