const { routesHandler, homeRoute, testRoute, userHandler, userRoute } = require( "./handlers/routeHandlers/routesHandlers" );


const routes = {
    "test": testRoute,
    "": homeRoute,
    "user": userRoute,
};

module.exports = routes;