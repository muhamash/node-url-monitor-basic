const { routesHandler, homeRoute, testRoute, userHandler } = require( "./handlers/routeHandlers/routesHandlers" );


const routes = {
    "test": testRoute,
    "": homeRoute,
    "user": userHandler,
};

module.exports = routes;