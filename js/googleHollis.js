/* project registered under name gHollis at 
   https://console.developers.google.com/project/192818180458/
*/

// sample query:
https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&printType=books&key=AIzaSyBgu8Iu6qKe9Kxf9Q9LLlJxgZfgcwQhi_4

// ======= GLOBALS ===============
// ------ Create book object
function Book(title, subtitle, snippet, authors, pub,city,date,isbn,snippet,googid,hollisid,stacklifeid,ids,idstring){
	this.title = title;
	this.subtitle = subtitle;
	this.snippet = snippet;
	this.authors = authors;
	this.pub=pub;
	this.city=city;
	this.date=date;
	this.isbn=isbn;
	this.snippet=snippet;
	this.googid=googid;
	this.hollisid=hollisid;
	this.stacklifeid=stacklifeid;
	this.ids = ids;
	this.idstring = idstring;
}

var gbooks = new Array();
var priorsearchterm = "";

// copy an array not by ReferenceError// http://stackoverflow.com/questions/7486085/copying-array-by-value-in-javascript
// Object.prototype.clone = function() {
//   var newObj = (this instanceof Array) ? [] : {};
//   for (i in this) {
//     if (i == 'clone') continue;
//     if (this[i] && typeof this[i] == "object") {
//       newObj[i] = this[i].clone();
//     } else newObj[i] = this[i]
//   } return newObj;
// };

//=========== END of globals ===============

function init(){
	 google.load("books", "0");
	// find return key to execute search
	$("#searchbox").keydown(function(event){
      if(event.keyCode == 13){
    	event.preventDefault();
       doSearch();
       
    }
  });
  
  // make the sample pulldown functional
  $('#sampleslist').bind('change',function(w) {
  		if ( $("#sampleslist option:selected").val() !== "sample"){
		var term = $("#sampleslist option:selected").text();
		$("#searchbox").val(term);
		doSearch();
		}
	});
	
	
$( "[help]" ).mouseover(
  function() {
  	popupHelp(this);
    //$( this ).append( $( "<span> ***</span>" ) );
  }
);
 

}

function popupHelp(e){
	$(".helpballoon").remove(); // remove the old
	var balloon = document.createElement("div");
	var txt = $(e).attr("help");
	balloon.setAttribute("class","helpballoon");
	balloon.setAttribute("id","helpballoon");
	balloon.innerHTML=txt;
	e.appendChild(balloon);
}

function doSearch(which){
	 $("#loading").show();
	var searchterm = $("#searchbox").val();
	// is it different from last time we pressed?
	if (searchterm != priorsearchterm){
		document.getElementById("next10").setAttribute("start","0"); // reset next10 btn
		document.getElementById("next10").setAttribute("title","Get #10-1#9"); // reset next10 btn
		
	}
	priorsearchterm = searchterm; // save this searchterm in a global
	
	// show the clearall button
   $("#clearstack").show();
   // get offset
   if (which == "NEXT"){
   		var startoffset = parseInt($("#next10").attr("start"));
   	}
   	else {
   		var startoffset = 0;
   	}
   	
   	// get the offset for the search (paging)
   $("#next10").val("Get next 10");
   document.getElementById("next10").setAttribute("start", startoffset + 10);
   document.getElementById("next10").setAttribute("title","Get #" + (startoffset + 10) + "-#" + (startoffset + 19)); // help balloon
   $("#next10").show();
   
   
   
   
	// build the google books query
	searchterm = encodeURI(searchterm);
	var uri = "https://www.googleapis.com/books/v1/volumes?q=" + searchterm;
	uri = uri + "&printType=books&key=AIzaSyBgu8Iu6qKe9Kxf9Q9LLlJxgZfgcwQhi_4";
	uri = uri +  "&startIndex=" + startoffset;
	//uri = "https://www.googleapis.com/books/v1/volumes?q=flowers+inauthor:keyes&key=AIzaSyADnM14pkT7fq0YqXLtTpiUmApeQcH144Y";
		$.ajax({
  		type: "GET",
  		dataType: "jsonp",
 		url: uri,
 		async: false,
 		success: function(r,mode){
 				 $("#loading").hide();
 				 // delete existing stack
   				$("#stackviewdiv").fadeOut(400);
               	buildResultsArray(r);
            }
  });
  
}

