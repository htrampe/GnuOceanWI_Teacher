/* CHARAKTER */
//Load Chars
function loadChars(){
  db.allDocs({
      include_docs : true,
      attachments: true,
      startkey : "CHARS",
      endkey : "CHARS" + "\uffff"
    }).then(function (result) {
       
      console.log(result);

      new_charcontent = "";
      counter = 0;
      for(i in result["rows"]){
        new_charcontent += '\
          <div class="well well-sm" style="float: left; max-width: 20%; margin-right: 10px; text-align: center">\
          <img src="data:image/jpg;base64,'+result["rows"][i]['doc']['_attachments']['charfoto.png']['data']+'"\
           width="100%"/><br /><br /><h3>' + result["rows"][i]['doc']['charname'] + '\
           &nbsp;<button type="button" class="btn btn-primary btn-sm" onclick="changeChar(\''+result["rows"][i]['id']+'\')"><i class="fa fa-wrench" aria-hidden="true"></i>\
           </button></h3>('+result["rows"][i]['doc']['charnamereal']+')\
           </div>';
        counter++;
      }

      $("#charactercontent").html(new_charcontent);
      $("#char_count").html(counter);

    });
}


//Save Char Foto
function loadImgAndSaveChar(file, charname, chardesc, charid, charnamereal, charclass) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
   tempstring = reader.result;
     tempstring = tempstring.split(",");
     finalimg = tempstring[1];

     //Doc to upload
     var doc = {
       "_id": charid,
       "charname": charname,
       "charnamereal" : charnamereal,
       "charclass" : charclass,
       "coins" : 100,
       "sudocards" : [],
       "medals" : [],
       "quests" : [],
       "chardesc" : chardesc,
       "_attachments": {
         "charfoto.png": {
           "content_type": "image/png",
           "data": finalimg
         }
       }
     };

     //Put the doc
     db.put(doc).then(function (result) {
     //  console.log(result);
       $("#newcharmod").modal("toggle");
       $("#charname").val("");
       $("#charclass").val("");
       $("#charnamereal").val("");
       $("#chardesc").val("");
       $("#charfoto").val("");
       $("#button_savenewchar").show();
       $("#button_updatechar").hide();
       location.reload();              
     }).catch(function (err) {
       //console.log(err);
     });
   };
   reader.onerror = function (error) {
     //console.log('Error: ', error);
   };
}

//Reset CharMod
function resetNewCharMod(){
   $("#charname").val("");
   $("#chardesc").val("");
   $("#charfoto").val("");
   $("#charclass").val("");
   $("#charnamereal").val("");
   $("#button_savenewchar").show();
   $("#button_updatechar").hide();
   $("#button_deletechar").hide();
}

//Save new CHARAKTER
function saveNewChar(){
  var charname = $("#charname").val();
  var charclass = $("#charclass").val();
  var chardesc = $("#chardesc").val();
  var charnamereal = $("#charnamereal").val();
  var charid = "CHARS_" + charname.replace(/[^a-zA-Z0-9]/g, '') + "_" + getTime();
  loadImgAndSaveChar($("#charfoto")[0].files[0], charname, chardesc, charid, charnamereal, charclass);

}

//Save temp ID of a char for updating/deleting
tempcharid = "";

//Change Char
function changeChar(id){
  tempcharid = id;
  db.get(id, {attachments:true, include_docs:true}).then(function(doc){
      $("#button_savenewchar").hide();
      $("#button_updatechar").show();
      $("#button_deletechar").show();
      $("#newcharmod").modal("toggle");
      $("#charname").val(doc.charname); 
      $("#charnamereal").val(doc.charnamereal); 
      $("#chardesc").val(doc.chardesc); 
      $("#charfoto").val();
      $("#charclass").val(doc.charclass);
  })
}

//Save update infos from char
function updateChar(){

  var charname = $("#charname").val();
  var charnamereal = $("#charnamereal").val();
  var chardesc = $("#chardesc").val();
  var charclass = $("#charclass").val();

  console.log($("#charfoto")[0].files[0])

  if($("#charfoto")[0].files[0] == undefined){
    db.get(tempcharid).then(function(doc) {
      return db.put({
        _id: tempcharid,
        _rev: doc._rev,
        "charname": charname,
        "charnamereal" : charnamereal,
        "coins" : doc.coins,
        "sudocards" : doc.sudocards,
        "medals" : doc.medals,
        "quests" : doc.quests,
        "chardesc" : chardesc,
        "charclass" : charclass,
        "_attachments": {
          "charfoto.png": doc._attachments["charfoto.png"]
        }
        }); 
    }).then(function(resp){
      location.reload();
    })
  }
  else{
    var reader = new FileReader();
    reader.readAsDataURL($("#charfoto")[0].files[0]);
    reader.onload = function () {
    tempstring = reader.result;
    tempstring = tempstring.split(",");
    finalimg = tempstring[1];

      db.get(tempcharid).then(function(doc) {
      return db.put({
        _id: tempcharid,
        _rev: doc._rev,
        "charname": charname,
        "charnamereal" : charnamereal,
         "coins" : doc.coins,
         "sudocards" : doc.sudocards,
         "medals" : doc.medals,
         "quests" : doc.quests,
         "chardesc" : chardesc,
         "charclass" : charclass,
         "_attachments": {
         "charfoto.png": {
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

//Delete a Char
function deleteChar(){
  if (confirm('Sicher den Char unwiderbringlich löschen?')) {
    // DELETE
      db.get(tempcharid).then(function (doc) {
        return db.remove(doc).then(function(){location.reload()});
      });    
  } else {
    // ABORT DELETING
  }
}
