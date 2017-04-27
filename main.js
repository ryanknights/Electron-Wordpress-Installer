const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path    = require('path');
const url     = require('url');
const http    = require('http');
const https   = require('https');
const fs      = require('fs');
const targz   = require('targz');

const fixPath = require('fix-path');
fixPath();

const shell = require('shelljs');

shell.config.execPath = shell.which('node').toString();

const childProcess = require('child_process');
let child = null;

let win;

function createWindow () 
{
	win = new BrowserWindow({width: 800, height: 600});

	win.loadURL(url.format(
	{
		pathname: path.join(__dirname, 'dist/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	win.on('closed', () =>
	{
		win = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', () =>
{
	app.quit();

	if (child !== null)
	{
		child.kill();
	}
});

app.on('activate', () =>
{
	if (win === null)
	{
		createWindow();
	}
});

ipcMain.on('installWordpress', (event, installationSettings) =>
{
	child = childProcess.fork('./child-install-wordpress.js', [], {
		stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
		cwd: __dirname
	});	

	child.send({command: 'begin', settings: installationSettings});

	// child.stderr.on('data', (data) =>
	// {
	// 	console.log(data.toString());
	// });

	// child.stdout.on('data', (data) =>
	// {
	// 	console.log(data.toString());
	// });	

	child.on('message', (message) =>
	{
		if (message === 'complete')
		{
			event.sender.send('installationComplete', true);
			child.kill();
		}
		else if (message === 'failed')
		{
			event.sender.send('installationComplete', false);
			child.kill();
		}
		else
		{
			event.sender.send('installationMessage', message);
		}
	});
});