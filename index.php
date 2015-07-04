<?php require 'framework/inc.php'; Page::setTitle('Home'); ?>

<div class="row">
    <div class="col-lg-3">
        <div class="widget style1 lazur-bg">
            <div class="row">
                <div class="col-xs-4">
                    <i class="fa fa-envelope-o fa-5x"></i>
                </div>
                <div class="col-xs-8 text-right" widget="new-messages">
                    <span> New messages </span>
                    <h2 class="font-bold"><?php echo DataBase::query('SELECT COUNT(*) FROM messages WHERE opened = 0 AND recipient = ' . User::getID())->fetch()[0]; ?></h2>
                </div>
            </div>
        </div>
    </div>    
    <!--<div class="col-lg-3">
        <div class="ibox float-e-margins">
            <div class="ibox-title">
                <span class="label label-success pull-right">Monthly</span>
                <h5>Income</h5>
            </div>
            <div class="ibox-content">
                <h1 class="no-margins">40 886,200</h1>
                <div class="stat-percent font-bold text-success">98% <i class="fa fa-bolt"></i></div>
                <small>Total income</small>
            </div>
        </div>
    </div>!-->
</div>

<!--<div class="col-lg-6">
    <div class="ibox float-e-margins">
        <div class="ibox-title">
            <h5>Read below comments and tweets</h5>
            <div class="ibox-tools">
                <a class="collapse-link binded">
                    <i class="fa fa-chevron-up"></i>
                </a>
                <a class="close-link binded">
                    <i class="fa fa-times"></i>
                </a>
            </div>
        </div>
        <div class="ibox-content no-padding">
            <ul class="list-group">
                <li class="list-group-item">
                    <p><a class="text-info" href="#">@Alan Marry</a> I belive that. Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                    <small class="block text-muted"><i class="fa fa-clock-o"></i> 1 minuts ago</small>
                </li>
                <li class="list-group-item">
                    <p><a class="text-info" href="#">@Stock Man</a> Check this stock chart. This price is crazy! </p>
                    <small class="block text-muted"><i class="fa fa-clock-o"></i> 2 hours ago</small>
                </li>
                <li class="list-group-item">
                    <p><a class="text-info" href="#">@Kevin Smith</a> Lorem ipsum unknown printer took a galley </p>
                    <small class="block text-muted"><i class="fa fa-clock-o"></i> 2 minuts ago</small>
                </li>
                <li class="list-group-item ">
                    <p><a class="text-info" href="#">@Jonathan Febrick</a> The standard chunk of Lorem Ipsum</p>
                    <small class="block text-muted"><i class="fa fa-clock-o"></i> 1 hour ago</small>
                </li>
            </ul>
        </div>
    </div>
</div>!-->

<?php Page::send(); ?>