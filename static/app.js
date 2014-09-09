var NAME = '';

$(document).ready(function(){
	$('#game_header').height(window.innerHeight);
});

function getPage(link){
	var pageR = /\/wiki\/(.+)/gi;
	return pageR.exec(link)[1];
}

function register(){
	NAME = $('#name').val();
	socket.emit('new_user', {name: NAME});
	$('#name_box').hide();
}

function navigatePage(page){
	socket.emit('navigate', {name:NAME, page: page});
}

	socket.on('update', function(data){
		console.log(data);
	var items = [];

	$.each(data, function(key, val){
		items.push('<li><h3>'+val['name']+' - '+val['count']+'</h3><div class="pages"><ul class="list-group">');

		if(val['pages'].length>1)
			items.push('<li class="list-group-item active">'+val['pages'][val['pages'].length-1]+'</li>');
		
		for(var i = val['pages'].length-2; i> 0; i--)
			items.push('<li class="list-group-item">'+val['pages'][i]+'</li>');

		items.push('<li class="list-group-item btn-success">'+val['pages'][0]+'</li>');


		items.push('</ul></div></li>');

	});

	$('#others ul').html(items.join(''));
});		

socket.on('page', function(data){	
	$('#game_content').html(data);

	var links = $('#game_content a');

	for(var i=0; i<links.length; i++)
	{	
		var page = $(links[i]).attr('href');
		if(typeof page != 'undefined' && page.toString().indexOf('#') != 0)
		{
			$(links[i]).attr('onclick', "navigatePage('"+page+"');");
			$(links[i]).attr('href', '#');
		}
		
	}
});

socket.on('end', function(data){
	$('#end').html('Goal: <a href="http://en.wikipedia.org'+data+'" target="_blank">'+getPage(data)+'</a>');
});

socket.on('winner', function(data){
	alert(data.name+' has won in '+data.count+' moves!');
});

socket.on('new_page', function(data){
	if(NAME!=data.user)
		$.growl.notice({message: data.user+' has navigated to '+data.page});
});