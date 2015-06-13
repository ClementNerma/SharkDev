
$('#login').click(function() {

    $('.has-error').removeClass('has-error');
    if(!$('#username').val()) $('#username').parent().addClass('has-error');
    if(!$('#password').val()) $('#password').parent().addClass('has-error');

    if(!$('#username').val() || !$('#password').val())
        return $('#error').text('All fields are required !').fadeIn(1000);

    var pass = $('#password').val();
    window.pass = pass;

    $.ajax({
        url: 'server/login.php',
        method: 'POST',
        data: {
            username: $('#username').val(),
            password: CryptoJS.PBKDF2(pass, pass, {iterations: 500}).toString()
        },
        timeout: 5000,
        success: function(response) {

            if(response !== 'sess_ok') {
                $('input').val('');
                return $('#error').text(response).fadeIn(1000);
            }

            window.location.href = 'studio.php';
        },
        error: function(err) {
            $('#error').text('Unable to contact server (' + err.statusCode + '). Please try again.').fadeIn(1000);
        }
    })

});