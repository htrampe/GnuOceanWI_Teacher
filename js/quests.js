/* CHARAKTER */
//Load Medals
function loadQuests(){  
  db.allDocs({
      include_docs : true,
      attachments: true,
      startkey : "QUEST",
      endkey : "QUEST" + "\uffff"
    }).then(function (result) {
       
      newquestcontent = '  <table class="table table-striped" id="questtable">\
    <thead>\
      <tr>\
        <th>Titel</th>\
        <th>Coins</th>\
        <th>Inhalt</th>\
        <th></th>\
      </tr>\
    </thead>\
    <tbody>';

      counter = 0;
      for(i in result["rows"]){

        newquestcontent += '<tr>\
        <td>'+result["rows"][i]['doc']['questname']+'</td>\
        <td>'+result["rows"][i]['doc']['questcoins']+'</td>\
        <td>'+result["rows"][i]['doc']['questdesc']+'</td>\
        <td><button type="button" class="btn btn-primary btn-sm" onclick="changeQuest(\''+result["rows"][i]['id']+'\')"><i class="fa fa-wrench" aria-hidden="true"></i>\
           </button></td>\
        </tr>';
        counter++;
      }

      newquestcontent += '</tbody></table>';
      $("#questcontent").html(newquestcontent);
      $("#quest_count").html(counter);
      $('#questtable').DataTable();
    });
}


//Save Quest
function SaveQuest(questname, questdesc, questcoins, questid) {
   
     //Doc to upload
     var doc = {
       "_id": questid,
       "questname": questname,
       "questdesc" : questdesc,
       "questcoins" : questcoins,
       "medals" : addedmedals_final_array  
     };

     //Put the doc
     db.put(doc).then(function (result) {
     //  console.log(result);
       $("#questname").modal("toggle");
       $("#questdesc").val("");
       $("#questcoins").val("");
       $("#button_savenewquest").show();
       $("#button_updatequest").hide();
       location.reload();              
     }).catch(function (err) {
       //console.log(err);
     });
}


//Reset MedalMod
function resetNewQuestMod(){
   $("#questname").val("");
   $("#questdesc").val("");
   $("#questcoins").val("");
   $("#button_savenewquest").show();
   $("#button_updatequest").hide();
   $("#button_deletequest").hide();
}

//Save new Quest
function saveNewQuest(){  
  var questname = $("#questname").val();
  var questdesc = $("#questdesc").val();
  var questcoins = $("#questcoins").val();
  var questid = "QUEST_" + questname.replace(/[^a-zA-Z0-9]/g, '') + "_" + getTime();
  SaveQuest(questname, questdesc, questcoins, questid);

}

//Save temp ID of a quest for updating/deleting
tempquestid = "";

//Change Char
function changeQuest(id){
  tempquestid = id;
  db.get(id, {include_docs:true}).then(function(doc){
      $("#button_savenewquest").hide();
      $("#button_updatequest").show();
      $("#button_deletequest").show();
      $("#newquestmod").modal("toggle");
      $("#questname").val(doc.questname); 
      $("#questdesc").val(doc.questdesc); 
      $("#questcoins").val(doc.questcoins);
      addedmedals_final_array = doc.medals;
      loadAddedMedales();
  })
}

//Save update infos from medal
function updateQuest(){

  var questname = $("#questname").val();
  var questdesc = $("#questdesc").val();
  var questcoins = $("#questcoins").val();

  
    db.get(tempquestid).then(function(doc) {
      return db.put({
        _id: tempquestid,
        _rev: doc._rev,
        "questname": questname,
        "questdesc" : questdesc,
        "questcoins" : questcoins,
        "medals" : addedmedals_final_array  
        }); 
    }).then(function(resp){
      location.reload();
    })    
}

//Delete a Medal
function deleteQuest(){
  if (confirm('Sicher die Quest unwiderbringlich löschen?')) {
    // DELETE
      db.get(tempquestid).then(function (doc) {
        return db.remove(doc).then(function(){location.reload()});
      });    
  } else {
    // ABORT DELETING
  }
}

/* MEDALS */
function loadMedals(searchstring){
  db.allDocs({
      include_docs : true,
      attachments: true,
      startkey : "MEDALS_",
      endkey : "MEDALS_" + "\uffff"
    }).then(function (result) {       
      $("#foundmedals").html("");
      foundmedals = "";
      for(i in result["rows"]){        
        if(result["rows"][i]["doc"]["medalname"].toUpperCase().indexOf(searchstring.toUpperCase()) != -1)
        {
          foundmedals += "<button type='button' class='btn btn-primary' onclick='addMedalToQuest(\"" + result["rows"][i]["doc"]["_id"] + "\")'>" + result["rows"][i]["doc"]["medalname"] + "</button>&nbsp;&nbsp;";
        }                     
      }
      $("#foundmedals").html(foundmedals);            
    });
}

// ADDED MEDALS
addedmedals_final_string = "";
addedmedals_final_array = [];

function addMedalToQuest(medalid){
  addedmedals_final_array.push(medalid);
  $("#foundmedals").html("");
  $("#searchmedal").val("");
  console.log(addedmedals_final_array);
  loadAddedMedales();  
}

//Load all Medals in that Quest
function loadAddedMedales(){
  addedmedals_final_string = "";
  if(addedmedals_final_array.length == 0) $("#addedmedals").html("");
  for(i in addedmedals_final_array){
    db.get(addedmedals_final_array[i]).then(function(doc) {      
      addedmedals_final_string += "<button type='button' class='btn btn-danger' onclick='removeMedal(\"" + doc['_id'] + "\")'>" + doc['medalname'] + "(" + doc['medalpoints'] + ")</button>&nbsp;&nbsp;"  
      $("#addedmedals").html(addedmedals_final_string);
    });  
  }  
}

function loadMedal(){
  if($("#searchmedal").val().length > 1){
    loadMedals($("#searchmedal").val());
  }
}

//Remove from added Medals
function removeMedal(medalid){  
  var index = addedmedals_final_array.indexOf(medalid);
  if (index > -1) {
    addedmedals_final_array.splice(index, 1);
  }
  console.log(addedmedals_final_array);
  loadAddedMedales();
}
