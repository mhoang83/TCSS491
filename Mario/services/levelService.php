<?php
error_reporting(E_ALL & ~E_NOTICE); 
if (isset($_POST['save'])) {
	file_put_contents("levels/" .$_POST['name'].".json", $_POST['data']);
	echo $_POST['data'];
} else if ($_GET['levels']) {
	$file = glob('levels/*.json');
	$ret = array('levels' => $file);
	echo json_encode($ret);
} else
if(isset($_GET['id'])) {
	
	echo json_encode(json_decode(file_get_contents("levels/" . $_GET['id'].".json")));	
}

?>