<?php

	   // gets array of google results
	   // checks hollis for last name and title, and isbn for each
	   // for each google result, returns array of matching hollis items		
ini_set('display_errors','On');
error_reporting(E_ALL);


$booksj = $_REQUEST['books'];
//debugPrint("BOOKSJ= . $booksj[0]");
$books= json_decode($booksj);

function debugPrint($s){
	if (1==2){
		error_log($s);
	}
}
debugPrint("1-------------------CHECK ARRAY OF GOOGLE BOOKS FOR HOLLIS MATCHES--------------------");

//------------ GOES THROUGH THE ARRAY

   debugPrint("in booklist");
 
   
/* working examples http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:(hollis_catalog%20OR%20hbs_edu)%20AND%20id_isbn:0436203774
http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:hollis_catalog%20AND%20((id_isbn:0436203774%20OR%20id_isbn:234213)%20OR%20(creator_keyword:twain,mark))
*/    
 	
   	$number_of_books = count($books);
	debugPrint("NUMBER:  $number_of_books");	
   
   // go through each book
   $booksarray = array();
   
   // create array of google books ID identifiers and their librarycloud equivalents
   $id_array = array("ISBN_13"=>"id_isbn", "ISBN_10"=>"id_isbn","ISBN"=>"id_isbn", "LCCN"=>"id_lccn","OCLC"=>"id_oclc");
   
   $ch = curl_init(); 
   
   // go through every google result
   for ($i=0;$i < $number_of_books; $i++){
   debugPrint("************ GOOGLE RESULT #$i **********************");
   		$book = $books[$i];
   		$a = ""; $tit="";
   		$a = $book->lastname;
   		if ($a === ""){
   			$a = $book->firstname;
   			debugPrint("author is firstname: $a");
   		}
   		$tit = $book->tit;
   		$tit = trim($tit, ". ?!,t\n\r\0\x0B");
   		$noIsbn = true;
   		debugPrint("# $i TITLE = . $tit  LASTNAME : $a");

   		// get google's book identifiers, if any
   		if (empty($book->ids)!==true){
   			$ids = $book->ids;
   			$num_of_ids = count($ids);
   		}
   		else {$num_of_ids = -1;} // flag no identifiers
   		debugPrint("IDs length: " . $num_of_ids);
   		$id_string=""; // the string for the query
   		// if we have any ids, then start the parenthesis
   		if ($num_of_ids > 0){
   			$id_string = "%20AND%20(";
   		}
   		// go through the array of ID's, building the query string
   		for ($y=0; $y < $num_of_ids; $y++){
   			$id_type = $book->ids[$y]->type; // get the type
   			$id_value = $book->ids[$y]->identifier; // get the value
   			debugPrint("TYPE: $id_type ID: $id_value");
   			// is the id in the array of librarycloud identifiers?
   			if (array_key_exists($id_type, $id_array)){
   				// if this is the second or more id, then we need an OR
   				if ( $y > 0){
   					$id_string = $id_string . "%20OR%20";
   				}
   				// add the parameter 
   				$id_string = $id_string . $id_array[$id_type] . ":" . $id_value;
   			}
   		}
   			// close the parentheses if we in fact started it
   			if ($num_of_ids > 0){
   					$id_string = $id_string . ")";
   			}
   		
   		debugPrint("$i) ID_STRING: $id_string");
   		
   		// if WE HAVE GOOGLE IDs for the book, fetch it from librarycloud
   		if ($id_string !== ""){
   			$noIDresults = false;
   			$queryurl = "http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:hollis_catalog" . $id_string;
   			//works: $queryurl = "http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:hollis_catalog%20AND%20id_isbn:0436203774";
			debugPrint("ID query: $queryurl");
   			
   			 curl_setopt($ch, CURLOPT_URL, $queryurl);
			// Return the transfer as a string 
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
			// $output contains the output string 
			$isbreturn = curl_exec($ch); 
			$recorddecoded = json_decode($isbreturn);
			// does the hollis record have any docs?
			if (isset($recorddecoded->docs[0])) {
				debugPrint(" >Got docs");
				$noIDresults = false;
				}
			else{
				$noIDresults = true; // no docs, no isbn
				//debugPrint(" no isbn");
			}
			// if there's an ID array in the hollis record
			// save it as key:value in $foundID
			if ((isset($recorddecoded->docs[0])) && 
				(
				 (is_array($recorddecoded->docs[0]->id_isbn)) ||
				 (is_array($recorddecoded->docs[0]->id_lccn)) ||
				 (is_array($recorddecoded->docs[0]->id_oclc))
				))
				 {
				 // which id was found? record that as our $foundID
				 if (isset($recorddecoded->docs[0]->id_isbn)){
				 	$foundID = array("type"=>"isbn","id"=>$recorddecoded->docs[0]->id_isbn[0]);
				 }
				if (isset($recorddecoded->docs[0]->id_lccn)){
				 	$foundID = array("type"=>"lccn","id"=>$recorddecoded->docs[0]->id_lccn[0]);
				 }
				if (isset($recorddecoded->docs[0]->id_oclc)){
				 	$foundID = array("type"=>"oclc","id"=>$recorddecoded->docs[0]->id_oclc[0]);
				 }
				
				debugPrint("Found Hollis ID array");
				 $enhancedhollisrecord = $recorddecoded;
				 $enhancedhollisrecord->IDfound = $foundID;
				 $enhancedhollisrecord->gresultnumber = $i; // which google result. 
				 array_push($booksarray,$enhancedhollisrecord);
			
				debugPrint("FOUND ID. type: $foundID[type] value: $foundID[id]");
   			}
   		}
   		// ------------ LASTNAME-TITLE QUERY ------------------------
   		// if NO GOOGLE IDs, then look for title and last name
   			if ($noIDresults){
   			debugPrint("No google IDs for author= $a title= $tit");
   			$barray = array();
   			// if it's a single name, then don't look for last name
   			if (strpos($a," ") === false){ // no space in it
   				$auth = $a."*";
   				debugPrint("Author $a : single name");
   			}
   			else {
   				$auth = $a . ",*"; // 
   			}
			$tith = urlencode($tit);
			$auth = urlencode($auth);
				
			$queryurl = "http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:hollis_catalog%20AND%20title_keyword:%22$tith%22%20AND%20creator:" . $auth;
			
			debugPrint("AUTHOR QUERY: $queryurl");
		
			//print_r("<br>" . $queryurl);
			curl_setopt($ch, CURLOPT_URL, $queryurl);
			// Return the transfer as a string 
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
			// $output contains the output string 
			$booksfound = curl_exec($ch); 
			$recorddecoded = json_decode($booksfound);
			// create new entry to record the lack of a matching isbn
			$enhancedhollisrecord = $recorddecoded;
			$enhancedhollisrecord->IDfound = array();
			$enhancedhollisrecord->gresultnumber = $i;
			
			// loop through the books found for this match, 
			// removing ones where the first word of the title doesn't match the first
			// word of the title of the google book. This takes care of
			// keyword matches where the titles are obviously wrong for the google book
			if (isset($recorddecoded->num_found)){ 
				debugPrint("Books found for author query: " . $recorddecoded->num_found);
				if (is_array($recorddecoded->docs)){
				debugPrint("In book $i . Docs count = " . count($recorddecoded->docs));
				for ($m=0; $m < count($recorddecoded->docs); $m++){
					// "normalize" the titles
					$htit = $recorddecoded->docs[$m]->title;
					$htith = strtolower($htit);
					$gtit = strtolower($tit);
					$gtit = preg_replace('/^(the |a |an |der |das )|/', '', $gtit);
					$htith = preg_replace('/^(the |a |an |der |das )|/', '', $htith);
					
					debugPrint("hollis title:  >$htith< gdocs title: >$gtit< strpos: " . strpos($htith,$gtit));
					if (strpos($htith,$gtit) !== 0){
						debugPrint("removing doc $m");
						unset($recorddecoded->docs[$m]);
						// reduce number found
						$recorddecoded->num_found = $recorddecoded->num_found - 1;
					}
				}
				// the docs are now numbered with gaps. renumber them consequetively
				$how_many_docs = count($recorddecoded->docs);
				$ctr=0;
				$newdocarray = array();
				for ($p=0; $p < $how_many_docs; $p++){
					if (isset($recorddecoded->docs[$p])){
						//$recorddecoded->docs[$ctr] = $recorddecoded->docs[$p];
						$newdocarray[$ctr] = $recorddecoded->docs[$p];
						$ctr = $ctr + 1;
					}
				}
				$recorddecoded->docs = $newdocarray;
				}
			}
			else {
				debugPrint("No num_found for author query");
			}
			// push it into the overall array
			array_push($booksarray,$recorddecoded);
   		}
 
}

curl_close($ch);

echo json_encode($booksarray);
?>