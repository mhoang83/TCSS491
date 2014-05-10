<?php

if(isset($_GET['id'])) {
	
	echo file_get_contents("levels/level" . $_GET['id'].".json");	
}

?>