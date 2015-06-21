<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login - Shark Dev</title>
    <link rel="stylesheet" type="text/css" href="css/bootstrap/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="css/flat-ui/flat-ui.min.css" />
    <link rel="stylesheet" type="text/css" href='http://fonts.googleapis.com/css?family=Roboto|Open+Sans' />
    <link rel="stylesheet" type="text/css" href="css/login-register.css" />
</head>
<body>
    <h4 id="info">An account is required to access to the Shark Dev Studio</h4>

    <div id="form">
        <div class="alert alert-danger" id="error"></div>
        <div class="form-group">
            <label for="username">User name</label>
            <input type="text" id="username" name="username" class="form-control" />
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" class="form-control" />
        </div>
        <button id="login" class="btn btn-primary btn-lg btn-block">Login</button>
    </div>

    <script type="text/javascript" src="js/bootstrap/jquery.min.js"></script>

    <script type="text/javascript" src="js/cryptojs/rollups/pbkdf2.js"></script>
    <script type="text/javascript" src="js/cryptojs/rollups/sha512.js"></script>
    <script type="text/javascript" src="js/cryptojs/rollups/hmac-sha512.js"></script>

    <script type="text/javascript" src="js/login.js"></script>
</body>
</html>
