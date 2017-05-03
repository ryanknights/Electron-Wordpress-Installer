const childProcess = require('child_process');

module.exports = (children, event, settings) =>
{
	children.googleCrawler = childProcess.fork('../child-crawl-google.js', [], {
		stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
		cwd: __dirname
	});	

	children.googleCrawler.send({command: 'begin', settings: settings});

	children.googleCrawler.stderr.on('data', (data) =>
	{
		console.log(data.toString());
	});

	children.googleCrawler.stdout.on('data', (data) =>
	{
		console.log(data.toString());
	});

	children.googleCrawler.on('message', (data) =>
	{
		if (data.action === 'complete')
		{
			event.sender.send('crawlComplete', data.results);
			children.googleCrawler.kill();
		}
		else if (data.action === 'failed')
		{
			event.sender.send('crawlComplete', data.message);
			children.googleCrawler.kill();
		}
		else
		{
			event.sender.send('crawlMessage', data.message);
		}
	});
};