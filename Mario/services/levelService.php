<?php
error_reporting(E_ALL & ~E_NOTICE); 
include('db.php');
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
} else if (isset($_POST['seq'])) {
	// ls_id auto increment, ls_name - seq, user_id
	$ls_name = $db->quote($_POST['seq']);
	$user_id = $db->quote($_POST['user_id']);
	$levels = $_POST['levels'];
	$stmnt = $db->prepare("Select * from LevelSequences where user_id = $user_id and ls_name = $ls_name");
	$stmnt->execute();
	if ($stmnt->rowCount() === 0) {
		$stmnt = $db->prepare("Insert into LevelSequences(user_id, ls_name) values ($user_id, $ls_name)");
		$stmnt->execute();
		$stmnt = $db->prepare("Select * from LevelSequences where user_id = $user_id and ls_name = $ls_name");
		$stmnt->execute();
		$row = $stmnt->fetch(PDO::FETCH_ASSOC);
		$ls_id = $row['ls_id'];
		for ($i = 0; $i < count($levels); $i++) {
			$level_name = $db->quote($levels[$i]);
			$stmnt = $db->prepare("Insert into level(level_name, ls_id) values ($level_name, $ls_id)");
			$stmnt->execute();
		}
		echo $ls_id;
	} else {
		die('sequence exists');
	}
} else if (isset($_GET['sequences'])) {
	$stmnt = $db->prepare("Select * from LevelSequences");
	$stmnt->execute();
	$arr = array( );
	while($row = $stmnt->fetch(PDO::FETCH_ASSOC)) {
		$arr[$row['ls_id']] = $row['ls_name']; 
	}
	echo json_encode($arr);
} else if (isset($_GET['seq_levels'])) {
	$ls_id = $db->quote($_GET['seq_levels']);
	$stmnt = $db->prepare("Select * from level where ls_id = $ls_id");
	$stmnt->execute();
	$arr = array( );
	while($row = $stmnt->fetch(PDO::FETCH_ASSOC)) {
		$arr[$row['level_id']] = $row['level_name']; 
	}
	echo json_encode($arr);
}

?>