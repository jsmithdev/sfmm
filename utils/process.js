import path from 'node:path';
import fs from 'fs/promises';

import {
	getInstallPath,
	checkFileExists,
} from './local.js';

import {
	printHelp,
} from './help.js';

const {
	version,
} = JSON.parse( await fs.readFile( new URL('../package.json', import.meta.url) ));

const [,, ...args]  = process.argv;

const cwd = process.cwd();

const [ action, author, repo ]	= args;

const flags = args.filter(a => a.startsWith('--') || a.startsWith('-'));

const ignore = !checkFlag(flags, '--all', 'a');
const gitIgnore = !checkFlag(flags, '--ignore', 'i');

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
	gitIgnore,
};

export async function processChecks(config){

	// check dev, version and help prior to any exits
	if(checkFlag(flags, '--dev', 'd')){
		process.env.NODE_ENV = 'development';
	}
	if(checkFlag(flags, '--version', 'v')){
		console.log(version);
	}
	if(checkFlag(flags, '--help', 'h')){
		await printHelp(version);
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
