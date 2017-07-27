cards = [];
quests = [];
medals = [];
chars = [];

/* CHARAKTER */
//Load Chars
function loadChars(){
  db.allDocs({
      include_docs : true,
      attachments: true
    }).then(function (result) {
      dashcontent = '  <table class="table table-striped" id="chartable">\
    <thead>\
      <tr>\
        <th>Name</th>\
        <th>Real</th>\
        <th>Klasse</th>\
        <th>Punkte</th>\
        <th>Coins</th>\
        <th>Bonus</th>\
        <th>Aktionen</th>\
      </tr>\
    </thead>\
    <tbody>';

      counter = 0;
      for(i in result["rows"]){

        //Add Chars to table, cards/quests/medals to arrays
        if(result["rows"][i]['id'].includes("CARDS_"))
        {
          cards.push(result["rows"][i]);
        }
        else if(result["rows"][i]['id'].includes("QUEST_"))
        {
          quests.push(result["rows"][i]);
        }
        else if(result["rows"][i]['id'].includes("MEDALS_"))
        {
          medals.push(result["rows"][i]);
        }
        else if(result["rows"][i]['id'].includes("CHARS_")){                 
          chars.push(result["rows"][i]);
          dashcontent += '<tr>\
          <td>'+result["rows"][i]['doc']['charname']+'</td>\
          <td>'+result["rows"][i]['doc']['charnamereal']+'</td>\
          <td>'+result["rows"][i]['doc']['charclass']+'</td>\
          <td><span id="char_'+result["rows"][i]['id']+'_pointssum">0</span></td>\
          <td>'+result["rows"][i]['doc']['coins']+'</td>\
          <td><span id="char_'+result["rows"][i]['id']+'_bonisum">0</span></td>\
          <td><button type="button" class="btn btn-success btn-sm" onclick="addQuest(\''+result["rows"][i]['id']+'\')">Q+\
             </button>\
           &nbsp;<button type="button" class="btn btn-danger btn-sm" onclick="removeQuest(\''+result["rows"][i]['id']+'\')">Q-\
             </button>\
           &nbsp;<button type="button" class="btn btn-primary btn-sm" onclick="addMedal(\''+result["rows"][i]['id']+'\')">Orden+\
             </button>\
           &nbsp;<button type="button" class="btn btn-danger btn-sm" onclick="removeMedal(\''+result["rows"][i]['id']+'\')">Orden-\
             </button>\
           &nbsp;<button type="button" class="btn btn-warning btn-sm" onclick="addSudoCard(\''+result["rows"][i]['id']+'\')">SC+\
             </button>\
           &nbsp;<button type="button" class="btn btn-danger btn-sm" onclick="removeSudoCard(\''+result["rows"][i]['id']+'\')">SC-\
             </button>\
           &nbsp;<button type="button" class="btn btn-info btn-sm" onclick="changeCoins(\''+result["rows"][i]['id']+'\')">COINS\
             </button>\
             </td>\
          </tr>';
          counter++;         
        }       
      }
      dashcontent += '</tbody></table>';
      $("#dashcontent").html(dashcontent);
      $("#char_count").html(counter);
      

      //ADD CHAR DATA
      for(i in chars){       
        points = 0;
        //MEDALS
        for(k in chars[i]['doc']['medals']){          
          for(m in medals){
            if(medals[m]['id'] == chars[i]['doc']['medals'][k]){
              points += parseInt(medals[m]['doc']['medalpoints']);              
            }
          }
        }
          
          for(k in chars[i]['doc']['sudocards']){          
          for(m in cards){
            if(cards[m]['id'] == chars[i]['doc']['sudocards'][k]){
              points += parseInt(cards[m]['doc']['cardpoints']);  
            }
          }
        }

        //BONUNS
        bonus = 0;
        for(k in chars[i]['doc']['sudocards']){          
          for(m in cards){
            if(cards[m]['id'] == chars[i]['doc']['sudocards'][k]){
              if(parseInt(cards[m]['doc']['cardbonus']) > 0) bonus += parseInt(cards[m]['doc']['cardbonus']);    
              if(parseInt(cards[m]['doc']['cardpoints']) > 0) points += parseInt(cards[m]['doc']['cardpoints']);
            }
          }
        }

        //Recalculate Bonus and Points

        if(bonus > 0){
          points += points / 100 * bonus;
        }

        $("#char_" + chars[i]['id'] + "_pointssum").html(points);
        $("#char_" + chars[i]['id'] + "_bonisum").html(bonus);
      }

      $('#chartable').DataTable();
    });
}

