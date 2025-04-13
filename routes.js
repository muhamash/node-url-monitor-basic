const { routesHandler, homeRoute, testRoute } = require( "./handlers/routeHandlers/routesHandlers" );


const routes = {
    "test": testRoute,
    "": homeRoute,
};

module.exports = routes;