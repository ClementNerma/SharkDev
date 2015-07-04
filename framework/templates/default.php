<?php

global $hideDefaultView;
global $allowGuest;

if(User::isGuest() && !isset($allowGuest)) {
    header('Location: login.php');
}

if(User::isLoggedIn()) {
    $unreadMessages = DataBase::query('SELECT COUNT(*) FROM messages WHERE opened = 0 AND recipient_dir = "inbox" AND recipient = ' . User::getID())->fetch()[0];
    if(!strval($unreadMessages)) $unreadMessages = '';

    $unreadAlerts = DataBase::query('SELECT COUNT(*) FROM messages WHERE opened = 0 AND recipient_dir = "alerts" AND recipient = ' . User::getID())->fetch()[0];
    if(!strval($unreadAlerts)) $unreadAlerts = '';
}

Page::css('main', true);
Page::css('font-awesome/font-awesome.min', true);
Page::css('inspinia/plugins/sweetalert/sweetalert', true);
Page::css('inspinia/plugins/iCheck/custom', true);
Page::css('inspinia/style', true);
Page::css('inspinia/animate', true);
Page::css('inspinia/bootstrap.min', true);

Page::js('main', true);
Page::js('inspinia/plugins/slimscroll/jquery.slimscroll', true);
Page::js('inspinia/plugins/metisMenu/jquery.metisMenu', true);
Page::js('inspinia/plugins/sweetalert/sweetalert.min', true);
Page::js('inspinia/plugins/iCheck/icheck.min', true);
Page::js('inspinia/inspinia', true);
Page::js('inspinia/bootstrap.min', true);
Page::js('inspinia/jquery-2.1.1', true);

?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="<?php echo Config::get('SITE_CHARSET'); ?>" />
	<title><?php echo self::$_pageTitle . ' - ' . Config::get('SITE_TITLE'); ?></title>
	<?php for($i = 0; $i < count(self::$_css); $i++) {
		echo '    <link rel="stylesheet" type="text/css" href="' . $base . self::$_css[$i] . '" />' . "\n";
	} ?>
