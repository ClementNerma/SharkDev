<?php $allowGuest = true; $hideDefaultView = true; require('framework/inc.php'); Page::setTitle('Register'); ?>
<?php

Page::css('inspinia/plugins/iCheck/custom');
Page::css('register');
Page::js('inspinia/plugins/iCheck/icheck.min');
Page::js('register');

$registered = $activated = false;
$err = '';

if(isset($_GET['activate'])) {
    $user = DataBase::get('users', array(), array('token' => $_GET['activate']));

    if(count($user) && $user !== false) {
        $pass = md5(uniqid(rand(), true));
        DataBase::update('users', array('activated' => 1), array('token' => $_GET['activate']));
        $activated = true;
    } else {
        die('<h3>User not found</h3>');
    }
} elseif(isset($_POST['submit'])) {
    $required = array('pseudo', 'firstname', 'lastname', 'fullname', 'email', 'email-confirm', 'password', 'password-confirm');

    foreach($required as $i => $name)
        if(!isset($_POST[$name]))
            $err = 'All fields are required';
        else
            $_POST[$name] = htmlspecialchars($_POST[$name]);

    if(strlen($_POST['pseudo']) < 5)
        $err = 'Pseudo must be at least 5 characters';
    elseif(strlen($_POST['pseudo']) > 30)
        $err = 'Pseudo must be shorter than 30 characters';
    elseif(!preg_match('#^([a-zA-Z0-9_\-]+)$#', $_POST['pseudo']))
        $err = 'Bad pseudo : must be composed of letters, digits, dashes and underscores';
    elseif(strlen($_POST['password']) < 6)
        $err = 'Password must be at least 6 characters';
    elseif(strlen($_POST['password']) > 60)
        $err = 'Password must be shorter than 60 characters';
    elseif($_POST['password'] !== $_POST['password-confirm'])
        $err = 'The two passwords does not match';
    elseif($_POST['email'] !== $_POST['email-confirm'])
        $err = 'The two email does not match';
    elseif(!isset($_POST['agree-terms']) || !$_POST['agree-terms'])
        $err = 'You must agree terms and privacy';
    else {
        $user = DataBase::get('users', array(), array('pseudo' => $_POST['pseudo']));

        if(count($user) && $user !== false)
            $err = 'This pseudo is already used !';
        else {
            $user = DataBase::get('users', array(), array('email' => $_POST['email']));

            if(count($user) && $user !== false)
                $err = 'This email is already used !';
            else {
                $token = md5(uniqid(rand(), true)).md5(uniqid(rand(), true));
                if(DataBase::insert('users', array(
                    'pseudo' => $_POST['pseudo'],
                    'password' => hash('sha384', $_POST['password']),
                    'email' => $_POST['email'],
                    'firstname' => $_POST['firstname'],
                    'lastname' => $_POST['lastname'],
                    'fullname' => $_POST['firstname'] . ' ' . $_POST['lastname'],
                    'activated' => 0,
                    'rights' => 1,
                    'register' => 'NOW()',
                    'reputation' => 0,
                    'token' => $token
                ))) {
                    try {
                        chdir(__DIR__ . '/server/users');
                        Lib::recurseCopy('.model', $_POST['pseudo']);
                        sendMail($_POST['email'], Config::get('SITE_TITLE'), Config::get('SITE_EMAIL'), 'Activate your account', 'Dear ' . $_POST['firstname'] . ' ' . $_POST['lastname'] . ",<br /><br />You've just created an account. To activate it, use the link below.<br /><br /><a href=\"http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]?activate=" . $token . "\">Activate your account</a><br /><br /><small>Sent from Skyer</small>");
                        $registered = true;
                    }

                    catch(Exception $e) {
                        $err = 'Internal disk error. Please try again.';
                    }
                } else
                    $err = 'DataBase error. Please try again.';       
            }   
        }
    }

}

?>
<style type="text/css">body{padding-bottom: 20px;}</style>
<div class="middle-box text-center loginscreen   animated fadeInDown">
    <div>
        <div>
            <h1 class="logo-name">IN+</h1>
        </div>
        <h3>Register to IN+</h3>
        <p>Create account to access to <?php echo Config::get('SITE_TITLE'); ?>.</p>
        <?php if($activated) { ?>
            <big>Your account has been activated. <a href="login.php">Login now</a></big>
        <?php } else {
            if(!$registered) {
            if($err) { echo '<p class="text-danger">' . $err . '</p>'; } ?>
        <form class="m-t" role="form" method="POST" action="register.php">
            <div class="form-group">
                <input type="text" class="form-control" name="pseudo" placeholder="Pseudo" required="">
            </div>
            <div class="form-group">
                <input type="text" class="form-control" name="firstname" placeholder="First name" required="">
            </div>
            <div class="form-group">
                <input type="text" class="form-control" name="lastname" placeholder="Last name" required="">
            </div>
            <div class="form-group">
                <input type="email" class="form-control" name="email" placeholder="Email" required="">
            </div>
            <div class="form-group">
                <input type="email" class="form-control" name="email-confirm" placeholder="Email (confirm)" required="">
            </div>
            <div class="form-group">
                <input type="password" class="form-control" name="password" placeholder="Password" required="">
            </div>
            <div class="form-group">
                <input type="password" class="form-control" name="password-confirm" placeholder="Password (confirm)" required="">
            </div>
            <div class="form-group">
                <div class="checkbox i-checks"><label> <input type="checkbox" name="agree-terms"><i></i> Agree the <a href="terms.php">terms and policy</a> </label></div>
            </div>
            <button type="submit" name="submit" class="btn btn-primary block full-width m-b">Register</button>

            <p class="text-muted text-center"><small>Already have an account?</small></p>
            <a class="btn btn-sm btn-white btn-block" href="login.php">Login</a>
        </form>
        <?php } else { ?>
            <big>A confirmation mail has been sent to you. It contains a link to activate your account.</big>
        <?php }} ?>
        <!--<p class="m-t"> <small>Inspinia we app framework base on Bootstrap 3 &copy; 2014</small> </p>!-->
    </div>
</div>
<?php Page::send(); ?>