//Load Bonus and Points
function loadCharData(charid){
  //Update Coin-Status from Char
      db.get(charid).then(function(doc) {        
          //Add Medal-Points
          for(i in doc.medals){
            db.get(doc.medals[i]).then(function(doc){
              newpoints = parseInt($("#char_" + charid + "_pointssum").html()) + parseInt(doc.medalpoints);
              $("#char_" + charid + "_pointssum").html(newpoints);
            });
          }

          for(i in doc.sudocards){
            db.get(doc.sudocards[i]).then(function(doc){
              newbonussum = parseInt($("#char_" + charid + "_bonisum").html()) + doc.cardbonus;
              newpoints = parseInt($("#char_" + charid + "_pointssum").html()) / 100 * doc.cardbonus;
              newpoints +=  parseInt($("#char_" + charid + "_pointssum").html());
              $("#char_" + charid + "_pointssum").html(newpoints);
              $("#char_" + charid + "_bonisum").html(newbonussum);
            });
          }
      });
}

tempcharid = "";

//Add a quest to a char
function addQuest(id){

  tempcharid = id;

  $("#addstuffmod").modal("toggle");
  $("#addstuffmod_title").html("Quest hinzufügen");

  db.allDocs({
      include_docs : true,
      attachments: true,
      startkey : "QUEST",
      endkey : "QUEST" + "\uffff"
    }).then(function (result) {

      quests = '\
      <table class="table table-striped" id="questchoice">\
      <thead>\
      <tr>\
      <th>Name</th>\
      <th>Coins</th>\
      </tr></thead><tbody>';
      for(i in result["rows"]){
        quests += '<tr onclick="addQuestFinal(\''+result["rows"][i]['id']+'\')">\
        <td>'+result["rows"][i]['doc']['questname']+'</td>\
        <td>'+result["rows"][i]['doc']['questcoins']+'</td>\
        </tr>';
      }
      quests += '</tbody></table>';
      $("#addstuffmod_content").html(quests);
      $('#questchoice').DataTable();
    });

}

//Add a Quest to a Char and Medals (if set) and calculate Coins
function addQuestFinal(questid){
  
  //Load Quest
  db.get(questid).then(function(doc) {      
      
      questcoins = parseInt(doc.questcoins);
      medals = doc.medals;      

      //Update Coin-Status from Char
      db.get(tempcharid).then(function(doc) {
        newcoins = doc.coins + questcoins;        
        doc.quests.push(questid);
        newmedals = doc.medals.concat(medals);

        return db.put({
          _id: tempcharid,
          _rev: doc._rev,
          "charname": doc.charname,
          "charnamereal" : doc.charnamereal,
          "coins" : newcoins,
          "sudocards" : doc.sudocards,
          "medals" : newmedals,
          "quests" : doc.quests,
          "chardesc" : doc.chardesc,
          "charclass" : doc.charclass,
          "_attachments": {
            "charfoto.png": doc._attachments["charfoto.png"]
          }
        }).then(function(reso){location.reload()});
      });

    }); 

}


