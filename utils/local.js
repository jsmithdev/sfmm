import path from 'node:path';
import fs from 'fs/promises';
import {
	access,
	constants
} from 'node:fs';
import {
	getRemoteDirs,
	getRemoteFilePaths,
} from './remote.js';

const cwd = process.cwd();

export async function getInstallPath(){

	// read sfdx-project.json from cwd
	const json = await fs.readFile(`${cwd}/sfdx-project.json`, 'utf8');

	const { packageDirectories } = JSON.parse(json);

	const [ config ] = packageDirectories;
	
	if(config.path === 'force-app' && config.default === true){
		return `${cwd}/${config.path}/main/default`;
	}
	else {
		return `${cwd}/${config.path}`;
	}
}

export function checkFileExists(path) {
	return new Promise(res => access(path, constants.F_OK, e => e ? res(false) : res(true)));
}

export async function appendArrayToGitIgnore(names){

	const text = names.map(name => `\n${name}`).join('');

	await fs.appendFile( 
		path.join(cwd, '.gitignore'),
		text,
		'utf8',
	);
}

export async function removeFiles(input){

	const dirs = await getRemoteDirs(`${input.gitBaseUrl}/${input.initUrl}`);

	const config = {}

	for(const dir of dirs){
		const dirs = await getRemoteFilePaths(dir, input.gitBaseUrl);
		const name = dir.substring( dir.lastIndexOf('/')+1, dir.length);
		config[ name ] = dirs;
	}

	const lwcDirs = [];


	for(const key of Object.keys(config)){

		if(key === 'lwc'){
			const filePaths = config[key];
			for(const path of filePaths){
				const name = path.substring( path.lastIndexOf('/')+1, path.indexOf('.'));
				if(!lwcDirs.includes(name)){
					lwcDirs.push(name);
				}
			}
			continue;
		}

		const filePaths = config[key];
		for(const path of filePaths){
			console.log(`Removing ${path}`)
			await fs.rm(`${cwd}/${path}`, { recursive: true, force: true });
		}
	}

	for(const dir of lwcDirs){
		console.log(`Removing lwc ${dir}...`)
		await fs.rm(`${cwd}/force-app/main/default/lwc/${dir}`, { recursive: true, force: true });
	}

	await removeFromConfigFile({
		configPath: path.join(cwd, '.sfmm.json'),
		author: input.authorName,
		repo: input.repoName,
	});
}

export async function addToConfigFile({
	configPath,
	author,
	repo,
}){

	const config = await fs.readFile(configPath, 'utf8');

	const json = JSON.parse(config);

	json[`${author}/${repo}`] = {
		author,
		repo,
		mod: new Date().toISOString(),
	}

	console.log('Updating config file...');
	// save config file
	await fs.writeFile(configPath, JSON.stringify(json, null, '\t'), 'utf-8');
}

export async function removeFromConfigFile({
	configPath,
	author,
	repo,
}){

	const config = await fs.readFile(configPath, 'utf8');

	const json = JSON.parse(config);

	delete json[`${author}/${repo}`];

	console.log('Updating config file...');
	// save config file
	await fs.writeFile(configPath, JSON.stringify(json, null, '\t'), 'utf-8', );
}