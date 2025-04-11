const { routesHandler } = require( "./handlers/routeHandlers/routesHandlers" );


const routes = {
    "test": routesHandler,
    "": routesHandler,
};

module.exports = routes;