const { routesHandler, homeRoute, testRoute, userHandler, userRoute, userToken, checkUrlHandler, checkUrl } = require( "./handlers/routeHandlers/routesHandlers" );


const routes = {
    "test": testRoute,
    "": homeRoute,
    "user": userRoute,
    "token": userToken,
    "checks": checkUrl
};

module.exports = routes;