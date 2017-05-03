"use strict"; 

const Horseman = require('node-horseman');
const jsonfile = require('jsonfile');
const horseman = new Horseman();

function crawlResults (url)
{	
	let results = [];
	let page    = 0;

	return new Promise((resolve, reject) =>
	{	
		function recursePages ()
		{	
			process.send({action: 'processing', message: 'Crawling links on page: ' + (page + 1)});

			let limit   = page * 10;
			let pageURL = url + '&start=' + limit;

			horseman
				.open(pageURL)
				.evaluate(function()
				{	
					var links = [];

					if ($('h3.r a').length)
					{
						$('h3.r a').each(function(index, a)
						{	
							var href = $(a).attr('href');
							href = href.substring(7); // Remove /url?q=
							href = href.substring(0, href.indexOf('&sa=U&ved'));

							links.push(unescape(href));
						});
					}

					return links;
				})
				.then((links) =>
				{
					if (links.length)
					{
						results = results.concat(links);
						page++;
						recursePages();
					}
					else
					{
						resolve(results);
					}
				});
		}

		recursePages();
	});
}

process.on('message', (message) =>
{
	if (message.command !== 'begin')
	{
		return;
	}

	const options =
	{
		directory: message.settings.directory,
		url: message.settings.url
	};

	crawlResults('http://www.google.co.uk/search?q=site:' + options.url)
		.then((results) =>
		{
			jsonfile.writeFileSync(options.directory + '/crawledlinks-' + options.url + '.json', {urls: results});
			process.send({action: 'complete', results: results});				

		}).catch((err) =>
		{
			process.send({action: 'failed', message: err});
		});
});