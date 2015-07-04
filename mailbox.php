<?php

require('framework/inc.php');

Page::setTitle('Mailbox');

Page::css('inspinia/plugins/summernote/summernote');
Page::css('inspinia/plugins/summernote/summernote-bs3');
Page::css('inspinia/plugins/chosen/chosen');

Page::js('inspinia/angular.min');
Page::js('inspinia/angular-route.min');
Page::js('inspinia/plugins/summernote/summernote.min');
Page::js('inspinia/plugins/chosen/chosen.jquery');
Page::js('inspinia/jquery-ui-1.10.4.min');
Page::js('mailbox');

?>

<br />
<div id="mailbox" ng-app="mailbox">
	<div class="sk-spinner sk-spinner-three-bounce" ng-hide="loaded">
        <div class="sk-bounce1"></div>
        <div class="sk-bounce2"></div>
        <div class="sk-bounce3"></div>
    </div>

    <div class="col-lg-3">
        <div class="ibox float-e-margins">
            <div class="ibox-content mailbox-content">
                <div class="file-manager">
                    <a class="btn btn-block btn-primary compose-mail" href="#/compose"><i class="fa fa-paper-plane-o"></i> Compose Mail</a>
                    <div class="space-25"></div>
                    <h5>Folders</h5>
                    <ul class="folder-list m-b-md" style="padding: 0">
                        <li><a href="#/compose"> <i class="fa fa-paper-plane-o"></i> Compose</a></li>
                        <li><a href="#/inbox"> <i class="fa fa-inbox "></i> Inbox <span class="label label-warning pull-right">{{unread_inbox}}</span> </a></li>
                        <li><a href="#/alerts"> <i class="fa fa-bell "></i> Alerts <span class="label label-primary pull-right">{{unread_alerts}}</span> </a></li>
                        <li><a href="#/sent"> <i class="fa fa-envelope-o"></i> Sent</a></li>
                        <!--<li><a href="#/important"> <i class="fa fa-certificate"></i> Important</a></li>
                        <li><a href="#/drafts"> <i class="fa fa-file-text-o"></i> Drafts <span class="label label-danger pull-right">2</span></a></li>!-->
                        <li><a href="#/trash"> <i class="fa fa-trash-o"></i> Trash</a></li>
                    </ul>
                    <div class="clearfix"></div>
                </div>
            </div>
        </div>
    </div>
    <div id="view" ng-view class="col-lg-9"></div>
</div>

<?php Page::send(); ?>
