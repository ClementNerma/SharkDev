<?php

$shark = array(
    'db' => array(
        'host' => 'localhost',
        'db'   => 'sharkdev',
        'user' => 'root',
        'pass' => 'root',
        'encoding' => 'utf8'
    ),

    'msg' => array(
        'server-error'      => 'internal server error'     ,
        'config-error'      => 'config.php error'          ,
        'bad-request'       => 'Bad request'               ,
        'too-large-request' => 'Too large request'         ,
        'bad-path'          => 'Bad path'                  ,
        'bad-API-key'       => 'Bad API key'               ,
        'bad-action'        => 'Bad action'                ,
        'database'          => 'Can\'t connect to DataBase',
        'not-found'         => 'Not found'                 ,
        'API-done'          => 'API:done'                  ,
        'API-error'         => 'API:error'                 ,
        'no-output'         => '--- no output ---'
    ),

    'sys' => array(
        'robot' => 'SharkDev'
    ),

    'users' => array(
        'allow-register' => true
    ),

    'security' => array(
        'login-attempts' => array(
            'enabled' => true,
            'allow' => 10,
            'delay' => 30
        )
    )
);

?>