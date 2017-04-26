const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path  = require('path');
const url   = require('url');
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const targz = require('targz');

const shell = require('shelljs');

shell.config.execPath = '/Users/Ryan/.nvm/versions/node/v7.4.0/bin/node';

const fixPath = require('fix-path');
fixPath();

const wordpressThemeUrl  = 'https://tmsmedia-ryan@bitbucket.org/tmsmedia/tms-wordpress-starter-theme.git';
const wordpressPluginUrl = 'https://tmsmedia-ryan@bitbucket.org/tmsmedia/tms-wordpress-plugin.git';

let userOptions =
{
	shouldSetupDB: true,
	dbName: 'test',
	dbUser: 'root',
	dbPassword: 'password',
	themeFolderName: 'testtheme',
	themeDescription: 'test theme description',
	themeName: 'Test',
}

const installationPath = process.argv[2].replace('--installationpath=', '');

return new Promise((resolve, reject) =>
{
    let file = fs.createWriteStream(installationPath + '/latest.tar.gz');

    process.send('Downloading wordpress');

    const request = https.get(
    {
        host: 'wordpress.org',
        path: '/latest.tar.gz'

    }, (response) =>
    {
        response.pipe(file);

        file.on('finish', () => resolve(file));
        file.on('error', () => reject(err));
    });

}).then((file) =>
{
	process.send('Downloading complete');
	return file.path;

}).then((filePath) =>
{
	process.send('Unzipping...');
	return new Promise((resolve, reject) =>
	{
	    targz.decompress(
	    {
	        src: filePath,
	        dest: installationPath

	    }, (err) =>
	    {
	        if (err)
	        {
	            return reject(err);
	        }

	        resolve(filePath);
	    });
	});

}).then((filePath) =>
{	
	process.send('Unzipping complete');
	process.send('Removing latest.tar.gz');

	shell.rm('-rf', filePath);

	process.send('Moving files to public_html');

	shell.mv(installationPath + '/wordpress/', installationPath + '/public_html/');

	shell.cd(installationPath + '/public_html/');

	if (userOptions.shouldSetupDB)
	{	
		process.send('Setting up wp_config');
		shell.mv('wp-config-sample.php', 'wp-config.php');
		shell.sed('-i', 'database_name_here', userOptions.dbName, 'wp-config.php');
		shell.sed('-i', 'username_here', userOptions.dbUser, 'wp-config.php');
		shell.sed('-i', 'password_here', userOptions.dbPassword, 'wp-config.php');			
	}

	process.send('Removing default plugins');
	shell.cd('wp-content/plugins/');
	shell.rm('-f', 'hello.php');
	shell.rm('-rf', 'akismet');
	process.send('Downloading TMS Wordpress Plugin');
	shell.exec('git clone ' + wordpressPluginUrl);

	process.send('Removing default themes');
	shell.cd('../themes');
	shell.rm('-rf', '*/');
	process.send('Installing TMS Theme');
	shell.exec('git clone ' + wordpressThemeUrl + ' ' + userOptions.themeFolderName);
	shell.cd(userOptions.themeFolderName);
	shell.sed('-i', '<!-- themeName -->', userOptions.themeName, 'package.json');
	shell.sed('-i', '<!-- themeDescription -->', userOptions.themeDescription, 'package.json');
	process.send('Installing dependencies');
	shell.exec('npm install --silent');
	process.send('Running grunt setup');
	shell.exec('grunt setup');

	process.send('complete');

}).catch((err) =>
{
	process.send('failed');	
});