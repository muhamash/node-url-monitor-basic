const https = require( "https" );
const querystring = require('querystring');
const environmentToExport = require( "./environment" );

const notifications = {};

notifications.sendTwilioSms = ( phone, msg, callback ) =>
{ 
    const phone = typeof ( phone ) === 'string' && phone.trim().length === 11 ? phone.trim() : false;

    const userMsg = typeof ( msg ) === 'string' && msg.trim().length > 0 && msg.trim().length < 1600 ? msg.trim() : false;

    if ( phone, userMsg )
    {
        const payload = {
            From: environmentToExport.twilio.fromPhone,
            To: `+88${userPhone}`,
            Body: userMsg,
        };

        // stringify the payload
        const stringifyPayload = querystring.stringify( payload );
        
        // configure the request details
        const requestDetails = {
            hostname: 'api.twilio.com',
            method: 'POST',
            path: `/2010-04-01/Accounts/${environmentToExport.twilio.accountSid}/Messages.json`,
            auth: `${environmentToExport.twilio.accountSid}:${environmentToExport.twilio.authToken}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        // instantiate the request object
        const req = https.request(requestDetails, (res) => {
            // get the status of the sent request
            const status = res.statusCode;
            // callback successfully if the request went through
            if (status === 200 || status === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${status}`);
            }
        });

        req.on('error', (e) => {
            callback(e);
        });

        req.write(stringifyPayload);
        req.end();
     }
    else
    {
        callback(0000, {
            message: "Given params are not satisfied!!"
        })
    }
};

module.exports = notifications;