function buildResultsArray(result) {
            //iterate each returned item 
            
            // if no results from google
            if (result.totalItems == 0){
            	$("#searchresults").html("");
            	$("#stackviewdiv").html("");
            	alert("No results found at Google Books for " + $("#searchbox").val());
            	return
            }
           gbooks.length=0; // initialize global array of google results
            for (var k=0; k < result.items.length; k++) {
              	// var k = row.volumeInfo.title;
             	var item = result.items[k].volumeInfo;
             	var gbook = new Book(); 
             	gbook.title = item.title;
             	gbook.subtitle = item.subtitle;
             	if (gbook.subtitle == undefined){gbook.subtitle="";}
             	gbook.authors = item.authors;
             	if (gbook.authors == undefined){gbook.authors="";}
				gbook.googid = result.items[k].id;
				var ids = item.industryIdentifiers;
				gbook.ids = ids;
				if (ids !== undefined){
					var isbn = getIsbn(ids);
				}
				else {isbn="";}	
				gbook.isbn = isbn;
				// build idstring for viewer
				// if the type is Other then the value includes the type
				if (ids !== undefined){
					var idtype = ids[0].type; // take the first one. why not?
					// if only wants isbn, not isbn_13 or 10
					if (idtype.indexOf("ISBN") > -1){
						idtype = "ISBN";
					}
					
					if (idtype != "OTHER"){
						gbook.idstring = idtype + ":" + ids[0].identifier;
					}
					else { // id is other
						gbook.idstring = ids[0].identifier;
					}
				}
				
				if (result.items[k].searchInfo !== undefined){
					gbook.snippet = result.items[k].searchInfo.textSnippet;
				}
				else{ gbook.snippet = "";}
				
				gbooks.push(gbook);
				}
			//); //end iteration of data returned from server and append to the list
            
			showGoogleResults(result);
			lookUpHollis(); 
 }
 
 function showGoogleResults(result){
	// google results have been put into gbooks. Now show  those results
	var resultsdiv = document.getElementById("searchresults");
    resultsdiv.innerHTML ="";
      for (var i=0; i < gbooks.length; i++){
      		var item = gbooks[i];
			// create new div for the search result
			var oneresultdiv = document.createElement("div");
			oneresultdiv.setAttribute("class","resultsdiv no_match");
 			 // show the number of the return
			 var newspan = document.createElement("span");
			 newspan.setAttribute("class","gresultnumber gray");
			 newspan.innerHTML = i;
			 oneresultdiv.appendChild(newspan);
			 // is it from Harvard
			 if ($.isArray(item.ids)){
			 	var id_source_string = "";
			 	for (m=0; m < item.ids.length; m++){
			 		id_source_string = id_source_string + item.ids[m].identifier + " ";
			 	}
			 	if (id_source_string.indexOf("HARVARD") > -1){
			 		var harvspan = document.createElement("span");
			 		harvspan.setAttribute("class","harvardlogospan");
			 		harvspan.innerHTML="<img src='images/harvardlogo.jpeg'>";
			 		oneresultdiv.appendChild(harvspan);
			 	}
			 }
			 // get title and make a span
			 var newspan = document.createElement("span");
			 newspan.setAttribute("class","titlespan");
			 newspan.innerHTML=item.title;
			 // add subtitle to title span, unless it's a string (because it's "") or undefined
			 if ((item.subtitle !== undefined) && ( typeof item.subtitle != 'string' )){
				 newspan.innerHTML = newspan.innerHTML + ": " + item.subtitle;
			 }
			 oneresultdiv.appendChild(newspan);
			 // get authors
			 var newspan = document.createElement("span");
			 newspan.setAttribute("class","authorspan");
			 if ((item.authors != undefined) && ( typeof item.authors != 'string' )){
				 newspan.innerHTML = " " + item.authors.join("; ");
				}
				else {
				newspan.innerHTML = " [no author]";
				}
			 oneresultdiv.appendChild(newspan);
			 document.getElementById("searchresults").appendChild(oneresultdiv);
			     // insert more info button
            var resvol = result.items[i].volumeInfo;
			var subt = resvol.subtitle;
			meta_gbook = "<b><i>" + resvol.title + "</i></b><br />";
			meta_gbook =  meta_gbook + "<b>Subtitle</b>: " + resvol.subtitle + "<br />";
			if (resvol.authors !== undefined){
				meta_gbook =  meta_gbook + "<b>Creator(s)</b>: " + resvol.authors.join("; ") + "<br />";
			}
			meta_gbook = meta_gbook + "<b>Date</b>: " + resvol.publishedDate + "<br />";
			meta_gbook = meta_gbook + "<b>Publisher</b>: " + resvol.publisher + "<br />";
			meta_gbook = meta_gbook + "<b>Language</b>: " + resvol.language + "<br />";
			meta_gbook = meta_gbook + "<b>Pages</b>: " + resvol.pageCount + "<br />";
			if (resvol.categories !== undefined){
				meta_gbook = meta_gbook + "<b>Categories</b>: " + resvol.categories.join("; ");
			}
			// get rid of undefineds
			meta_gbook = meta_gbook.replace(/undefined/g, '-');
			var morebtn = document.createElement("span");
			morebtn.setAttribute("class","morebtn");
			$(morebtn).text("More info");
			morebtn.setAttribute("help", meta_gbook);
			morebtn.setAttribute("onclick","popupHelp(this)");
			oneresultdiv.appendChild(morebtn);
			 // insert snippet
			 var newspan = document.createElement("span");
			 newspan.setAttribute("class","snippetspan");
			 newspan.innerHTML=item.snippet;
			oneresultdiv.appendChild(newspan);
			 // insert google books link
			 var googid = item.googid;
			 var newspan = document.createElement("span");
			 newspan.setAttribute("class","googlelink");
			 newspan.innerHTML= "<span onclick='gotoGoogle(\"" + googid + "\")'>Google</span>";
			 //newspan.innerHTML = "<a target='_blank' href='http://books.google.com/books?id=" + googid + "'>google</a>"; 
            oneresultdiv.appendChild(newspan);
            // insert view button
            var newspan = document.createElement("span");
			 newspan.setAttribute("class","viewlink");
			 newspan.setAttribute("onclick","launchViewer('" + item.idstring + "')");
			 newspan.innerHTML="View";  
			 oneresultdiv.appendChild(newspan);
        
            
            // append the whole new div to the container
            resultsdiv.appendChild(oneresultdiv);
            }
            
          
            
            // make google search result numbers clickable
            $(".gresultnumber").click(function(){
            	// if it's gray, then it does nothing
            	if ( $(this).hasClass("gray")){
            		alert("We couldn't find this book in HOLLIS. Click 'view' to try reading it at Google Books.");
            		return
            	}
            	var num = $(this).text().trim(); // get numb of googresult clicked on
            	var pardiv = $(this).parent()[0]; // get parent div
            	var items = new Array();
            	items = $('.stack-item');
            	if ( $(this).hasClass('on')){
            		$(this).removeClass("on");
            		$(this).addClass("off");
            		$(pardiv).removeClass('match_on no_match');
            		$(pardiv).addClass("match_off");
            		// hide stackview items from that google result
            		// calculate speed of slideUp/down
						var spines = $("[googresult=" + num + "]");
						var num_of_spines = spines.length;
						var speedeach = (500 + (10 *  num_of_spines));
					// go through every stack item
            		for (var m = 0; m < items.length; m++){
						// get the whichgresult span
						var wh = $( ".whichgresult", items[m])[0];
						var txt = $(wh).text().trim(); // get the number of the item to slide
						if (txt == num){
							$(items[m]).slideUp(speedeach);
						}	
            		}
            	}
            	else {
            		if ( $(this).hasClass('off')){
						$(this).removeClass("off");
						$(this).addClass("on");
						$(pardiv).removeClass('match_off no_match');
            			$(pardiv).addClass("match_on");
						// show stackview entries from that google result
						for (var m = 0; m < items.length; m++){
							// get the whichgresult span
							var wh = $( ".whichgresult", items[m])[0];
							var txt = $(wh).text().trim();
							if (txt == num){
								$(items[m]).slideDown(speedeach);
							}
						}
            		}
            	}
            	 
            });
      
      
	// hovering over a results div will show the "help" attrib text
  // $( "[help]" ).mouseover(
//   function() {
//   	var thisel = this;
//   	setTimeoutConst = setTimeout(function(){
//   			$(".helpballoon").remove();
//              popupHelp(thisel);
//          }, 300);
//   }
//   );
//   // remove on mouseout
  $( "[help]" ).mouseout(
  function() {
  	
    $(".helpballoon" ).remove();
  }
  );
 
  
 
 
 
}


