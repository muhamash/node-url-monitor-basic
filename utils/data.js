const fs = require( 'fs' );
const path = require( 'path' );

const lib = {};

lib.baseDir = path.join( __dirname, '../.data/' );

lib.create = function ( dir, file, data, callback )
{
    // open file --> write
    fs.open( lib.baseDir + dir + '/' + file + '.json' + 'wx', function ( error, fileDescriptor )
    {
        if ( !error && fileDescriptor )
        { 
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
            callback('could not create new file already exists!!', error)
        }
    } )
}

lib.read = (dir, file, callback) =>
{
    fs.readFile( `${lib.baseDir + dir}/${file}.json`, 'utf8', ( error, data ) =>
    {
        callback( error )
    } );
}

lib.update = ( dir, file, data, callback ) =>
{
    fs.open( `${lib.baseDir + dir}/${file}.json`, 'r+', ( error, fileDescriptor ) =>
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
    fs.unlink( `${lib.baseDir + dir}/${file}.json`, ( error ) =>
    {
        if ( !error )
        {
            callback( false );
        }
        else
        {
            console.log('error while unlinking the file!!')
        }
    })
};

module.export = lib;