function addSudoCard(id){
  $("#addstuffmod").modal("toggle");
  $("#addstuffmod_title").html("Sudocard hinzufügen");
  tempcharid = id;
  db.allDocs({
      include_docs : true,
      attachments: true,
      startkey : "CARDS",
      endkey : "CARDS" + "\uffff"
    }).then(function (result) {

      cardsstring = '\
      <table class="table table-striped" id="cardchoice">\
      <thead>\
      <tr>\
      <th>Name</th>\
      <th>Punkte</th>\
      <th>Bonus</th>\
      <th>Preis</th>\
      </tr></thead><tbody>';
      for(i in result["rows"]){
        cardsstring += '<tr onclick="addCardFinal(\''+result["rows"][i]['id']+'\', \'' + result["rows"][i]['doc']['cardprice'] + '\')">\
        <td>'+result["rows"][i]['doc']['cardname']+'</td>\
        <td>'+result["rows"][i]['doc']['cardpoints']+'</td>\
        <td>'+result["rows"][i]['doc']['cardbonus']+'</td>\
        <td>'+result["rows"][i]['doc']['cardprice']+'</td>\
        </tr>';
      }
      cardsstring += '</tbody></table>';
      $("#addstuffmod_content").html(cardsstring);
      $('#cardchoice').DataTable();
    });
}

function addCardFinal(cardid, cardprice){  
  //Update Coin-Status from Char
      db.get(tempcharid).then(function(doc) {
        if(parseInt(doc.coins) >= cardprice){
          doc.sudocards.push(cardid);
          doc.coins = parseInt(doc.coins) - parseInt(cardprice);

          return db.put({
            _id: tempcharid,
            _rev: doc._rev,
            "charname": doc.charname,
            "charnamereal" : doc.charnamereal,
            "coins" : doc.coins,
            "sudocards" : doc.sudocards,
            "medals" : doc.medals,
            "quests" : doc.quests,
            "chardesc" : doc.chardesc,
            "charclass" : doc.charclass,
            "_attachments": {
              "charfoto.png": doc._attachments["charfoto.png"]
            }
          }).then(function(reso){location.reload()
          });
        }
      //NOT ENOUGH MONEY
      else{
        alert("Zu wenig Geld!");
      }
      });
}

//Handler for catching defaulthandling of save-button in addstuffmod-modal
defaulthandler = 0;

//Change Coins in Window
function changeCoins(charid){
  //Save default-Handler for changing coin-value by manual
  defaulthandler = 1;
  tempcharid = charid;
  $("#addstuffmod").modal("toggle");
  $("#addstuffmod_title").html("Coins ändern");
  db.get(charid).then(function(doc) {
    $("#addstuffmod_savebutton").show();
    coinsinput = '<div class="form-group">\
          <label for="char_coins">Coins:</label>\
          <input type="text" class="form-control" id="char_coins" value="'+doc.coins+'" />\
        </div>'

    $("#addstuffmod_content").html(coinsinput);
  });  
}

//DEFAULTHANDLER
function addStuffHandler(){
  switch(defaulthandler){
    //Save new Coins-Value by manual input
    case 1:{
      db.get(tempcharid).then(function(doc) {
          return db.put({
            _id: tempcharid,
            _rev: doc._rev,
            "charname": doc.charname,
            "charnamereal" : doc.charnamereal,
            "coins" : parseInt($("#char_coins").val()),
            "sudocards" : doc.sudocards,
            "medals" : doc.medals,
            "quests" : doc.quests,
            "chardesc" : doc.chardesc,
            "charclass" : doc.charclass,
            "_attachments": {
              "charfoto.png": doc._attachments["charfoto.png"]
            }
          }).then(function(reso){location.reload()});        
      });
    }
    break;
    //Medal removed and save - just reload
    case 2:{
      location.reload();
    }
    break;
    case 3 : {
      location.reload();
    }
    break;
    case 4 : {
      location.reload();
    }
  }
}