function lookUpHollis(){
	// go through returns from google and look up in hollis
	
	var booklist = new Array();
	for (var i = 0; i < gbooks.length; i++){
		var book = gbooks[i];
		
		// get author last name (only of the first author)
		
		if (book.authors != ""){
			// if there's a comma
			var fullname = book.authors[0];
			if (fullname.lastIndexOf(",") > -1){
				var lastname = fullname.substr(fullname.lastIndexOf(",") + 1);
			}
			// no comma but a space
			if ((fullname.lastIndexOf(",") < 0) && (fullname.lastIndexOf(" ") > 1))  {
				var lastname = fullname.substr(fullname.lastIndexOf(" ") + 1);
			}
			// no comma and no space - i.e., single word name
			if ((fullname.lastIndexOf(",") < 0) && (fullname.lastIndexOf(" ") < 1))  {
				var lastname = fullname;
			}
		} 
		else {book.authors = [""];}
		// get title
		var title =  book.title;
		// push it onto booklist
		booklist.push({"lastname" : lastname, "tit" : title, "ids" : book.ids});
	}
  // go to php
  var booklistjson =  JSON.stringify(booklist);
  var startoffset = 10;
  $.ajax({
  		type: "POST",
 		
 		url: 'php/checkForHollis.php',
 		data: {books : booklistjson, startIndex : startoffset},
 		async: false,
 		success: function(r,mode){
                respo = r;
                showHollisMatches(r);
            }
        
  });
}

