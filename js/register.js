
$.extend(
{
    redirectPost: function(location, args)
    {
        var form = '';
        $.each( args, function( key, value ) {
            form += '<input type="hidden" name="'+key+'" value="'+value+'">';
        });
        $('<form action="'+location+'" method="POST">'+form+'</form>').appendTo('body').submit();
    }
});

$('#submitButton').click(function() {    

    var e = ['name', 'password', 'password-confirm', 'email', 'email-confirm'];
    var post = {};

    for(var i = 0; i < e.length; i++) {
        if(!$('input[name="' + e[i] + '"]').val())
            return $('#error').text(e[i].ucfirst().replace('-confirm', ' confirmation') + ' is required !').show()
    
        post[e[i]] = $('input[name="' + e[i] + '"]').val();
    }

    if(post.password != post['password-confirm']) {
        return $('#error').text('The two passwords does not match !').show();
    }

    post.password = post['password-confirm'] = CryptoJS.PBKDF2(post.password, post.password, {iterations: 500}).toString();
    post['register-data'] = 'true';

    $.redirectPost('register.php', post);

});
