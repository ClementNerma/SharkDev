
$(document).ready(function() {
    /* Inspinia rules */
    //$('.ui.dropdown').dropdown();
    $('.ibox a.close-link').click(function() {
    	$(this).parent().parent().parent().fadeOut(400, function() {
    		$(this).remove();
    	});
    });
    $('.ibox i.fa-chevron-up').click(function() {
    	$(this).parent().parent().parent().parent().find('.ibox-content:first')[$(this).hasClass('fa-chevron-up') ? 'slideUp' : 'slideDown'](400);
    	$(this).toggleClass('fa-chevron-up fa-chevron-down');
    });
    $('.i-checks').iCheck({
        checkboxClass: 'icheckbox_square-green',
        radioClass: 'iradio_square-green',
    });

    /* Inspinia UI rules */
    $('[widget="new-messages"]').click(function() {
        document.location.href = 'mailbox.php';
    });
});

/* Print */
function PrintDOM(DOM) { Popup($(DOM).html()); }

function Popup(data)  {
    var win = window.open('', '', 'height=400,width=600');
    win.document.write('<html><head><title></title>');
    /*optional stylesheet*/ //win.document.write('<link rel="stylesheet" href="main.css" type="text/css" />');
    win.document.write('</head><body >');
    win.document.write(data);
    win.document.write('</body></html>');

    win.document.close(); // necessary for IE >= 10
    win.focus(); // necessary for IE >= 10

    win.print();
    win.close();

    return true;
}
