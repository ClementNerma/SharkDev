<?php
require_once(__DIR__ . '/server/session.php');

if(!$_SESSION['shark-user']['username']) {
    header("Location: login.php");
} else { ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Shark Dev</title>
    <link rel="stylesheet" type="text/css" href='http://fonts.googleapis.com/css?family=Roboto|Open+Sans' />
    <link rel="stylesheet" type="text/css" href="css/bootstrap/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="css/jstree/default/style.min.css" />
    <link rel="stylesheet" type="text/css" href="css/font-awesome/font-awesome.min.css" />
    <link rel="stylesheet" type="text/css" href="css/studio.css" />
<body>

    <noscript>
        Shark Dev Studio needs JavaScript to work. Please enable JavaScript in your browser's settings or use a more recent browser !
    </noscript>

    <div class="modal fade" id="projects" tabindex="-1" role="dialog" aria-labelledby="projectsList" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    <h4 class="modal-title" id="myModalLabel">Projects</h4>
                </div>
                <div class="modal-body">
                    <fieldset>
                        <legend>Public projects</legend>
                        <div class="list-group" data="public"></div>
                    </fieldset>
                    <fieldset>
                        <legend>Private projects</legend>
                        <div class="list-group" data="private"></div>
                    </fieldset>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default">New</button>
                </div>
            </div>
        </div>
    </div>

    <div id="menu"></div>
    <div id="panel"></div>
    <ul id="tabs" class="nav nav-tabs"></ul>
    <div id="editor"></div>

    <script type="text/javascript" src="js/bootstrap/jquery.min.js"></script>
    <script type="text/javascript" src="js/bootstrap/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/bootbox/bootbox.min.js"></script>
    <script type="text/javascript" src="js/jstree/jstree.min.js"></script>
    <script type="text/javascript" src="js/ace/src-min-noconflict/ace.js"></script>
    <script type="text/javascript" src="js/ace/src-min-noconflict/ext-language_tools.js"></script>
    <script type="text/javascript" src="js/jquery.hotkeys/jquery.hotkeys.js"></script>

    <script type="text/javascript" src="js/lib/lib.js"></script>
    <script type="text/javascript" src="js/lib/types.js"></script>

    <script type="text/javascript" src="js/shark.js"></script>
    <script type="text/javascript" src="js/studio.js"></script>

</body>
</html>
<?php } ?>