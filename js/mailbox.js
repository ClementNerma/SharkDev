
function actionOnMails(action) {
	var queue = $('#mail-folder [role="select-mail"]:checked');
	var actions = {
		markAsRead: function($scope) {
			ask('markAsRead', {ID: $scope.mail.ID}, null, null, false, true);
			$scope.$apply(function() {
				$scope.mail.opened = true;	
			});
			refreshUnreadMessages();
		},

		markAsUnRead: function($scope) {
			ask('markAsUnRead', {ID: $scope.mail.ID}, null, null, false, true);
			$scope.$apply(function() {
				$scope.mail.opened = false;	
			});
			refreshUnreadMessages();
		},

		moveToTrash: function($scope) {
			ask('move', {ID: $scope.mail.ID, dir: 'trash'}, null, null, false, true);
		}
	};

	if(!actions[action])
		return ;

	queue.each(function(i) {
		actions[action](angular.element($(queue[i]).parent().parent()).scope());
	});
}

function refreshUnreadMessages() {
	if(currentFolder) {
		ask('unread', {folder: currentFolder}, function(ans) {
			scope({
				unreadCount: ans || 0
			});
		});
	}

	ask('unread', {folder:'inbox'}, function(ans) {
		scope({
			unread_inbox: ans
		});
		$('[content="unread-messages"]').text(ans);

		ask('unread', {folder: 'alerts'}, function(ans) {
			scope({
				unread_alerts: ans
			});
			$('[content="unread-alerts"]').text(ans);
		})
	});
}

function removeMail(ID) {
	ask('move', {ID: ID, dir: 'trash'}, function(ans) {
		if(ans == 'true')
			swal({
                title: "Email removed",
                text: "Email successfully sent to trash !",
                type: "success"
            });
		else
			swal("Server error", "Can\'t move to trash. Please try again.", "error")
	}, function() {

	});
}

function applyScope($scope, prop) {
	$scope.$apply(function() {
    	for(var i in prop)
    		if(prop.hasOwnProperty(i))
    			$scope[i] = prop[i];
    });
}

function scope(prop) {
	var appElement = document.querySelector('#mailbox');
    var $scope = angular.element(appElement).scope();
    applyScope($scope, prop);
}

function ask(action, data, success, error, post, sync) {
	data['do'] = action;
	return $.ajax({
		url: 'mailbox-i.php',
		method: (post ? 'POST' : 'GET'),
		async: !sync,
		data: data,
		success: success || function(){},
		error: error || function(){},
		timeout: 5000
	});
}

var currentFolder, lastInputValue;
var app = angular.module('mailbox', ['ngRoute']);

app.filter('unsafe', function($sce) {
	return $sce.trustAsHtml;
});

app.config(function($routeProvider) {
	$routeProvider
		.when('/compose', {templateUrl: 'mailbox/compose.html', controller: 'ComposeController'})
		.when('/compose/:prop/:propValue', {templateUrl: 'mailbox/compose.html', controller: 'ComposeController'})
		.when('/view/:id', {templateUrl: 'mailbox/view.html', controller: 'ViewController'})
		.when('/:folder', {templateUrl: 'mailbox/folder.html', controller: 'FolderController'})
		.when('/:folder/:filter/:filterValue', {templateUrl: 'mailbox/folder.html', controller: 'FolderController'})
		.otherwise({redirectTo: '/inbox'})
});

