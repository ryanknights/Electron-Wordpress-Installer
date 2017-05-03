const childProcess = require('child_process');

module.exports = (children, event, installationSettings) =>
{
	children.installWordpress = childProcess.fork('../child-install-wordpress.js', [], {
		stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
		cwd: __dirname
	});	

	children.installWordpress.send({command: 'begin', settings: installationSettings});

	children.installWordpress.stderr.on('data', (data) =>
	{
		console.log(data.toString());
	});

	children.installWordpress.stdout.on('data', (data) =>
	{
		console.log(data.toString());
	});

	children.installWordpress.on('message', (message) =>
	{
		if (message === 'complete')
		{
			event.sender.send('installationComplete', true);
			children.installWordpress.kill();
		}
		else if (message === 'failed')
		{
			event.sender.send('installationComplete', false);
			children.installWordpress.kill();
		}
		else
		{
			event.sender.send('installationMessage', message);
		}
	});
};