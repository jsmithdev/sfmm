import path from 'node:path';
import fs from 'fs/promises';

import {
	getInstallPath,
	checkFileExists,
} from './local.js';

const {
	version,
} = JSON.parse(
	await fs.readFile(
	  new URL('../package.json', import.meta.url)
	)
);

const [,, ...args]  = process.argv;

const cwd = process.cwd();

const [ action, author, repo ]	= args;

const flags = args.filter(a => a.startsWith('--') || a.startsWith('-'));

const ignore = !checkFlag(flags, '--all', 'a');

const ignores = [
	'example',
	'demo',
	'eslintrc',
	'jsconfig',
];


export {
	flags,
	ignore,
	ignores,
};

export async function processChecks(config){

	if(checkFlag(flags, '--dev', 'd')){
		process.env.NODE_ENV = 'development';
	}
	if(checkFlag(flags, '--version', 'v')){
		console.log(version);
	}
	// check help prior to any exits
	if(checkFlag(flags, '--help', 'h')){
		help();
	}

	// exit on required args
	if((!author || !repo) && config.action === 'add'){
		console.log('Please provide an author and repo name.');
		process.exit(1);
	}
	// message about ignore flag
	if(!ignore){
		console.log('Not ignoring any files...')
	}
	// save flag for storing imports in a project config file
	if(checkFlag(flags, '--save', 's')){

		const configPath = path.join(cwd, '.sfmm.json');

		const hasConfig = await checkFileExists(configPath);
		
		// check if config file exists
		if(!hasConfig){
			console.log('Creating config file...');
			// if not create it
			await fs.writeFile(configPath, JSON.stringify({}));
		}

		// add author and repo to config file
		const config = await fs.readFile(configPath, 'utf8');

		const json = JSON.parse(config);

		json[`${author}/${repo}`] = {
			author,
			repo,
			mod: new Date().toISOString(),
		}

		console.log('Updating config file...');
		// save config file
		await fs.writeFile(configPath, JSON.stringify(json), 'utf-8');
	}
}

export async function getConfig(){

	const localBasePath = await getInstallPath();
	const gitBaseUrl = `https://github.com/${author}/${repo}/tree/main`;
	const gitRawBaseUrl = `https://raw.githubusercontent.com/${author}/${repo}/main`;
	const initUrl = `force-app/main/default`;

	if(!localBasePath){
		console.log('Please run this command from a valid sfdx project');
		process.exit(1);
	}

	return {
		localBasePath,
		gitBaseUrl,
		gitRawBaseUrl,
		initUrl,
		action,
		remote: 'github',
	}
}

export function checkFlag(flags, flag, shortFlag){
	return flags.includes(flag) || flags.some(x => x.includes(shortFlag))
}

function help(){
	console.log(`

sfmm - Salesforce Module Manager (v${version})

Usage: sfmm <action> <author> <repo> [flags]

Actions:
	
  add: Add modules from a remote sfdx project to your current sfdx project

	Usage: sfmm add <author> <repo> [flags]

	Flags:
	--all, -a	Include all files
	--dev, -d	Include dev dependencies
	--gh, -g	Use GitHub as remote (default)
	--help, -h	Show this help message
	--save, -s	Save to config file

	Examples:
	sfmm add jsmithdev modal # install modal component to current sfdx project's lwc directory
	sfmm add jsmithdev modal --save # install modal component to current sfdx project's lwc directory and save to config file
	sfmm add jsmithdev modal -gs # using short flags together
`)
}