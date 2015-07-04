<?php

function sendMail($to, $from_user, $from_email, $subject = '(No subject)', $message = '') { 

    $from_user = "=?UTF-8?B?".base64_encode($from_user)."?=";
    $subject = "=?UTF-8?B?".base64_encode($subject)."?=";

    $headers = "From: $from_user <$from_email>\r\n". 
               "MIME-Version: 1.0" . "\r\n" . 
               "Content-type: text/html; charset=UTF-8" . "\r\n"; 

   return mail($to, $subject, $message, $headers); 
}
