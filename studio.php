<?php

require_once(__DIR__ . '/server/config.php');
require_once(__DIR__ . '/server/session.php');

if(!$_SESSION['shark-user']['username']) {
    header("Location: login.php");
} else { ?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title><?php echo $_SESSION['shark-user']['username']; ?> - Shark Dev</title>
    <link rel="stylesheet" type="text/css" href='http://fonts.googleapis.com/css?family=Roboto|Open+Sans' />
    <link rel="stylesheet" type="text/css" href="css/bootstrap/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="css/jstree/default/style.min.css" />
    <link rel="stylesheet" type="text/css" href="css/font-awesome/font-awesome.min.css" />
    <link rel="stylesheet" type="text/css" href="css/terminal/jquery.terminal.css" />
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

    <nav id="menu" class="navbar navbar-default navbar-fixed-top">
        <div class="container">
            <div class="navbar-header">
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span class="sr-only">Toggle navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>
                <a class="navbar-brand" href="#"><?php echo $_SESSION['shark-user']['username']; ?></a>
            </div>
            <div id="navbar" class="navbar-collapse collapse">
                <ul class="nav navbar-nav" id="menuitems">
                    <!--<li class="active"><a href="#">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Dropdown <span class="caret"></span></a>
                        <ul class="dropdown-menu" role="menu">
                            <li><a href="#">Action</a></li>
                            <li><a href="#">Another action</a></li>
                            <li><a href="#">Something else here</a></li>
                            <li class="divider"></li>
                            <li class="dropdown-header">Nav header</li>
                            <li><a href="#">Separated link</a></li>
                            <li><a href="#">One more separated link</a></li>
                        </ul>
                    </li>!-->
                </ul>
                <!--<ul class="nav navbar-nav navbar-right">
                    <li><a href="../navbar/">Default</a></li>
                    <li><a href="../navbar-static-top/">Static top</a></li>
                    <li class="active"><a href="./">Fixed top <span class="sr-only">(current)</span></a></li>
                </ul>!-->
            </div><!--/.nav-collapse -->
        </div>
    </nav>

    <div id="panel"></div>
    <div id="settings"></div>
    <ul id="tabs" class="nav nav-tabs"></ul>
    <div id="editor"></div>
    <div id="terminal-container">
        <div id="terminal-tools" class="btn-group" role="group">
            <button type="button" class="btn btn-primary fa fa-times" title="Close" action="close"></button>
            <button type="button" class="btn btn-default fa fa-file-o" title="Clear" action="clear"></button>
        </div>
        <div id="terminal"></div>
    </div>

    <script type="text/javascript" src="js/bootstrap/jquery.min.js"></script>
    <script type="text/javascript" src="js/bootstrap/bootstrap.min.js"></script>
    <script type="text/javascript" src="js/bootbox/bootbox.min.js"></script>
    <script type="text/javascript" src="js/jstree/jstree.min.js"></script>
    <script type="text/javascript" src="js/ace/src-min-noconflict/ace.js"></script>
    <script type="text/javascript" src="js/ace/src-min-noconflict/ext-language_tools.js"></script>
    <script type="text/javascript" src="js/terminal/jquery.terminal.min.js"></script>
    <script type="text/javascript" src="js/jquery-ui/jquery-ui.min.js"></script>

    <script type="text/javascript" src="js/lib/lib.js"></script>
    <script type="text/javascript" src="js/lib/types.js"></script>
    <script type="text/javascript">

        var request = {
            <?php
                if(isset($_GET['surl']) && strlen($_GET['surl']) > 2) {
                    echo 'project: "' . (substr($_GET['surl'], 0, 2) == 'pr' ? 'private/' : 'public/') . substr($_GET['surl'], 2) . '"';
                } else {
                    if(isset($_GET['project'])) { echo 'project: "' . $_GET['project'] . '"'; }
                    if(isset($_GET['project']) && isset($_GET['commit'])) { echo ','; }
                    if(isset($_GET['commit'])) { echo 'commit: "' . $_GET['commit'] . '"'; }
                }
            ?>
        };

        var sharkDevRobot = <?php echo '"' . $shark['sys']['robot'] . '"'; ?>

    </script>

    <script type="text/javascript" src="js/shark.js"></script>
    <script type="text/javascript" src="js/studio.js"></script>

</body>
</html>
<?php } ?>