//Remove Medal
function removeMedal(charid){
  tempcharid = charid;
  db.get(tempcharid).then(function(doc) {    
    $("#addstuffmod").modal("toggle");
    $("#addstuffmod_title").html("Orden entfernen");
    $("#addstuffmod_savebutton").show();
    defaulthandler = 2;
    addedmedals_final_string = "";
    for(m in medals){
      for(k in doc.medals){
        if(medals[m]['id'] == doc.medals[k]){
          addedmedals_final_string += "<button type='button' class='btn btn-danger' onclick='removeMedalExtra(\"" + medals[m]['doc']['_id'] + "\")'>" + medals[m]['doc']['medalname'] + "(" + medals[m]['doc']['medalpoints'] + ")</button>&nbsp;&nbsp;"            
        }
      }
    }
    $("#addstuffmod_content").html(addedmedals_final_string);
  });
}

//Remove MEdal from Char, update array and update view
//Last Medal: Reload Location
function removeMedalExtra(medalid){
  db.get(tempcharid).then(function(doc) {    
    
    var index = doc.medals.indexOf(medalid);
    if (index > -1) {
      doc.medals.splice(index, 1);
    }
    newmedals_array = doc.medals;    
    return db.put({
      _id: tempcharid,
      _rev: doc._rev,
      "charname": doc.charname,
      "charnamereal" : doc.charnamereal,
      "coins" : doc.coins,
      "sudocards" : doc.sudocards,
      "medals" : doc.medals,
      "quests" : doc.quests,
      "chardesc" : doc.chardesc,
      "charclass" : doc.charclass,
      "_attachments": {
        "charfoto.png": doc._attachments["charfoto.png"]
      }
    }).then(function(reso){      
      addedmedals_final_string = "";
      if(newmedals_array.length > 0){
        for(k in newmedals_array){          
          for(m in medals){
            if(medals[m]['id'] == newmedals_array[k]){
              addedmedals_final_string += "<button type='button' class='btn btn-danger' onclick='removeMedalExtra(\"" + medals[m]['doc']['_id'] + "\")'>" + medals[m]['doc']['medalname'] + "(" + medals[m]['doc']['medalpoints'] + ")</button>&nbsp;&nbsp;"                
            }
          }
        }
        $("#addstuffmod_content").html(addedmedals_final_string);
      }
      else location.reload();
    });  
  });
}

//Add a Medal
function addMedal(charid){
  tempcharid = charid;

  $("#addstuffmod").modal("toggle");
  $("#addstuffmod_title").html("Orden hinzufügen");
  $("#addstuffmod_savebutton").show();
  
  defaulthandler = 2;

  newmedalcontent = '  <table class="table table-striped" id="mtable">\
    <thead>\
      <tr>\
        <th>Name</th>\
        <th>Punkte</th>\
        <th>Beschreibung</th>\
      </tr>\
    </thead>\
    <tbody>';

      for(i in medals){
      
        newmedalcontent += '<tr onclick="addMedalFinal(\''+medals[i]['doc']['_id']+'\')">\
        <td>'+medals[i]['doc']['medalname']+'</td>\
        <td>'+medals[i]['doc']['medalpoints']+'</td>\
        <td>'+medals[i]['doc']['medaldesc']+'</td>\
        </tr>';
      }

      newmedalcontent += '</tbody></table>';
      $("#addstuffmod_content").html(newmedalcontent);
      $('#mtable').DataTable();

}

//Add a Medal and Reload
function addMedalFinal(medalid){
  db.get(tempcharid).then(function(doc) {    
    
    doc.medals.push(medalid);    
    return db.put({
      _id: tempcharid,
      _rev: doc._rev,
      "charname": doc.charname,
      "charnamereal" : doc.charnamereal,
      "coins" : doc.coins,
      "sudocards" : doc.sudocards,
      "medals" : doc.medals,
      "quests" : doc.quests,
      "chardesc" : doc.chardesc,
      "charclass" : doc.charclass,
      "_attachments": {
        "charfoto.png": doc._attachments["charfoto.png"]
      }
    }).then(function(reso){      
      location.reload();
    });  
  });
}