function showHollisMatches(r){
	// we got the results of searching librarycloud for the tiles, lastnames and isbns 
	// of the google results. Examine those results and plug in any hollis matches
	
	var barray = JSON.parse(r); 	// full set of Hollis returns, one set for each google result.
	// copy the array not by reference. (Merely using = makes one update the other)
	var docarray = new Array();;//d books
	for (var i = 0; i < barray.length; i++){
		docarray[i] = barray[i].docs;
	}
		
	
	// build stackview
	displayAggregateStack(barray);
	
	// insert into googleresults
	
	// turn the google results list into an Array
	var googleresults = $(".resultsdiv");
	
	// loop through the results for each google return
	for (var i=0; i < gbooks.length; i++){
		var book = new Book();
		var oneHollisResult = barray[i]; 
		// reset border
		var pardiv = googleresults[i];
		$(pardiv).removeClass('match_on match_off no_match');
        $(pardiv).addClass("no_match");
		// was it a matched isbn?
		var idtype = oneHollisResult['IDfound'].type;
		if ( (idtype !== undefined) & ("isbn oclc lccn".indexOf(idtype) > -1)){
			// put stacklife launcher button into the google result
			var hollisspan = document.createElement("span");
			hollisspan.setAttribute("class","stacklifelink-isbn");
			// insert Stacklife idea into the button
			hollisspan.innerHTML = "&nbsp;<span onclick='openStacklife(\"" + oneHollisResult.docs[0].id + "\")'>Stacklife</span>";
			//hollisspan.innerHTML = "&nbsp;<a  target='_blank' href='http://stacklife.harvard.edu/item/a/" + oneHollisResult.docs[0].id + "' title='See this book in StackLife.'>Stacklife</a>"; 
			googleresults[i].appendChild(hollisspan);
			// light up the list Number
			var num = $(".gresultnumber",googleresults[i])[0];
			$(num).removeClass("gray");
			$(num).removeClass("off");
			$(num).addClass("on");
			// light up border
			var pardiv = googleresults[i];
			$(pardiv).removeClass('match_off no_match');
            $(pardiv).addClass("match_on");
			// put stack display launcher into the result
			// this loads a shelf to the right
			
		
 		}
		else {
			// was there a hollis record, indicating a match
			var numfound = oneHollisResult['num_found'];

			// check for the first .doc in this particular record. If there is one, 
			// then we found at least one auth-name match
			if ((numfound > 0) && (oneHollisResult.docs[0] !== undefined)){
				var hollisspan = document.createElement("span");
				hollisspan.setAttribute("class","stacklifelink-fuzzy");
				//hollisspan.innerHTML="TEST";
				//hollisspan.innerHTML = " <a  target='_blank' href='http://stacklife.harvard.edu/item/a/" + oneHollisResult.docs[0].id + "' title='Many possible Hollis matches on this item'>Feeling lucky</a>"; 
				hollisspan.innerHTML = "&nbsp;<span onclick='openStacklife(\"" + oneHollisResult.docs[0].id + "\")'>Feeling lucky?</span>";
				googleresults[i].appendChild(hollisspan);
				// light up the list Number
				var num = $(".gresultnumber",googleresults[i])[0];
				$(num).removeClass("gray");
				$(num).removeClass("off");
				$(num).addClass("on");
				// light up border
				var pardiv = googleresults[i];
				$(pardiv).removeClass('match_off no_match');
            	$(pardiv).addClass("match_on");
			}
			else { // no match was found by ID or by title look-up
			// dim the list Number
				var num = $(".gresultnumber",googleresults[i])[0];
				$(num).removeClass("on off");
				$(num).addClass("gray");
				// light up border
				var pardiv = googleresults[i];
				$(pardiv).removeClass('match_off match_on');
            	$(pardiv).addClass("no_match");
			}
		}
	}
}

