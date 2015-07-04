<?php

$allowGuest = $hideDefaultView = true;
$showForgot = $showForgotSubmitted = $showReset = false;
require 'framework/inc.php';
Page::setTitle('Login');

$displayForm = true;

if(isset($_GET['action']) || isset($_POST['forgot'])) {
    switch(isset($_GET['action']) ? $_GET['action'] : 'forgot') {
        case 'logout':
            $_SESSION['skyer-user'] = array('guest' => true);
            break;

        case 'forgot':
            if(isset($_POST['pseudo'])) {
                $user = DataBase::get('users', array(), array('pseudo' => $_POST['pseudo']));

                if(!count($user) || $user === false)
                    $user = DataBase::get('users', array(), array('email' => $_POST['pseudo']));

                if(count($user) && $user !== false) {
                    $user = $user[0];
                    sendMail($user['email'], Config::get('SITE_TITLE'), Config::get('SITE_TITLE'), 'Password reset', 'Dear ' . $user['firstname'] . ' ' . $user['lastname'] . ",<br /><br />Next to your request, your password will be reset. Click the link below to reset it.<br />If you didn't request us to reset your password, simply ignore this mail.<br /><br /><a href=\"http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]?action=reset&token=" . $user['token'] . "\">Reset your password</a><br /><br /><small>Sent from Skyer</small>");
                    $showForgotSubmitted = true;
                } else {
                    die('<h3>User not found</h3>');
                }
            } else {
                $showForgot = true;
            }

            break;

        case 'reset':
            if(isset($_GET['token'])) {
                $user = DataBase::get('users', array(), array('token' => $_GET['token']));

                if(count($user) && $user !== false) {
                    $pass = md5(uniqid(rand(), true));
                    DataBase::update('users', array('password' => hash('sha384', $pass)), array('token' => $_GET['token']));
                    $showReset = true;
                } else {
                    die('<h3>User not found</h3>');
                }
            } else {
                die('<h3>Bad request</h3>');
            }
            break;
    }
}

if(!User::isGuest() && (!isset($_GET['action']) || $_GET['action'] !== 'logout'))
    header('Location: index.php');

if(isset($_POST['submit']) && isset($_POST['pseudo']) && isset($_POST['password'])) {
    $displayForm = false;

    if(User::login($_POST['pseudo'], $_POST['password'])) {
        header('Location: index.php');
    } else {
        echo '<h1 style="padding: 20px;">Invalid credentials <a href="login.php">Retry</a></h1>';
    }
}

if($displayForm) { ?>

<div class="middle-box text-center loginscreen  animated fadeInDown">
<div>
    <div>
        <h1 class="logo-name">IN+</h1>
    </div>
    <h3>Welcome to Skyer</h3>
    <p>Connect to your account.</p>
    <form class="m-t" role="form" method="POST" action="login.php">
        <?php if($showReset) { ?>
            <big>Your new password is : <?php echo $pass; ?>. Don't forget it !<br /><a href="login.php">Login now</a></big>
        <?php } elseif($showForgotSubmitted) { ?>
            <big>A mail was sent to you. It contains a link to reset your password.</big>
        <?php } else { ?>
        <div class="form-group">
            <input type="text" name="pseudo" class="form-control" placeholder="Username or Email" required="">
        </div>
        <?php if(!$showForgot) { ?>
        <div class="form-group">
            <input type="password" name="password" class="form-control" placeholder="Password" required="">
        </div>
        <?php } else { ?>
        <input type="hidden" name="forgot" value="true" />
        <?php } ?>
        <button type="submit" name="submit" class="btn btn-primary block full-width m-b">Login</button>

        <a href="?action=forgot"><small>Forgot password ?</small></a>
        <p class="text-muted text-center"><small>Do not have an account ?</small></p>
        <a class="btn btn-sm btn-white btn-block" href="register.php">Create an account</a>
        <?php } ?>
    </form>
    <!--<p class="m-t"> <small>Skyer template using Inspinia</small> </p>!-->
</div>
</div>

<?php } Page::send(); ?>