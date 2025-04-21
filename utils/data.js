const fs = require( 'fs' );
const path = require( 'path' );

const lib = {};

lib.basedir = path.join(__dirname, '/../.data/');

lib.read = (dir, file, callback) =>
{
    fs.readFile( `${lib.basedir + dir}/${file}.json`, 'utf8', ( err, data ) =>
    {
        callback( err, data );
    } );
}

lib.create = function ( dir, file, data, callback )
{
    // open file --> write
    fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (error, fileDescriptor) => {
        // console.log( error );
        if ( !error && fileDescriptor )
        { 
            console.log( data );
            const stringyData = JSON.stringify( data );

            fs.writeFile( fileDescriptor, stringyData, function ( error1 )
            {
                if ( !error1 )
                {
                    fs.close( fileDescriptor, function ( error2 )
                    {
                        if ( !error2 )
                        {
                            callback(false)
                        }
                        else
                        {
                            callback('error while closing the file!', error2)
                        }
                    })
                } 
                else
                {
                    callback("error while writing new file!!!", error1)
                }
            })
        }
        else
        {
            callback('could not create new file already exists!!', error || error?.message)
        }
    } )
}

lib.update = ( dir, file, data, callback ) =>
{
    fs.open( `${lib.basedir + dir}/${file}.json`, 'r+', ( error, fileDescriptor ) =>
    {
        if ( !error && fileDescriptor )
        { 
            const stringifyData = JSON.stringify( data );

            fs.ftruncate( fileDescriptor, ( error ) =>
            {
                if ( !error )
                {
                    fs.writeFile( fileDescriptor, stringifyData, (error) =>
                    {
                        if ( !error )
                        {
                            fs.close( fileDescriptor, ( error ) =>
                            {
                                if ( !error )
                                {
                                    callback( false );
                                }
                                else
                                {
                                    console.log("error while closing")
                                }
                            })
                        }
                        else
                        {
                            console.log('error while writing the file!')
                        }
                    } );
                } else
                {
                    console.log("error while truncating the file!")
                }
            })
        }
        else
        {
            console.log("error updating file or maybe not exist")
        }
    })
}

lib.delete = ( dir, file, callback ) =>
{
    
    fs.unlink( `${lib.basedir + dir}/${file}.json`, ( error ) =>
    {
        if ( !error )
        {
            callback( false );
        } else
        {
            callback( `Error while deleting file` );
        }
    } );
};

lib.list = ( dir, callback ) =>
{
    fs.readdir( `${lib.basedir + dir}/`, ( error, data ) =>
    {
        if ( !error && data && data.length > 0 )
        {
            const trimmedFileNames = [];
            data.forEach( ( fileName ) =>
            {
                trimmedFileNames.push( fileName.replace( '.json', '' ) );
            } );
            callback( false, trimmedFileNames );
        }
        else
        {
            callback( error, [] );
        }
    } );
}

module.exports = lib;