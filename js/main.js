var password = "PASSWORD";
var user = "USER"
var server = "COUCHDB_SERVER_DATABASE";
/*
  REMOTE DB
*/
var options = {
  skipSetup:true
}

var ajaxOpts = {
  ajax :{
    headers :{
      //GLOBAL ACCESS
      Authorization : 'Basic ' + window.btoa(user +":" + password)
    }
  }
}

//ENTFERNTE DATENBANK anbinden
var db = new PouchDB(server, options);
//var db = new PouchDB("gnuocean");

  //GLOBAL ACCESS
  db.login(user, password, ajaxOpts).then(function(err, response){
  //console.log(err);
  //console.log(response);
})

//Get actual millisecond-timeing
function getTime(){
    d = new Date();
    return d.getTime();
}

