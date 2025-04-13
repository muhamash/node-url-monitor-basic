const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require( '../routes' );
const { notFoundHandler } = require('../handlers/routeHandlers/notFoundHandlers');

const handler = {};

handler.handleReqRes = (req, res) => {
    // Request handling
    const parseUrl = url.parse(req.url, true);
    const pathname = parseUrl.pathname;
    const cleanedPath = pathname.replace( /^\/+|\/+$/g, '' ); // '/' => '/'
    const method = req.method.toLowerCase();
    const queryString = parseUrl.query;
    const headers = req.headers;

    const requestProperties = {
        parseUrl,
        pathname,
        cleanedPath,
        method,
        queryString,
        headers
    };

    const decoder = new StringDecoder('utf-8');
    let realData = '';

    const chosenHandler = routes[ cleanedPath ] ? routes[ cleanedPath ] : notFoundHandler;
    // console.log(chosenHandler, notFoundHandler, cleanedPath)

    req.on('data', (buffer) => {
        realData += decoder.write(buffer);
    });

    req.on('end', () => {
        realData += decoder.end();
        requestProperties.body = realData;

        chosenHandler(requestProperties, (statusCode, payload) => {
            const finalStatusCode = typeof statusCode === 'number' ? statusCode : 500;
            const finalPayload = typeof payload === 'object' ? payload : {};

            const payloadString = JSON.stringify(finalPayload);

            res.setHeader('Content-Type', 'Application/json')
            res.writeHead(finalStatusCode, { 'Content-Type': 'application/json' });
            res.end(payloadString);
        });
    });

    // console.log(pathname, cleanedPath, method, queryString, headers);
};

module.exports = handler;