const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path  = require('path');
const url   = require('url');
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const targz = require('targz');

const shell = require('shelljs');

shell.config.execPath = '/Users/ryanknights/.nvm/versions/node/v7.9.0/bin/node';

const fork = require('child_process').fork;
let child = null;

// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
// });

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
	if (process.platform !== 'darwin')
	{
		app.quit();
	}
});

app.on('activate', () =>
{
	if (win === null)
	{
		createWindow();
	}
});

ipcMain.on('installWordpress', (event, installationPath) =>
{
	child = fork('child-install-wordpress.js', ['--installationpath=' + installationPath], {
		stdio: ['pipe', 'pipe', 'pipe', 'ipc']
	});

	child.stdout.on('data', (data) => // Needs to be here to stop it crashing because of warnings & output of npm and grunt
	{
		//console.log(data.toString());
	});

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