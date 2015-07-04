<?php

require 'framework/inc.php';

if(!isset($_GET['do']) && !isset($_POST['do']))
	die('<h3>Bad request</h3>');

if(User::isGuest())
	die('<h3>You must be logged in</h3>');

switch((isset($_GET['do']) ? $_GET['do'] : $_POST['do'])) {
	case 'directory':
		$dir = DataBase::get('messages', array('ID', 'recipient', 'sender', 'recipient_dir', 'sender_dir', 'subject', 'sent', 'opened'), array('recipient' => User::getID(), 'recipient_dir' => $_GET['where']));

		foreach($dir as $i => $mail) {
			$sender = User::getUserFromID($mail['sender']);
			$dir[$i]['sender_ID'] = $mail['sender'];
			$dir[$i]['sender'] = $sender['fullname'];

			$recipient = User::getUserFromID($mail['recipient']);
			$dir[$i]['recipient_ID'] = $mail['recipient'];
			$dir[$i]['recipient'] = $recipient['fullname'];

			$dir[$i]['ago'] = timeAgo($mail['sent']);
		}

		die(json_encode($dir));

		break;

	case 'markAsRead':
		DataBase::update('messages', array('opened' => 1), array('recipient' => User::getID(), 'ID' => $_GET['ID']));
		break;

	case 'markAsUnRead':
		DataBase::update('messages', array('opened' => 0), array('recipient' => User::getID(), 'ID' => $_GET['ID']));
		break;

	case 'open':
		$mail = DataBase::get('messages', array(), array('ID' => $_GET['ID']))[0];
		DataBase::update('messages', array('opened' => 1), array('ID' => $_GET['ID']));

		$sender = User::getUserFromID($mail['sender']);
		$mail['sender_ID'] = $mail['sender'];
		$mail['sender'] = $sender['fullname'];

		$recipient = User::getUserFromID($mail['recipient']);
		$mail['recipient_ID'] = $mail['recipient'];
		$mail['recipient'] = $recipient['fullname'];

		die(json_encode($mail));

		break;

	case 'move':
		$mail = DataBase::get('messages', array('sender', 'recipient'), array('ID' => $_GET['ID']));

		if(count($mail) && $mail !== false) {
			$mail = $mail[0];

			if($mail['sender'] == User::getID())
				$r = DataBase::update('messages', array('sender_dir' => $_GET['dir']), array('ID' => $_GET['ID'], 'sender' => User::getID()))->fetch();
			else if($mail['recipient'] == User::getID())
				$r = DataBase::update('messages', array('recipient_dir' => $_GET['dir']), array('ID' => $_GET['ID'], 'recipient' => User::getID()))->fetch();
			else
				die('<h3>Mail not found</h3>');

		} else {
			die('<h3>That\'s not your mail !</h3>');
		}
		
		die('true');

		break;

	case 'unread':
		$unread = DataBase::query('SELECT COUNT(*) FROM messages WHERE opened = 0 AND recipient_dir = ' . DataBase::_secure($_GET['folder']) . ' AND recipient = ' . User::getID())->fetch()[0];

		if(strval($unread))
			die($unread);
		else
			die();

		break;

	case 'send':
		// check message HTML does not comport malicious tags
		// for example with HTMLPurify PHP library

		$recipient = DataBase::get('users', array('ID'), array('fullname' => $_POST['recipient']));

		if(!count($recipient) || $recipient === false)
			die('false');

		if(DataBase::insert('messages', array(
			'sender' => User::getID(),
			'recipient' => $recipient[0]['ID'],
			'subject' => htmlspecialchars($_POST['subject']),
			'content' => $_POST['content'],
			'sent' => array('NOW()'),
			'opened' => 0,
			'answerTo' => 0,
			'sender_dir' => 'sent',
			'recipient_dir' => 'inbox'
		))) {
			if(DataBase::insert('messages', array(
				'sender' => User::getID(),
				'recipient' => $recipient[0]['ID'],
				'subject' => htmlspecialchars($_POST['subject']),
				'content' => $_POST['content'],
				'sent' => array('NOW()'),
				'opened' => 0,
				'answerTo' => 0,
				'sender_dir' => 'sent',
				'recipient_dir' => 'sent'
			)));

			die('true');
		} else
			die('false');

		break;

	default:
		die('<h3>Unknwon action</h3>');
		break;

}

die();
