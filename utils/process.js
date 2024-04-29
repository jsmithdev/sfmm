import path from 'node:path';
import fs from 'fs/promises';

import {
	getInstallPath,
	checkFileExists,
	addToConfigFile,
} from './local.js';

import {
	printHelp,
} from './help.js';

const {
	version,
} = JSON.parse( await fs.readFile( new URL('../package.json', import.meta.url) ));

const [,, ...args]  = process.argv;

const cwd = process.cwd();

const [ action, init_author, init_repo ]	= args;

const isNotUrl = !init_author?.includes('http');
const author = isNotUrl ? init_author : getAuthorFromUrl(init_author);
const repo = isNotUrl ? init_repo : getRepoFromUrl(init_author);

const flags = args.filter(a => a.startsWith('--') || a.startsWith('-'));

const ignore = !checkFlag(flags, '--all', 'a');
const gitIgnore = checkFlag(flags, '--ignore', 'i');

const ignores = [
	'example',
	'demo',
	'eslintrc',
	'jsconfig',
	'jsconfig.json',
];


export {
	flags,
	ignore,
	ignores,
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

	config.gitIgnore = gitIgnore;

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

		const configPath = path.join(cwd, '.sfmm');

		const hasConfig = await checkFileExists(configPath);
		
		// check if config file exists
		if(!hasConfig){
			console.log('Creating config file...');
			// if not create it
			await fs.writeFile(configPath, JSON.stringify({}));
		}

		// add author and repo to config file
		addToConfigFile({
			configPath,
			author,
			repo,
		})
	}
}

export async function getConfig(){

	try {
		const localBasePath = await getInstallPath();
		const gitBaseUrl = `https://github.com/${author}/${repo}/tree/main`;
		const gitRawBaseUrl = `https://raw.githubusercontent.com/${author}/${repo}/main`;
		const gitRawReadme = `${gitRawBaseUrl}/README.md?raw=true`;
		const initUrl = `force-app/main/default`;
		//const apiBaseUrl = `https://api.github.com/repos/${author}/${repo}/git/trees/main?recursive=1`;
		const apiBaseUrl = `https://api.github.com/repos/${author}/${repo}/contents/`;
		
		https://raw.githubusercontent.com/jsmithdev/extenda-modal/main
		if(!localBasePath){
			console.log('Please run this command from a valid sfdx project');
			process.exit(1);
		}

		return {
			action,
			initUrl,
			localBasePath,
			gitBaseUrl,
			gitRawBaseUrl,
			gitRawReadme,
			repoName: repo,
			remote: 'github',
			authorName: author,
			get contentsUrl(){
				return `${apiBaseUrl}${this.initUrl}?ref=main`;
			},
			getContentsUrl: function(path){
				return `${apiBaseUrl}${path}?ref=main`;
			},
		}
	}
	catch(e){
		console.log('Please run this command from a valid sfdx project');
		//console.log(e);
		process.exit(1);
	}
}

export function checkFlag(flags, flag, shortFlag){
	return flags.includes(flag) || flags.some(x => x.includes(shortFlag))
}

function getAuthorFromUrl(s){
	return s.substring(s.lastIndexOf('com/')+4, s.lastIndexOf('/'));
}

function getRepoFromUrl(s){
	return s.substring(s.lastIndexOf('/') + 1);
}