//Remove Sudocards
function removeSudoCard(charid){
  tempcharid = charid;
  db.get(tempcharid).then(function(doc) {
    $("#addstuffmod").modal("toggle");
    $("#addstuffmod_title").html("Sudocard entfernen");
    $("#addstuffmod_savebutton").show();
    defaulthandler = 3;
    sudocards_finalstring = "";
    for(m in cards){
      for(k in doc.sudocards){
        if(cards[m]['id'] == doc.sudocards[k]){
          sudocards_finalstring += "<button type='button' class='btn btn-danger' onclick='removeCardExtra(\"" + cards[m]['doc']['_id'] + "\")'>" + cards[m]['doc']['cardname'] + "</button>&nbsp;&nbsp;"            
        }
      }
    }
    $("#addstuffmod_content").html(sudocards_finalstring);
  });
}

//Remove Card finaly
function removeCardExtra(cardid){
  db.get(tempcharid).then(function(doc) {    
    
    var index = doc.sudocards.indexOf(cardid);
    if (index > -1) {
      doc.sudocards.splice(index, 1);
    }
    return db.put({
      _id: tempcharid,
      _rev: doc._rev,
      "charname": doc.charname,
      "charnamereal" : doc.charnamereal,
      "coins" : doc.coins,
      "sudocards" : doc.sudocards,
      "medals" : doc.medals,
      "quests" : doc.quests,
      "chardesc" : doc.chardesc,
      "charclass" : doc.charclass,
      "_attachments": {
        "charfoto.png": doc._attachments["charfoto.png"]
      }
    }).then(function(reso){      
      location.reload();
    });  
  });
}

//Remove a quest
function removeQuest(charid){
  tempcharid = charid;
  db.get(tempcharid).then(function(doc) {
    $("#addstuffmod").modal("toggle");
    $("#addstuffmod_title").html("Quest entfernen");
    $("#addstuffmod_savebutton").show();
    defaulthandler = 4;
    quests_finalstring = "";
    for(m in quests){
      for(k in doc.quests){        
        if(quests[m]['id'] == doc.quests[k]){
          quests_finalstring += "<button type='button' class='btn btn-danger' onclick='removeQuestExtra(\"" + quests[m]['doc']['_id'] + '\",\"' +  quests[m]['doc']['questcoins'] + "\")'>" + quests[m]['doc']['questname'] + "</button>&nbsp;&nbsp;"            
        }
      }
    }
    $("#addstuffmod_content").html(quests_finalstring);
  });
}

//Remove Quest, Coins of that quest and the medals
function removeQuestExtra(questid, questcoins){
  db.get(tempcharid).then(function(doc) {    
    
    //Remove Quest from char-quests
    var index = doc.quests.indexOf(questid);
    if (index > -1) {
      doc.quests.splice(index, 1);
    }

    //remove any medal from that quests from char-medals
    for(i in quests){
      if(quests[i]['id']){
        for(m in quests[i]['doc']['medals']){          
            var index = doc.medals.indexOf(quests[i]['doc']['medals'][m]);
            if (index > -1) {
              doc.medals.splice(index, 1);
            }
        }
      }
    }
    return db.put({
      _id: tempcharid,
      _rev: doc._rev,
      "charname": doc.charname,
      "charnamereal" : doc.charnamereal,
      "coins" : parseInt(doc.coins) - parseInt(questcoins),
      "sudocards" : doc.sudocards,
      "medals" : doc.medals,
      "quests" : doc.quests,
      "chardesc" : doc.chardesc,
      "charclass" : doc.charclass,
      "_attachments": {
        "charfoto.png": doc._attachments["charfoto.png"]
      }
    }).then(function(reso){      
      location.reload();
    });  
  });
}