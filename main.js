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

let children = 
{
	installWordpress: null,
};

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

	for (let child in children)
	{
		if (children[child] !== null)
		{
			children[child].kill();
			children[child].installWordpress = null;
		}
	}
});

app.on('activate', () =>
{
	if (win === null)
	{
		createWindow();
	}
});

ipcMain.on('installWordpress', require('./commands/installWordpress').bind(this, children));