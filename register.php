<?php

require_once(__DIR__ . '/server/config.php');

function element($name, $placeholder, $type, $icon) {
	global $error;
	//echo ($error ? ($error[0] == $name ? ' has-error' : '') : '');
	echo '<div class="form-group' . ($error[0] == $name ? ' has-error' : '') . '"><input name="' . $name . '" type="' . $type . '" class="form-control" value="' . (isset($_POST[$name]) ? $_POST[$name] : null) . '" placeholder="' . $placeholder . '" id="' . $name . '" required /> <label class="login-field-icon fa fa-' . $icon . '" for="' . $name . '"></label></div>' . "\n";
}

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Register</title>
	<link rel="stylesheet" type="text/css" href="css/bootstrap/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="css/font-awesome/font-awesome.min.css" />
	<link rel="stylesheet" type="text/css" href="css/flat-ui/flat-ui.min.css" />
	<link rel="stylesheet" type="text/css" href="css/login-register.css" />
</head>
<body>
	<style type="text/css">label.fa { padding-top: 10px; }</style>
	<div class="info">
		<h4>You want to join us ? Create an account in two minutes<br />and get full-access to SharkDev Studio !</h4>
	<?php if(!$shark['users']['allow-register']) { ?>
		<h4>We are sorry, but the register page has been disabled by the administrator of the website</h4>
	<?php } else { ?>
	</div>

	<?php

	$displayForm = true;
	$error = null;

	if(isset($_POST['register-data'])) {
		$displayForm = false;

		$verif = array('name', 'password', 'password-confirm', 'email', 'email-confirm');

		foreach($verif as $i => $name) {
			if(!isset($_POST[$name])) {
				$error = array($name, ucfirst(str_replace('-confirm', ' confirmation', $name)) . ' is needed !');
				break;
			}
		}

		if(!$error) {
			if($_POST['password'] != $_POST['password-confirm']) {
				$error = array('password-confirm', 'The two passwords does not match !');
				$displayForm = true;
			} else if($_POST['email'] != $_POST['email-confirm']) {
				$error = array('email-confirm', 'The two emails does not match !');
				$displayForm = true;
			} else {
				require_once(__DIR__ . '/server/API.php');
				$APIMessage = API::createUser($_POST['name'], $_POST['password'], $_POST['email']);

				if($APIMessage !== $shark['msg']['API-done']) {
					// API had an error
					if($APIMessage !== $shark['msg']['API-error']) {
						$error = array('', $APIMessage);
						$displayForm = true;
					} else {
						// internal API error ($APIMessage === $shark['msg']['API-error'])
						$error = array('', 'Internal server error. Please try later.');
						$displayForm = true;
					}
				} else {
					// registration successfull
					echo '<div class="alert alert-success" role="alert">Your account has been activated ! You can now use you account in the <a href="login.php">login</a> page !</div>';
				}
			}
		} else {
			$displayForm = true;
		}

	}

	if($displayForm) { ?>

	<div id="form">
		<?php if($error) { echo '<div class="alert alert-danger" role="alert">' . $error[1] . '</div>'; } ?>
		<div id="error" class="alert alert-danger" style="display: none;" role="alert"></div>
		<div class="login-form">

		    <?php

		    element('name', 'Username', 'text', 'user');
		    element('password', 'Password', 'password', 'key');
		    element('password-confirm', 'Password (retype)', 'password', 'key');
		    element('email', 'Email', 'email', 'envelope');
		    element('email-confirm', 'Email (retype)', 'text', 'envelope');

		    ?>

		    <button class="btn btn-primary btn-lg btn-block" id="submitButton">Register</button>
		</div>
	</div>
	<?php } ?>
	<?php } ?>

	<script type="text/javascript" src="js/bootstrap/jquery.min.js"></script>
	<script type="text/javascript" src="js/bootstrap/bootstrap.min.js"></script>
	<script type="text/javascript" src="js/flat-ui/flat-ui.min.js"></script>

	<script type="text/javascript" src="js/cryptojs/rollups/pbkdf2.js"></script>
    <script type="text/javascript" src="js/cryptojs/rollups/sha512.js"></script>
    <script type="text/javascript" src="js/cryptojs/rollups/hmac-sha512.js"></script>

	<script type="text/javascript" src="js/lib/types.js"></script>
	<script type="text/javascript" src="js/register.js"></script>
</body>
</html>