</head>
<body<?php if($hideDefaultView) { echo ' class="gray-bg"'; } ?>>
	<?php if(!$hideDefaultView) { ?>
	<!-- left menu !-->

	<nav class="navbar-default navbar-static-side" role="navigation">
        <div class="sidebar-collapse">
            <ul class="nav" id="side-menu">
                <li class="nav-header">
                    <div class="dropdown profile-element">
                        <a data-toggle="dropdown" class="dropdown-toggle" href="<?=$base;?>#">
                            <span class="clear"> <span class="block m-t-xs"> <strong class="font-bold"><?=User::getFullName();?></strong>
                             </span> <span class="text-muted text-xs block">Member <b class="caret"></b></span> </span> </a>
                        <ul class="dropdown-menu animated fadeInRight m-t-xs">
                            <li><a href="<?=$base;?>profile.php">Profile</a></li>
                            <!--<li><a href="<?=$base;?>contacts.php">Contacts</a></li>!-->
                            <li><a href="<?=$base;?>mailbox.php">Mailbox</a></li>
                            <li class="divider"></li>
                            <li><a href="<?=$base;?>login.php?action=logout">Logout</a></li>
                        </ul>
                    </div>
                    <div class="logo-element">
                        IN+
                    </div>
                </li>
                
                <li><a href="index.php"><i class="fa fa-home"></i> <span class="nav-label">Home</span></a></li>
                <li>
                    <a href="mailbox.html"><i class="fa fa-envelope"></i> <span class="nav-label">Mailbox </span><span class="pull-right"><span class="label label-warning" content="unread-messages"><?=$unreadMessages?></span> <span class="label label-primary" content="unread-alerts"><?=$unreadAlerts?></span></span></a>
                    <ul class="nav nav-second-level collapse">
                        <li><a href="mailbox.php">Inbox <span class="label label-warning pull-right ng-binding" content="unread-messages"><?=$unreadMessages?></span></a></li>
                        <li><a href="mailbox.php#alerts">Alerts <span class="label label-primary pull-right ng-binding" content="unread-alerts"><?=$unreadAlerts?></span></a></li>
                        <li><a href="mailbox.php#compose">Compose</a></li>
                        <li><a href="mailbox.php#sent">Sent</a></li>
                    </ul>
                </li>
                <li><a href="studio.php"><i class="fa fa-file-text-o"></i> <span class="nav-label">Studio</span></a></li>
            </ul>

        </div>
    </nav>


    <div id="page-wrapper" class="gray-bg">
		<!-- topbar !-->	
		<div class="row border-bottom">
	        <nav class="navbar navbar-static-top white-bg" role="navigation" style="margin-bottom: 0">
	        <div class="navbar-header">
	            <a class="navbar-minimalize minimalize-styl-2 btn btn-primary  binded" href="#"><i class="fa fa-bars"></i> </a>
	            <form role="search" class="navbar-form-custom" method="post" action="search_results.html">
	                <div class="form-group">
	                    <input type="text" placeholder="Search for something..." class="form-control" name="top-search" id="top-search">
	                </div>
	            </form>
	        </div>
	            <ul class="nav navbar-top-links navbar-right">
	                <li>
	                    <span class="m-r-sm text-muted welcome-message">Welcome to Skyer.</span>
	                </li>
	                <li class="dropdown">
	                    <a class="dropdown-toggle count-info" data-toggle="dropdown" href="#">
                            <!-- unread messages !-->
	                        <i class="fa fa-envelope"></i>  <span class="label label-warning" content="unread-messages"><?=$unreadMessages?></span>
	                    </a>
	                    <ul class="dropdown-menu dropdown-messages">
                            <?php

                            $dir = DataBase::get('messages', array('ID', 'recipient', 'sender', 'recipient_dir', 'sender_dir', 'subject', 'sent', 'opened'), array('recipient' => User::getID(), 'recipient_dir' => 'inbox', 'opened' => 0));

                            foreach($dir as $i => $mail) {
                                $sender = User::getUserFromID($mail['sender']);
                                $mail['sender_ID'] = $mail['sender'];
                                $mail['sender'] = $sender['fullname'];

                                $recipient = User::getUserFromID($mail['recipient']);
                                $mail['recipient_ID'] = $mail['recipient'];
                                $mail['recipient'] = $recipient['fullname'];
                            ?>

                                <li>
                                    <div class="dropdown-messages-box">
                                        <a href="mailbox.php#/inbox/sender/<?=$mail['sender']?>" class="pull-left fa fa-envelope fa-fw">
                                            <!--<img alt="image" class="img-circle" src="img/inspinia/profile.jpg">!-->
                                        </a>
                                        <div role="view-message" onclick="javascript:window.location.href='mailbox.php#/view/<?=$mail['ID']?>'">
                                            <small class="pull-right"><?=timeAgo($mail['sent'])?></small>
                                            <strong><?=$mail['sender']?></strong><br /><?=$mail['subject']?> <br>
                                            <!--<small class="text-muted"><?=$mail['sent']?></small>!-->
                                        </div>
                                    </div>
                                </li>
                                <li class="divider"></li>

                                <?php } ?>

	                        <li>
	                            <div class="text-center link-block">
	                                <a href="mailbox.php">
	                                    <i class="fa fa-envelope"></i> <strong>Read All Messages</strong>
	                                </a>
	                            </div>
	                        </li>
	                    </ul>
	                </li>
	                <li class="dropdown">
	                    <a class="dropdown-toggle count-info" data-toggle="dropdown" href="#">
	                        <i class="fa fa-bell"></i>  <span class="label label-primary" content="unread-alerts"><?=$unreadAlerts?></span>
	                    </a>
	                    <ul class="dropdown-menu dropdown-alerts">
                            <?php $dir = DataBase::get('messages', array('ID', 'recipient', 'sender', 'recipient_dir', 'sender_dir', 'subject', 'sent', 'opened'), array('recipient' => User::getID(), 'recipient_dir' => 'alerts', 'opened' => 0));

                            foreach($dir as $i => $mail) {
                                $sender = User::getUserFromID($mail['sender']);
                                $mail['sender_ID'] = $mail['sender'];
                                $mail['sender'] = $sender['fullname'];

                                $recipient = User::getUserFromID($mail['recipient']);
                                $mail['recipient_ID'] = $mail['recipient'];
                                $mail['recipient'] = $recipient['fullname'];
	                        ?>
                            <li>
	                            <a href="mailbox.php#/view/<?=$mail['ID']?>">
	                                <div>
	                                    <i class="fa fa-envelope fa-fw"></i> <?=$mail['subject']?>
	                                    <span class="pull-right text-muted small"><?=timeAgo($mail['sent'])?></span>
	                                </div>
	                            </a>
	                        </li>
                            <li class="divider"></li>
                            <?php } ?>
                            <li>
                                <div class="text-center link-block">
                                    <a href="mailbox.php#/alerts">
                                        <strong>See All Alerts</strong>
                                        <i class="fa fa-angle-right"></i>
                                    </a>
                                </div>
                            </li>
	                    </ul>
	                </li>


	                <li>
	                    <a href="login.php?action=logout">
	                        <i class="fa fa-sign-out"></i> Log out
	                    </a>
	                </li>
	            </ul>

	        </nav>
	    </div>

	    <?php echo self::$_body; ?>
	</div>
	<?php } else { echo self::$_body; } ?>

	<?php for($i = 0; $i < count(self::$_js); $i++) {
		echo '    <script type="text/javascript" src="' . $base . self::$_js[$i] . '"></script>' . "\n";
	} ?>
</body>
</html>
