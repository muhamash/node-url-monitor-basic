const { routesHandler, homeRoute, testRoute, userHandler, userRoute, userToken } = require( "./handlers/routeHandlers/routesHandlers" );


const routes = {
    "test": testRoute,
    "": homeRoute,
    "user": userRoute,
    "token": userToken
};

module.exports = routes;