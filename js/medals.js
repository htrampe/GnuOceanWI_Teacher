/* CHARAKTER */
//Load Medals
function loadMedals(){
  db.allDocs({
      include_docs : true,
      attachments: true,
      startkey : "MEDALS",
      endkey : "MEDALS" + "\uffff"
    }).then(function (result) {
       
      newmedalcontent = '  <table class="table table-striped" id="mtable">\
    <thead>\
      <tr>\
        <th>Foto</th>\
        <th>Name</th>\
        <th>Punkte</th>\
        <th>Beschreibung</th>\
        <th></th>\
      </tr>\
    </thead>\
    <tbody>';

      counter = 0;
      for(i in result["rows"]){

        newmedalcontent += '<tr>\
        <td style="max-width: 25px">\
      <img src="data:image/jpg;base64,'+result["rows"][i]['doc']['_attachments']['medal.png']['data']+'"\
           style="max-width: 75%"/>\
        </td>\
        <td>'+result["rows"][i]['doc']['medalname']+'</td>\
        <td>'+result["rows"][i]['doc']['medalpoints']+'</td>\
        <td>'+result["rows"][i]['doc']['medaldesc']+'</td>\
        <td><button type="button" class="btn btn-primary btn-sm" onclick="changeMedal(\''+result["rows"][i]['id']+'\')"><i class="fa fa-wrench" aria-hidden="true"></i>\
           </button></td>\
        </tr>';
        counter++;
      }

      newmedalcontent += '</tbody></table>';
      $("#medalcontent").html(newmedalcontent);
      $("#medal_count").html(counter);
      $('#mtable').DataTable();
    });
}


//Save Medal Foto
function loadImgAndSaveMedal(file, medalname, medaldesc, medalid, medalpoints) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
   tempstring = reader.result;
     tempstring = tempstring.split(",");
     finalimg = tempstring[1];

     //Doc to upload
     var doc = {
       "_id": medalid,
       "medalname": medalname,
       "medalpoints" : medalpoints,
       "medaldesc" : medaldesc,
       "_attachments": {
         "medal.png": {
           "content_type": "image/png",
           "data": finalimg
         }
       }
     };

     //Put the doc
     db.put(doc).then(function (result) {
     //  console.log(result);
       $("#newmedalmod").modal("toggle");
       $("#medalname").val("");
       $("#medalpoints").val("");
       $("#medaldesc").val("");
       $("#medalfoto").val("");
       $("#button_savenewmedal").show();
       $("#button_updatemedal").hide();
       location.reload();              
     }).catch(function (err) {
       //console.log(err);
     });
   };
   reader.onerror = function (error) {
     //console.log('Error: ', error);
   };
}

//Reset MedalMod
function resetNewMedalMod(){
   $("#medalname").val("");
   $("#medaldesc").val("");
   $("#medalpoints").val("");
   $("#button_savenewmedal").show();
   $("#button_updatemedal").hide();
   $("#button_deletemedal").hide();
}

//Save new MEDAL
function saveNewMedal(){
  var medalname = $("#medalname").val();
  var medaldesc = $("#medaldesc").val();
  var medalpoints = $("#medalpoints").val();
  var medalid = "MEDALS_" + medalname.replace(/[^a-zA-Z0-9]/g, '') + "_" + getTime();
  loadImgAndSaveMedal($("#medalfoto")[0].files[0], medalname, medaldesc, medalid, medalpoints);

}

//Save temp ID of a medal for updating/deleting
tempmedalid = "";

//Change Char
function changeMedal(id){
  tempmedalid = id;
  db.get(id, {attachments:true, include_docs:true}).then(function(doc){
      $("#button_savenewmedal").hide();
      $("#button_updatemedal").show();
      $("#button_deletemedal").show();
      $("#newmedalmod").modal("toggle");
      $("#medalname").val(doc.medalname); 
      $("#medaldesc").val(doc.medaldesc); 
      $("#medalpoints").val(doc.medalpoints); 
      $("#medalfoto").val();
  })
}

//Save update infos from medal
function updateMedal(){

  var medalname = $("#medalname").val();
  var medaldesc = $("#medaldesc").val();
  var medalpoints = $("#medalpoints").val();

  
  if($("#medalfoto")[0].files[0] == undefined){
    db.get(tempmedalid).then(function(doc) {
      return db.put({
        _id: tempmedalid,
        _rev: doc._rev,
        "medalname": medalname,
        "medaldesc" : medaldesc,
        "medalpoints" : medalpoints,
        "_attachments": {
          "medal.png": doc._attachments["medal.png"]
        }
        }); 
    }).then(function(resp){
      location.reload();
    })
  }
  else{
    var reader = new FileReader();
    reader.readAsDataURL($("#medalfoto")[0].files[0]);
    reader.onload = function () {
    tempstring = reader.result;
    tempstring = tempstring.split(",");
    finalimg = tempstring[1];

      db.get(tempmedalid).then(function(doc) {
      return db.put({
        _id: tempmedalid,
        _rev: doc._rev,
        "medalname": medalname,
        "medaldesc" : medaldesc,
        "medalpoints" : medalpoints,
         "_attachments": {
         "medal.png": {
           "content_type": "image/png",
           "data": finalimg
         }
       }
      }); 
      }).then(function(resp){
        location.reload();
      })
    }
  }  
}

//Delete a Medal
function deleteMedal(){
  if (confirm('Sicher den Orden unwiderbringlich löschen?')) {
    // DELETE
      db.get(tempmedalid).then(function (doc) {
        return db.remove(doc).then(function(){location.reload()});
      });    
  } else {
    // ABORT DELETING
  }
}