app.controller('ComposeController', function($rootScope, $routeParams) {

	lastInputValue = '';

	$('#compose').summernote({height: 215});

    var config = {
        '.chosen-select'           : {},
        '.chosen-select-deselect'  : {allow_single_deselect:true},
        '.chosen-select-no-single' : {disable_search_threshold:10},
        '.chosen-select-no-results': {no_results_text:'Oops, nothing found!'},
        '.chosen-select-width'     : {width:"95%"}
    };

    for (var selector in config) {
        $(selector).chosen(config[selector]);
    }

    $('#recipient .chosen-single span').text('');

	$('.chosen-search input').keyup(function() {
		if(this.value == lastInputValue)
			return ;

		if(this.value.length < 3) {
			$('#recipient-select, ul.chosen-results').empty();
			$('#recipient-select').trigger('choosen:updated');
			return ;
		}

		lastInputValue = this.value;

        $.ajax({
            url: 'mailbox-a.php',
            dataType: "json",
            method: 'GET',
            async: true,
            data: {
            	request: $('.chosen-search input').val()
            },
            beforeSend: function(){ $('ul.chosen-results, #recipient-select').empty(); },
            success: function(data) {
            	for(var i = 0; i < data.length; i++) {
            		$('#recipient-select').append('<option value="' + data[i].ID + '">' + data[i].fullname + '</option>');
            	}

            	var input = $('.chosen-search input');
            	//var searchChoice = $('.chosen-choices .search-choice').html() || '';*/
            	var val = input.val();
            	var w = input.css('width');
                $("#recipient-select").trigger("chosen:updated");
                input.val(val).css('width', w);
                /*console.log(searchChoice + input.parent().html());
                input.parent().parent().html(searchChoice + input.parent().parent().html());*/
            }
        });
	});

	$('[role="send-compose"]').click(function() {
		var recipient = $('#recipient .chosen-single span').text();
		var subject = $('#compose-subject').val();
		var compose = $('#compose').code();

		if(recipient === 'Select an Option' || !recipient) {
			return swal('Ooops !', 'Please complete TO field !', 'error');
		}

		if(!subject) {
			return swal('Ooops !', 'Please specify a subject !', 'error');
		}

		if(!compose.replace(/<(.*?)>/g, '')) {
			return swal('Ooops !', 'Please specify a message !', 'error');
		}

		ask('send', {
			recipient: recipient,
			subject: subject,
			content: compose
		}, function(data) {
			if(data == 'true') {
				swal('OK !', 'Your message has been sent !', 'success');
			} else {
				this.error();
			}
		}, function() {
			swal('Ooops !', 'An error was occured during sending ! Please check your informations and try again.', 'error');
		}, true);
	});

	$('[role="discard-compose"]').click(function() {
		swal({
            title: 'Are you sure ?',
            text: 'Your message will be lost and you will never be able to recover it !',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            closeOnConfirm: true,
            closeOnCancel: true
        }, function (isConfirm) {
            if (isConfirm) {
            	window.history.back();
            }
        });
	});

	$rootScope.loaded = true;

});

app.controller('FolderController', function($scope, $route, $routeParams) {

	$scope.reload = function() {
		$route.reload();
	};

	currentFolder = $routeParams.folder;

	ask('directory', {where: $routeParams.folder}, function(ans) {
		ans = JSON.parse(ans);

	    var unreadCount = 0;
	    angular.forEach(ans, function(mail) {
	        unreadCount += !parseInt(mail.opened);
	    });

		scope({
			filter: $routeParams.filter,
			filterValue: $routeParams.filterValue,
			path: $routeParams.folder,
			loaded: true,
			folder: ans,
			folderName: $routeParams.folder.substr(0, 1).toLocaleUpperCase() + $routeParams.folder.substr(1).toLocaleLowerCase(),
			unreadCount: unreadCount
		});

		$('.i-checks').iCheck({
	        checkboxClass: 'icheckbox_square-green',
	        radioClass: 'iradio_square-green',
	    });

		refreshUnreadMessages();
	});

	/*$('#mail-action').change(function() {
		var action = $(this).find(':selected').attr('action');
		actionOnMails(action);
	});*/

	$('[role="mark-mails-as-read"]').click(function() {
		actionOnMails('markAsRead');
	});

	$('[role="mark-mails-as-unread"]').click(function() {
		actionOnMails('markAsUnRead');
	});

	$('[role="move-mails-to-trash"]').click(function() {
		actionOnMails('moveToTrash');
	});
});

app.controller('ViewController', function($routeParams) {
	ask('open', {ID: $routeParams.id}, function(ans) {
		scope({
			loaded: true,
			mail: JSON.parse(ans)
		});
		refreshUnreadMessages();
	})
});

refreshUnreadMessages();