function openStacklife(l){
	window.open("http://stacklife.harvard.edu/item/a/" + l);
}
function gotoGoogle(l){
	var url =  "http://books.google.com/books?id=" + l;
	// add terms to search inside the google Book
	var terms = $("#searchbox").val();
	terms.replace(/\s+/g, '+');
	url = url + "&q=" + terms;
	window.open(url);
}

function displayAggregateStack(tarray){
	// show stack of everything in hollis for this entire set of google returns
	// tarray contains all of the hollis records
	 var bks = new Array();
 	var autharray = new Array();
 	var wd, len, totalnumberfound = 0, isbnmatch;
 	// go through all ten sets of returns from hollis
	for (var i=0; i < tarray.length; i++){
		itemdocs = new Array(); itemdocs.length=0;
		itemdocs = tarray[i].docs;
		idmatch = false;
		// if this is an id match, then we ony want the first doc from this query
		// idfound is either an object with .type, or an array > 0
		if ((tarray[i].IDfound.type !== undefined) || (tarray[i].IDfound.length > 0)){
			var itemdocs = [tarray[i].docs[0]];
			idmatch = true;
		}
		// go through each return's set of docs
			// loop through all the books in the hollis return OR
			// if it's an id match, just one.
		var recordstolookat = itemdocs.length;
		if (idmatch) {recordstolookat = 1;}
		
		for (var k=0; k < recordstolookat; k++){
			// wd = page count
			wd = itemdocs[k].pages_numeric;
			if (wd === undefined){wd = 350;}
			var pdate = itemdocs[k].pub_date;
			if (pdate == null) {pdate = 1800;}
			len = itemdocs[k].height_numeric * 20;
			//len = Math.floor((Math.random()*15)+25);
			// build title
			var tit = itemdocs[k].title;
			// prefix it with the google result number this refers to
			var whichresult = tarray[i].gresultnumber
			tit = "<span class='whichgresult' title='Google Result #" + whichresult + ".' googresult='" + whichresult + "'>" + whichresult + " </span>&nbsp;&nbsp;" + tit;
			// if it's an isbn match, flag that we're certain by adding a checkmark
			if (idmatch){
				tit = "&#x2713; " + tit;
			}
			bks.push({"title": tit,
				"creator": itemdocs[k].creator,
				"pub_date":pdate, 
				"measurement_page_numeric": wd, 
				"measurement_height_numeric": len ,
				"shelfrank": itemdocs[k].shelfrank,
				"link": 'http://stacklife.harvard.edu/item/a/' + itemdocs[k].id,
				"isbnmatch" : idmatch
				});
			}
			 totalnumberfound = totalnumberfound + tarray[i].num_found;
	 }
 
 var data=  {
    "num_found": totalnumberfound,
    "start" : "-1",
    "limit": "0",
    "docs": bks
    }
    
//Delete and recreate the stackview div. Otherwise it doesn't pick up new json
	 var svdiv = document.getElementById('stackviewdiv');
	 var parsvdiv = svdiv.parentNode;
	 parsvdiv.removeChild(svdiv);
	 var newdiv = document.createElement("div");
	 newdiv.setAttribute("id","stackviewdiv");
	 newdiv.style.width="400px";
	 //newdiv.style.height="400px";
	 parsvdiv.appendChild(newdiv);

$('#stackviewdiv').stackView({data: data, ribbon: "All HOLLIS matches"});


}


