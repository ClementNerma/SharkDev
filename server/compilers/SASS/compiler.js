
var content = Shark.fs.readFile(IO.input);

if(!content)
	return IO.error('Can\'t read file');

if(!IO.read('SASS')) {
	var sass = IO.getSync('sass.js');

	if(!sass)
		return IO.error('Can\'t load sass compiler');

	IO.set('SASS', new Sass());
}

sass.compile(content, function(result) {

	if(!Shark.fs.writeFile(IO.output, result.text))
		return IO.error('Can\'t write compiled content');
	else
		return IO.success();

});
