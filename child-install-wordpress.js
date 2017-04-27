const path  = require('path');
const url   = require('url');
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const targz = require('targz');

const shell = require('shelljs');

shell.config.execPath = shell.which('node').toString();

const fixPath = require('fix-path');
fixPath();

const wordpressThemeUrl  = 'https://tmsmedia-ryan@bitbucket.org/tmsmedia/tms-wordpress-starter-theme.git';
const wordpressPluginUrl = 'https://tmsmedia-ryan@bitbucket.org/tmsmedia/tms-wordpress-plugin.git';

let userOptions =
{
	dbName: 'test',
	dbUser: 'root',
	dbPassword: 'root',
	themeFolderName: 'testtheme',
	themeDescription: 'test theme description',
	themeName: 'Test',
}

const installationPath = process.argv[2].replace('--installationpath=', '');

shell.cd(installationPath);

/*----------  Download  ----------*/
process.send('Downloading wordpress');
shell.exec('wp core download')
process.send('Downloading complete');

/*----------  Setup wp_config & install db  ----------*/
shell.exec(`wp core config --dbname=${userOptions.dbName} --dbuser=${userOptions.dbUser} --dbpass=${userOptions.dbPassword}`);
process.send('wp_config.php created');
shell.exec('wp db create');
process.send('Database created');

/*----------  Install  ----------*/
process.send('Installing wordpress');
shell.exec(`wp core install --url="http://localhost:8888" --title="siteName" --admin_user="tmsuser" --admin_password="password" --admin_email="ryan@tms-media.co.uk"`);
process.send('Install complete');

/*----------  Remove default plugins and themes  ----------*/
shell.rm('-rf', 'wp-content/plugins/*');
shell.rm('-rf', 'wp-content/themes/*');

/*----------  Install & Activate Starter Theme  ----------*/
const themeDir = 'wp-content/themes/' + userOptions.themeFolderName;
process.send('Installing starter theme');
shell.exec('git clone ' + wordpressThemeUrl + ' ' + themeDir);
process.send('Setting up theme dependencies and assets');
shell.cd(themeDir);
shell.sed('-i', '<!-- themeName -->', userOptions.themeName, 'package.json');
shell.sed('-i', '<!-- themeDescription -->', userOptions.themeDescription, 'package.json');
process.send('Installing dependencies');
shell.exec('npm install --silent');
process.send('Running grunt setup');
shell.exec('grunt setup');
shell.cd('../../../');
shell.exec(`wp theme activate ${userOptions.themeFolderName}`);
process.send('Starter theme activated');

/*----------  Install & Activate Starter Plugin  ----------*/
process.send('Installing starter plugin');
shell.exec('git clone ' + wordpressPluginUrl + ' wp-content/plugins/tms-wordpress-plugin');
shell.exec('wp plugin activate tms-wordpress-plugin');
process.send('Starter plugin activated');

/*----------  Install & activate third party plugins  ----------*/
process.send('Installing regenerate thumbnails plugin');
shell.exec('wp plugin install regenerate-thumbnails --activate');

process.send('Installing update urls plugin');
shell.exec('wp plugin install velvet-blues-update-urls --activate');

process.send('Installing ACF Pro plugin');
shell.exec('wp plugin install http://tms-media.co.uk/plugins/advanced-custom-fields-pro.zip --activate');

/*----------  Rewrite URL's  ----------*/
process.send('Setting up permalinks');
shell.exec("wp rewrite structure '/%postname%/' --hard");
shell.exec('wp rewrite flush --hard');

/*----------  Setup some default options  ----------*/
process.send('Setting up default options');
shell.exec('wp option update blog_public 0');

/*----------  Create default navigation  ----------*/
process.send('Setting up default navigation');
shell.exec('wp menu create "Header Navigation"');
shell.exec('wp menu location assign "Header Navigation" header-navigation');

/*----------  Complete  ----------*/
process.send('complete');