function launchViewer(idstring){
	
	// make the div visible
	$("#stackviewdiv").fadeOut(400);
	$("#viewerContainer").fadeIn(400);
	// load it 
	// create viewer
	var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
	//viewer.load('NYPL:33433069114472', alertNotFound);
	viewer.load(idstring,alertNotFound);
}

function hideViewer(){
	$('#viewerContainer').fadeOut(200);
	$('#stackviewdiv').fadeIn(200)
}

function alertNotFound(){
	alert("Failed to launch Google Viewer. We're sorry.");
	hideViewer(); // restore stack
}

function clearStack(){
	// hide the entire stack
	
	// get all list elements from stack
	var allLi = $(".stack-item");
	var allG = $(".resultsdiv");
	var gRes = $(".gresultnumber");
	// hide the stack items
	for (var i=0; i < allLi.length; i++){
		$(allLi[i]).fadeOut(400);
		
	}
	// turn off the google results and google numbers
	for (i=0; i < allG.length; i++){
		$(gRes[i]).removeClass("on");
        $(gRes[i]).addClass("off");
        $(allG[i]).removeClass('match_on');
        $(allG[i]).addClass("match_off");
	}
}

function getIsbn(w){
	if (w.length == 0){
		return "";
	}
	var isbn = "";
	for (i=0; i < w.length; i++){
		if (w[i].type.indexOf("ISBN") > -1){
			isbn = w[i].identifier;
		}
		
	}
	return isbn;
}

function tryIt(s){
	var term = $(s).text();
	$("#searchbox").val(term);
	doSearch();
}
function toggleExplanation(){
 // show and hide the explanation
 var div = document.getElementById("explans");
 if (div.style.display=="none") {
     $(div).show("slow");
     $("#explan").text("Less");
     }
     else {
     $(div).hide("slow");
     $("#explan").text("More");
     }
}