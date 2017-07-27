//Load Chars
function loadCards(){
  db.allDocs({
      include_docs : true,
      attachments: true,
      startkey : "CARDS",
      endkey : "CARDS" + "\uffff"
    }).then(function (result) {
       
      newcardcontent = '  <table class="table table-striped" id="sctable">\
    <thead>\
      <tr>\
        <th>Foto</th>\
        <th>Name</th>\
        <th>Punkte</th>\
        <th>Bonus</th>\
        <th>Preis</th>\
        <th>Verkaufspreis</th>\
        <th>Aufladungen</th>\
        <th>Beschreibung</th>\
        <th></th>\
      </tr>\
    </thead>\
    <tbody>';

      counter = 0;
      for(i in result["rows"]){

      	newcardcontent += '<tr>\
      	<td style="max-width: 50px">\
			<img src="data:image/jpg;base64,'+result["rows"][i]['doc']['_attachments']['cardfoto.png']['data']+'"\
           style="max-width: 100%"/>\
      	</td>\
      	<td>'+result["rows"][i]['doc']['cardname']+'</td>\
      	<td>'+result["rows"][i]['doc']['cardpoints']+'</td>\
      	<td>'+result["rows"][i]['doc']['cardbonus']+'</td>\
      	<td>'+result["rows"][i]['doc']['cardprice']+'</td>\
      	<td>'+result["rows"][i]['doc']['cardsellprice']+'</td>\
      	<td>'+result["rows"][i]['doc']['cardrounds']+'</td>\
      	<td>'+result["rows"][i]['doc']['carddesc']+'</td>\
      	<td><button type="button" class="btn btn-primary btn-sm" onclick="changeCard(\''+result["rows"][i]['id']+'\')"><i class="fa fa-wrench" aria-hidden="true"></i>\
           </button></td>\
      	</tr>';
      	counter++;
      }

      newcardcontent += '</tbody></table>';
      $("#cardcontent").html(newcardcontent);
      $("#card_count").html(counter);
      $('#sctable').DataTable();
    });
}


//Save new card
function saveNewCard(){
  var cardname = $("#cardname").val();
  var cardpoints = $("#cardpoints").val();
  var carddesc = $("#carddesc").val();
  var cardbonus = $("#cardbonus").val();
  var cardprice = $("#cardprice").val();
  var cardrounds = $("#cardrounds").val();
  var cardsellprice = $("#cardsellprice").val();
  var cardid = "CARDS_" + cardname.replace(/[^a-zA-Z0-9]/g, '') + "_" + getTime();
  loadImgAndSaveCard($("#cardfoto")[0].files[0], cardname, cardpoints, carddesc, cardbonus, cardprice, cardsellprice, cardid, cardrounds);
}

//Save Char Foto
function loadImgAndSaveCard(file, cardname, cardpoints, carddesc, cardbonus, cardprice, cardsellprice, cardid, cardrounds) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
   tempstring = reader.result;
     tempstring = tempstring.split(",");
     finalimg = tempstring[1];

     //Doc to upload
     var doc = {
       "_id": cardid,
       "cardname" : cardname,
       "carddesc" : carddesc,
       "cardpoints" : cardpoints,
       "cardbonus" : cardbonus,
       "cardrounds" : cardrounds,
       "cardprice" : cardprice,
       "cardsellprice" : cardsellprice,
       "_attachments": {
         "cardfoto.png": {
           "content_type": "image/png",
           "data": finalimg
         }
       }
     };

     //Put the doc
     db.put(doc).then(function (result) {
     //  console.log(result);
       $("#newcardmod").modal("toggle");
       $("#cardname").val("");
       $("#cardpoints").val("");
       $("#carddesc").val("");
       $("#cardrounds").val("");
       $("#cardbonus").val("");
       $("#cardprice").val("");
       $("#cardsellprice").val("");
       $("#button_savenewcard").show();
       $("#button_updatecard").hide();
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
function resetNewCardMod(){
   $("#cardname").val("");
   $("#cardpoints").val("");
   $("#carddesc").val("");
   $("#cardbonus").val("");
   $("#cardprice").val("");
   $("#cardsellprice").val("");
   $("#cardrounds").val("");
   $("#button_savenewcard").show();
   $("#button_updatecard").hide();
}

tempcardid = "";


//Delete a Card
function deleteCard(){
  if (confirm('Sicher diese Sudocard unwiderbringlich löschen?')) {
    // DELETE
      db.get(tempcardid).then(function (doc) {
        return db.remove(doc).then(function(){location.reload()});
      });    
  } else {
    // ABORT DELETING
  }
}

//Change Card
function changeCard(id){
  tempcardid = id;
  db.get(id, {attachments:true, include_docs:true}).then(function(doc){
       $("#newcardmod").modal("toggle");
       $("#cardname").val(doc.cardname);
	   $("#carddesc").val(doc.carddesc);
	   $("#cardpoints").val(doc.cardpoints);
	   $("#cardbonus").val(doc.cardbonus);
	   $("#cardprice").val(doc.cardprice);
	   $("#cardrounds").val(doc.cardrounds);
	   $("#cardsellprice").val(doc.cardsellprice);
	   $("#button_savenewcard").hide();
	   $("#button_updatecard").show();
	   $("#button_deletecard").show();

  })
}

//Save update infos from char
function updateCard(){

  var cardname = $("#cardname").val();
  var cardpoints = $("#cardpoints").val();
  var carddesc = $("#carddesc").val();
  var cardbonus = $("#cardbonus").val();
  var cardprice = $("#cardprice").val();
  var cardrounds = $("#cardrounds").val();
  var cardsellprice = $("#cardsellprice").val();
  var cardid = "CARDS_" + cardname.replace(/[^a-zA-Z0-9]/g, '') + "_" + getTime();

  if($("#cardfoto")[0].files[0] == undefined){
    db.get(tempcardid).then(function(doc) {
      return db.put({
        _id: tempcardid,
        _rev: doc._rev,        
		"cardname" : cardname,
		"carddesc" : carddesc,
		"cardpoints" : cardpoints,
		"cardbonus" : cardbonus,
		"cardrounds" : cardrounds,
		"cardprice" : cardprice,
		"cardsellprice" : cardsellprice,
		"_attachments": {
		 "cardfoto.png": doc._attachments["cardfoto.png"]
		 }		
        }); 
    }).then(function(resp){
      location.reload();
    })
  }
  else{
    var reader = new FileReader();
    reader.readAsDataURL($("#cardfoto")[0].files[0]);
    reader.onload = function () {
    tempstring = reader.result;
    tempstring = tempstring.split(",");
    finalimg = tempstring[1];

     db.get(tempcardid).then(function(doc) {
      return db.put({
        _id: tempcardid,
        _rev: doc._rev,        
		"cardname" : cardname,
		"carddesc" : carddesc,
		"cardpoints" : cardpoints,
		"cardbonus" : cardbonus,
		"cardrounds" : cardrounds,
		"cardprice" : cardprice,
		"cardsellprice" : cardsellprice,
         "_attachments": {
         "cardfoto.png": {
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