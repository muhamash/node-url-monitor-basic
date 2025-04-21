const http = require( 'http' );

const worker = {};

worker.init = () =>
{
    console.log( 'Worker is running' );
}
module.exports = worker;