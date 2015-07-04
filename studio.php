<?php

if(isset($_GET['project']) && isset($_GET['commit']))
    $hideDefaultView = true;

require 'framework/inc.php';

Page::setTitle(User::get('pseudo') . ' - Shark Dev');

Page::css("jstree/default/style.min");
Page::css("terminal/jquery.terminal");
Page::css("studio");

Page::js("bootbox/bootbox.min");
Page::js("jstree/jstree.min");
Page::js("ace/src-min-noconflict/ace");
Page::js("ace/src-min-noconflict/ext-language_tools");
Page::js("terminal/jquery.terminal.min");
Page::js("jquery-ui/jquery-ui.min");

Page::js("lib/lib");
Page::js("lib/types");

Page::js("shark");
Page::js("studio");

?>

<link rel="stylesheet" type="text/css" href="http://fonts.googleapis.com/css?family=Roboto|Open+Sans" />

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
            <a class="navbar-brand" href="#"><?=User::get('pseudo')?></a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
            <ul class="nav navbar-nav" id="menuitems"></ul>
        </div>
    </div>
</nav>

<div id="panel">Salut !</div>
<ul id="tabs" class="nav nav-tabs"></ul>
<div id="editor"></div>
<div id="terminal-container">
    <!--<div id="terminal-tools" class="btn-group" role="group">
        <button type="button" class="btn btn-primary fa fa-times" title="Close" action="close"></button>
        <button type="button" class="btn btn-default fa fa-file-o" title="Clear" action="clear"></button>
    </div>!-->
    <div id="terminal"></div>
</div>
<div id="settings"></div>
<div id="status"><i id="status-loader" class="fa fa-spinner fa-pulse"></i> <span id="status-text"></span> <span class="fa fa-times" id="close-status"></span></div>
<div id="runner"></div>
<div id="footer">Footer !</div>

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

    var sharkDevRobot = <?php echo '"' . User::getUserFromID(0)['fullname'] . '"'; ?>

</script>

<?php Page::send(); ?>