<?php
include('db.php');
error_reporting(E_ALL & ~E_NOTICE); 
if (isset($_POST['login'])) {
	$name = $db->quote($_POST['name']);
	$pword = $db->quote($_POST['pword']);
	$stmnt = $db->prepare('Select user_id from User where user_name = ' . $name . ' and user_password = ' . $pword . ';' );
	$stmnt->execute();
	if ($stmnt->rowCount() !== 1) {
		die('user not found;');
	} else {
		$row = $stmnt->fetch(PDO::FETCH_ASSOC);
		echo $row['user_id'];
	}

} else if (isset($_POST['register'])) {
	$name = $db->quote($_POST['name']);
	$pword = $db->quote($_POST['pword']);
	$stmnt = $db->prepare('Select user_id from User where user_name = ' . $name . ' and user_password = ' . $pword . ';' );
	$stmnt->execute();
	if ($stmnt->rowCount() !== 1) {
		$stmnt = $db->prepare("Insert into User(user_name, user_password) values ($name, $pword);" );
		$stmnt->execute();
		$stmnt = $db->prepare('Select user_id from User where user_name = ' . $name . ' and user_password = ' . $pword . ';' );
		$stmnt->execute();
		$row = $stmnt->fetch(PDO::FETCH_ASSOC);
		echo $row['user_id'];
	} else 
		die('user already exists');
	
} else if (isset($_POST['score'])) {
	$score = $db->quote($_POST['score']);
	$user_id = $db->quote($_POST['user_id']);
	$ls_id= $db->quote($_POST['ls_id']);
	$stmnt = $db->prepare("Select * from Scores where user_id = $user_id and ls_id = $ls_id;" );
	$stmnt->execute();
	if ($stmnt->rowCount() === 0) {
		$stmnt = $db->prepare("Insert into Scores(user_id, ls_id, score) values ($user_id, $ls_id, $score);" );
		$stmnt->execute();
	} else {
		$row = $stmnt->fetch(PDO::FETCH_ASSOC);
		if ($row['score'] < $score) {
			$stmnt = $db->prepare("Update Scores set score = $score where user_id = $user_id and ls_id = $ls_id;");
			$stmnt->execute();
		}
	}
} else if (isset($_POST['user_id'])) {
	$id = $name = $db->quote($_POST['user_id']);
	$stmnt = $db->prepare("Select user_name from User where user_id = $id ;" );
		$stmnt->execute();
		$row = $stmnt->fetch(PDO::FETCH_ASSOC);
		echo $row['user_name'];
} else if (isset($_GET['userscores'])) {
	$user_id = $db->quote($_GET['user_id']);
	$stmnt = $db->prepare("Select ls_name, score from Scores s join LevelSequences ls on ls.ls_id = s.ls_id where s.user_id = $user_id order by score desc limit 10");
	$stmnt->execute();
	$arr = array( );
	while($row = $stmnt->fetch(PDO::FETCH_ASSOC)) {
		$arr[$row['ls_name']] = $row['score']; 
	}
	echo json_encode($arr);
} else if (isset($_GET['globalscores'])) {
	$user_id = $db->quote($_GET['user_id']);
	$stmnt = $db->prepare("Select user_name ,ls_name, score from Scores s join LevelSequences ls on ls.ls_id = s.ls_id  join User u on u.user_id = s.user_id order by score desc limit 10");
	$stmnt->execute();
	$arr = array( );
	while($row = $stmnt->fetch(PDO::FETCH_ASSOC)) {
		$arr[$row['ls_name']] = array($row['user_name'], $row['score'] ); 
	}
	echo json_encode($arr);
} 

?>