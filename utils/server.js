const http = require( 'http' );
const { handleReqRes } = require( "./handleReqRes" );
const { sendTwilioSms } = require( './notifications' );


const server = {};

// sendTwilioSms();

// configuration
server.config = {
    port: 3000,
};

// create server
server.createServer = () => {
    const serverInit = http.createServer(server.handleReqRes);
    serverInit.listen(server.config.port, () => {
        console.log(`listening to port ${server.config.port}`); 
    });
};

// handle Request Response
server.handleReqRes = handleReqRes;

// start the server
// server.createServer();
server.init = () =>
{
    // start the server
    server.createServer();
};

module.exports = server;