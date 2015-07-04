<?php $allowGuest = $install = $ignoreDataBase = true; require '../framework/inc.php'; Page::setTitle('Install Wizard'); $hideDefaultView = true; ?>

<?php

$base = $_SERVER['PHP_SELF'];
$base = substr($base, 0, strlen($base) - strlen('/install/index.php')) . '/';

Config::write('BASE', $base);

Page::css('inspinia/plugins/iCheck/custom');
Page::css('inspinia/plugins/steps/jquery.steps');

Page::js('inspinia/plugins/steps/jquery.steps.min');
Page::js('inspinia/plugins/validate/jquery.validate.min');
Page::js('../install/wizard');

?>

<div class="ibox-content">
<h2>
    Skyer configuration
</h2>
<p>
    This wizard will help you to configure Skyer
</p>

<form id="form" action="form-submit.php" method="POST" class="wizard-big">
    <h1>DataBase</h1>
    <fieldset>
        <h2>DataBase Settings</h2>
        <div class="row">
            <div class="col-lg-6">
                <div class="form-group">
                    <label>Host *</label>
                    <input id="db-host" name="db-host" type="text" class="form-control required" value="localhost">
                </div>
                <div class="form-group">
                    <label>User name *</label>
                    <input id="db-user" name="db-user" type="text" class="form-control required" value="root">
                </div>
            </div>
            <div class="col-lg-6">
                <div class="form-group">
                    <label>User password *</label>
                    <input id="db-password" name="db-password" type="password" class="form-control" value="">
                </div>
                <div class="form-group">
                    <label>DataBase name *</label>
                    <input id="db-database" name="db-database" type="text" class="form-control" value="skyer">
                </div>
            </div>
            <div class="col-lg-6">
                <div class="form-group">
                    <label>DataBase charset *</label>
                    <input id="db-charset" name="db-charset" type="text" class="form-control" value="utf8">
                </div>
            </div>
            <div class="col-lg-4">
                <div class="text-center">
                    <div style="margin-top: 20px">
                        <i class="fa fa-sign-in" style="font-size: 180px;color: #e5e5e5 "></i>
                    </div>
                </div>
            </div>
        </div>
    </fieldset>
    <h1>Site</h1>
    <fieldset>
        <h2>Site Informations</h2>
        <div class="row">
            <div class="col-lg-8">
                <div class="form-group">
                    <label>Site title *</label>
                    <input id="site-title" name="site-title" type="text" class="form-control required" value="Skyer">
                </div>
                <div class="form-group">
                    <label>Default page title *</label>
                    <input id="site-page-title" name="site-page-title" type="text" class="form-control required" value="Untitled">
                </div>
            </div>
            <div class="col-lg-4">
                <div class="text-center">
                    <div style="margin-top: 20px">
                        <i class="fa fa-sign-in" style="font-size: 180px;color: #e5e5e5 "></i>
                    </div>
                </div>
            </div>
        </div>
    </fieldset>
</form>

<?php Page::send(); ?>