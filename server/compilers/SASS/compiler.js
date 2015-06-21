
var content = Shark.fs.readFile(IO.input);

if(!isDefined(content))
	return IO.error('Can\'t read file');

if(!content)
	return ;

if(!isset('Sass')) {
	window.eval(IO.read('sass.js'));
	Sass.setWorkerUrl('http://localhost/SharkDev/server/compilers/SASS/sass.worker.js');
}

var sass = new Sass();

sass.options({

	style: Sass.style[IO.parameters.style] || Sass.style.nested,
	indentedSyntax: IO.inputExt === 'sass'

}, function() {

	sass.compile(content, function(result) {

		if(result.status) {
			return IO.error('During compilation : ' + result.message);
		}

		if(!Shark.fs.writeFile(IO.output, result.text))
			return IO.error('Can\'t write compiled content');
		else
			return IO.success();

	});

});

