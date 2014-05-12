<?php

// http://stackoverflow.com/questions/3899553/getting-data-from-json-with-php
error_log("-------------------TEST GET FROM ISBN AND DECODE--------------------");
$queryurl = "http://hlslwebtest.law.harvard.edu/v2/api/item/?filter=collection:hollis_catalog%20AND%20((id_isbn:0436203774%20OR%20id_isbn:234213))";

   $ch = curl_init(); 
   curl_setopt($ch, CURLOPT_URL, $queryurl);
	// Return the transfer as a string 
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
	// $output contains the output string 
	$isbreturn = curl_exec($ch); 
	$recorddecoded = json_decode($isbreturn);
	$record = $recorddecoded->num_found;
	print_r("<pre> foundreturn: $record </pre>");
	$isbarray =  $recorddecoded->docs[0]->id_isbn;
	$firstisb = $isbarray[0];
	print_r("ISBN: $isb  FOUND: $firstisb");
   		
curl_close($ch);




// {
// num_found: 1,
// start: "0",
// limit: "25",
// sort: "shelfrank desc",
// filter: "collection:hollis_catalog AND ((id_isbn:0436203774 OR id_isbn:234213))",
// docs: [
// {
// holding_libs: [
// "DIV",
// "WID"
// ],
// score_holding_libs: 2,
// id_isbn: [
// "0436203774",
// "0436231255",
// "0436231336",
// "0436231298",
// "04"
// ],
// id: "DAFDA04B-3E12-0BDF-1CEB-B2B77058934B",
// call_num: [
// "PR6029 .R8 1996%%PR6029 .R8 1997"
// ],
// title_sort: "complete works of George Orwell",
// score_checkouts_undergrad: 49,
// height: "24 cm",
// title_link_friendly: "the-complete-works-of-george-orwell",
// creator: [
// "Orwell, George, 1903-1950.",
// "Davison, Peter Hobley."
// ],
// score_checkouts_grad: 16,
// pub_date: "1997",
// loc_call_num_subject: [
// "Language and literature -- English literature -- 1900-1960 -- Individual authors"
// ],
// pub_location: "London",
// ut_id: "e928b432a60ad31345bef15c30c2c3cf",
// score_reserves: 2,
// pages: "20 v",
// loc_call_num_sort_order: [
// 8541152,
// 8541153
// ],
// score_checkouts_fac: 41,
// data_source: "harvard_edu",
// dataset_tag: "harvard_edu_catalog_bibs_1385882476",
// score_recalls: 1,
// shelfrank: 49,
// language: "English",
// title: "The complete works of George Orwell",
// id_inst: "007914316",
// ut_count: 18,
// id_oclc: "ocn222669980",
// note: [
// "Originally published, v. 1-9: London : Secker & Warburg, 1986",
// "Includes bibliographical references and indexes"
// ],
// height_numeric: 24,
// format: "Book",
// publisher: "Secker & Warburg",
// pub_date_numeric: 1997,
// source_record: {
// 9060: "OCLC",
// 988a: "20020608",
// 504a: "Includes bibliographical references and indexes.",
// 500a: "Originally published, v. 1-9: London : Secker & Warburg, 1986.",
// 245a: "The complete works of George Orwell /",
// 035a: [
// "ocn222669980",
// "ocm39646641"
// ],
// 100a: "Orwell, George,",
// 245c: "edited by Peter Davison.",
// 100d: "1903-1950.",
// collection: "hollis_catalog",
// 505a: "v. 1. Down and out in Paris and London -- v. 2. Burmese days -- v. 3. A Clergyman's daughter -- v. 4. Keep the aspidistra flying -- v. 5. The road to Wigan Pier -- v. 6. Homage to Catalonia -- v. 7. Coimg up for air -- v. 8. Animal farm -- v. 9. Nineteen eighty-four -- v. 10. A kind of compulsion, 1903-1936 -- v. 11. Facing unpleasant facts, 1937-1939 -- v. 12. A patriot after all, 1940-1941 -- v. 13. All propaganda is lies, 1941-1942 -- v. 14. Keeping our little corner clean, 1941-1942 -- v. 15. Two wasted years, 1943 -- v. 16. I have tried to tell the truth, 1943-1944 -- v. 17. I belong to the left,1945 -- v. 18. Smothered under journalism, 1946 -- v. 19. It is what I think, 1947-1948 -- v. 20. Our job is to make life worth living, 1949-1950.",
// 020a: [
// "0436203774 (set)",
// "0436231255 (v. 1)",
// "0436231336 (v. 2)",
// "0436231298 (v. 3)",
// "0436231379 (v. 4)",
// "0436231417 (v. 5)",
// "0436231395 (v. 6)",
// "0436231271 (v. 7)",
// "0436231352 (v. 8)",
// "043623131X (v. 9)",
// "0436350203 (v. 10)",
// "043620360X (v. 11)",
// "0436203626 (v. 12)",
// "0436203642 (v. 13)",
// "0436203669 (v. 14)",
// "0436203685 (v. 15)",
// "0436203707 (v. 16)",
// "0436203723 (v. 17)",
// "043620374X (v. 18)",
// "0436203766 (v. 19)",
// "0436203782 (v. 20)"
// ],
// 040a: "EUE",
// 040c: "EUE",
// 040d: "HLS",
// toc: "v. 1. Down and out in Paris and London -- v. 2. Burmese days -- v. 3. A Clergyman's daughter -- v. 4. Keep the aspidistra flying -- v. 5. The road to Wigan Pier -- v. 6. Homage to Catalonia -- v. 7. Coimg up for air -- v. 8. Animal farm -- v. 9. Nineteen eighty-four -- v. 10. A kind of compulsion, 1903-1936 -- v. 11. Facing unpleasant facts, 1937-1939 -- v. 12. A patriot after all, 1940-1941 -- v. 13. All propaganda is lies, 1941-1942 -- v. 14. Keeping our little corner clean, 1941-1942 -- v. 15. Two wasted years, 1943 -- v. 16. I have tried to tell the truth, 1943-1944 -- v. 17. I belong to the left,1945 -- v. 18. Smothered under journalism, 1946 -- v. 19. It is what I think, 1947-1948 -- v. 20. Our job is to make life worth living, 1949-1950",
// 700a: "Davison, Peter Hobley.",
// 300a: "20 v. ;",
// 300c: "24 cm.",
// score_total: "64",
// 240a: "Works.",
// 260a: "London :",
// 260b: "Secker & Warburg,",
// 260c: "[1997]-1998.",
// 240f: "1997",
// 090a: "PR6029",
// 090b: ".R8 1996x"
// }
// }
// ],
// facets: [ ],
// facet_queries: [ ],
// errors: [ ]
// }

?>