const http = require( 'http' );
const https = require( 'https' );
const data = require( './data' );
const { parsedJson } = require( './helper' );
const { sendTwilioSms } = require( './notifications' );

const worker = {};

worker.alertUserToStatusChange = ( originalCheckData, checkOutcome ) =>
{
    let msz = `Alert: Your check for ${ originalCheckData.method } ${ originalCheckData.protocol }://${ originalCheckData.url } is ${ checkOutcome.error ? 'down' : 'up' } with response code ${ checkOutcome.responseCode }`;
    console.log( msz );
    // send the notification
    // sendTwilioSms( originalCheckData.userPhone, msz, ( err ) =>
    // {
    //     if ( !err )
    //     {
    //         console.log( 'Success: User was alerted' );
    //     }
    //     else
    //     {
    //         console.log( 'Error: Could not send the message' );
    //     }
    // } );
}

worker.processCheckOutcome = ( originalCheckData, checkOutcome ) =>
{
    let status = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCode.indexOf( checkOutcome.responseCode ) > -1 ? 'up' : 'down';

    // decide if we should alert the user
    let alertWanted = originalCheckData.lastChecked && originalCheckData.state !== status ? true : false;
    // update the check data
    const newCheckData = { ...originalCheckData };
    newCheckData.state = status;
    newCheckData.lastChecked = Date.now();
    // update the check data
    data.update( 'checks', newCheckData.id, newCheckData, ( err ) =>
    {
        if ( !err )
        {
            // send the check data to the next step
            if ( alertWanted )
            {
                worker.alertUserToStatusChange( newCheckData, checkOutcome );
            }
            else
            {
                console.log( 'Check outcome has not changed, no need to alert' );
            }
        }
        else
        {
            console.log( 'Error updating one of the checks' );
        }
    } );


}

worker.performCheck = ( originalCheckData ) =>
{
    // prepare the initial check outcome
    const checkOutcome = {
        'error': false,
        'responseCode': false
    }

    // mark the outcome 
    let outcomeSent = false;

    // parse the hostname and path
    const parsedUrl = new URL( originalCheckData.protocol + '://' + originalCheckData.url );
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    const requestDetails = {
        'protocol': originalCheckData.protocol + ':',
        'hostname': hostName,
        'method': originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeOfSecs * 1000
    }

    const protocolToUse = requestDetails.protocol === 'http:' ? http : https;

    let req = protocolToUse.request( requestDetails, ( res ) =>
    {
        // grab status code of the response
        const status = res.statusCode;
        // update the check data and pass to the next step
        if(!outcomeSent)
        {
            checkOutcome.responseCode = status;
            // checkOutcome.responseCode = status;
            // if ( status === 200 || status === 201 )
            // {
            //     checkOutcome.error = false;
            // }
            // else
            // {
            //     checkOutcome.error = true;
            // }
            // update the check outcome and pass to the next step
            worker.processCheckOutcome( originalCheckData, checkOutcome );
            outcomeSent = true;
        }
    } );

    req.on( 'error', ( e ) =>
    {
        if(!outcomeSent)
        {
            checkOutcome.error = true;
            checkOutcome.responseCode = false;
            // update the check outcome and pass to the next step
            worker.processCheckOutcome( originalCheckData, checkOutcome );
            outcomeSent = true;
        } 
    } );

    req.on( 'timeout', ( e ) =>
    {
        if ( !outcomeSent )
        {
            checkOutcome.error = 'timeout';
            checkOutcome.responseCode = false;
            // update the check outcome and pass to the next step
            worker.processCheckOutcome( originalCheckData, checkOutcome );
            outcomeSent = true;
        }
    } );

    req.end();
}

worker.validateCheckData = ( originalCheckData ) =>
{
    if ( originalCheckData && originalCheckData.id )
    {
        originalCheckData.state = typeof originalCheckData.state === 'string' && [ 'up', 'down' ].indexOf( originalCheckData.state ) > -1 ? originalCheckData.state : 'down';
        
        originalCheckData.lastChecked = typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        worker.performCheck( originalCheckData );
    }
    else
    {
        console.log( 'Error: Check data is not properly formatted' );
    }
}

worker.gatherAllChecks = () =>
{
    data.list( 'checks', ( err, checks ) =>
    {
        if ( !err && checks && checks.length > 0 )
        {
            checks.forEach( check =>
            {
                // read the check data
                data.read( 'checks', check, ( err1, originalCheckData ) =>
                {
                    if ( !err1 && originalCheckData )
                    {
                        worker.validateCheckData( parsedJson( originalCheckData ) );
                    }
                    else
                    {
                        console.log( 'Error reading one of the check data' );
                    }
                } );
            } );
        }
        else
        {
            console.log( 'Error: could not find any checks to process' );
        }
    } );
}

worker.loop = () =>
{
    setInterval( () =>
    {
        console.log( 'This is the interval' );
        worker.gatherAllChecks();
    }, 5000 );
}

worker.init = () =>
{
    console.log( 'Worker is running' );
    // execute all the checks immediately
    worker.gatherAllChecks();
    // loop to execute checks
    // setInterval( () =>
    // {
    //     worker.gatherAllChecks();
    // }, 1000 * 60 * 60 );
    worker.loop();
}
module.exports = worker;