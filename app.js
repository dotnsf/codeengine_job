//. app.js
var settings = require( './settings' );

//. env values
var settings_db_username = 'DB_USERNAME' in process.env ? process.env.DB_USERNAME : settings.db_username; 
var settings_db_password = 'DB_PASSWORD' in process.env ? process.env.DB_PASSWORD : settings.db_password; 
var settings_db_name = 'DB_NAME' in process.env ? process.env.DB_NAME : settings.db_name; 
var settings_db_url = 'DB_URL' in process.env ? process.env.DB_URL : settings.db_url; 
var settings_db_id = 'DB_ID' in process.env ? process.env.DB_ID : 'job1'; 

//. https://www.npmjs.com/package/@cloudant/cloudant
var Cloudantlib = require( '@cloudant/cloudant' );
connect( settings_db_username, settings_db_password, settings_db_url, settings_db_name ).then( function( db ){
  if( db ){
    if( settings_db_id ){
      var datetime = getLocaltime();
      var doc = { _id: settings_db_id, datetime: datetime };
      db.get( settings_db_id, {}, function( err0, body0 ){
        if( !err0 ){
          doc._rev = body0._rev;
        }
        db.insert( doc, function( err, body ){
          if( err ){
            console.log( err );
          }else{
            console.log( doc );
          }
        });
      });
    }else{
      console.log( 'no db_id specified.' );
    }
  }else{
  }
}).catch( function( err0 ){
  console.log( err0 );
});


async function connect( db_username, db_password, db_url, db_name ){
  return new Promise( ( resolve, reject ) => {
    if( db_username && db_password && db_url && db_name ){
      var cloudant = Cloudantlib( { username: db_username, password: db_password, url: db_url } );
      if( cloudant ){
        cloudant.db.get( db_name, function( err, body ){
          if( err ){
            if( err.statusCode == 404 ){
              cloudant.db.create( db_name, function( err, body ){
                if( err ){
                  db = null;
                  reject( 'failed to create db.' );
                }else{
                  db = cloudant.db.use( db_name );
                  resolve( db );
                }
              });
            }else{
              db = cloudant.db.use( db_name );
              resolve( db );
            }
          }else{
            db = cloudant.db.use( db_name );
            resolve( db );
          }
        });
      }else{
        reject( 'failed to connect.' );
      }
    }else{
      reject( 'no enough information to connet.' );
    }
  });
}

function getLocaltime(){
  var dt = ( new Date() );
  var ts = dt.getTime();
  var tz = dt.getTimezoneOffset() / 60;  //. JST:-9
  ts -= ( tz * 60 * 60 * 1000 ); //. make it local
  dt = new Date( ts );

  return dt.toISOString().replace( /T/, ' ' ).replace( /\..+/, '' );  //. YYYY-MM-DD hh:nn:ss
}
