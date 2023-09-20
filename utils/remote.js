import {mkdir} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {pipeline} from 'node:stream';
import {promisify} from 'node:util'

import fetch from 'node-fetch';

import {
	ignore,
	ignores,
} from './process.js';

import {
	appendArrayToGitIgnore,
} from './local.js';


const streamPipeline = promisify(pipeline);
const toGitIgnore = [];

/**
 * Download files from a remote repo
 * @param {object} config
 * @returns {void}
 * */
export async function downloadFiles(config){

	const dirConfig = await getRemoteDirConfig(config);

	for(const key of Object.keys(dirConfig)){

		console.log(`Getting ${key} files`)
		const filePaths = dirConfig[key];
		for(const path of filePaths){
			
			console.log(`Getting ${path}`)
			await downloadFile(path, key, config)

			if(config.gitIgnore){
				const name = path.includes('lwc')
					? path.substring( path.lastIndexOf('/')+1, path.indexOf('.'))
					: path.substring( path.lastIndexOf('/')+1, path.length);
				if(!toGitIgnore.includes(name)){
					toGitIgnore.push(name);
				}
			}
		}
	}

	if(toGitIgnore.length > 0){
		
		console.log(`\nAdding ${toGitIgnore.length} ${toGitIgnore.length > 1 ? 'lines' : 'line'} to .gitignore`)
		await appendArrayToGitIgnore(toGitIgnore);
		toGitIgnore.length = 0;
	}

	const remoteConfigs = await getRemoteConfig( config.gitBaseUrl );

	if(!remoteConfigs) return;
	const numOfConfigs = Object.keys(remoteConfigs).length;
	console.log(`Adding ${numOfConfigs} ${numOfConfigs > 1 ? 'dependencies' : 'dependency'} from ${config.repoName}`)
	await processRemoteConfigs(config, remoteConfigs);
}

/**
 * Process remote config file(s) 
 * (runs recursively as downloadFiles calls this and this calls downloadFiles)
 * @param {object} config
 * @param {object} remoteConfigs
 * @returns {void}
 * */
async function processRemoteConfigs(config, remoteConfigs){
	
	const configs = Object.keys(remoteConfigs).map(key => {
		const remoteConfig = remoteConfigs[key];
		return Object.keys(config).reduce((acc, key) => {
			// merge dep author and repo over original config
			const value = `${config[key]}`
				.replace(config.repoName, remoteConfig.repo)
				.replace(config.authorName, remoteConfig.author)
			
			return {
				...acc,
				[key]: value,
			}
		}, {});
	});

	for(const config of configs){
		await downloadFiles(config);
	}
}

export async function downloadFile(remotePath, type, config){

	const localPath = `${config.initUrl}/${type}`;
	const moduleDir = remotePath.substring(localPath.length+1, remotePath.lastIndexOf('/'));

	const childLocalPath = remotePath.substring( remotePath.lastIndexOf('/')+1, remotePath.length);
	const localParentPath = `${config.localBasePath}/${type}`;
	const localModulePath = `${localParentPath}/${moduleDir}`;
	const localChildPath = `${localModulePath}/${childLocalPath}`;
	
	if(process.env.NODE_ENV === 'development'){
		console.log({
			localPath,
			childLocalPath,
			localParentPath,
			localChildPath,
			localModulePath,
			config,
		})
	}

	mkdir(localParentPath, { recursive: true });
	mkdir(localModulePath, { recursive: true });

	const url = `${config.gitRawBaseUrl}/${remotePath}`;

	const response = await fetch(url);

	if (!response.ok) throw new Error(`Unexpected response: ${response.statusText}`);

	return streamPipeline(response.body, createWriteStream(localChildPath));
}

export async function getRemoteDirs(url){

	const items = await getRemoteItems(url);

	const dirs = items
		.filter(i => i.contentType === 'directory')
		.map(i => i.path)

	if(ignore){
		return dirs.filter(f => !ignores.some(x => f.includes(x)));
	}

	return dirs;
}

export async function getRemoteItems(url){

	const response = await fetch(url);
	const text = await response.text();

	const { payload } = JSON.parse(text);
	const { tree } = payload;
	const { items } = tree;

	return items;
}

/**
 * Get url of the latest commit to an author's repo
 * @param {string} author
 * @param {string} repo
 * @returns {string} url
 * */
export async function getCommitUrl(author, repo){

	const response = await fetch(`https://api.github.com/repos/${author}/${repo}/commits/HEAD`);
	const json = await response.json();

	return json?.commit?.url;
}

/**
 * Get remote directory config
 * @param {object} input
 * @returns {object} config
 * */
export async function getRemoteDirConfig(input){

	const dirs = await getRemoteDirs(`${input.gitBaseUrl}/${input.initUrl}`);

	const config = {}

	for(const dir of dirs){
		const dirs = await getRemoteFilePaths(input.gitBaseUrl, dir);
		const name = dir.substring( dir.lastIndexOf('/')+1, dir.length);
		config[ name ] = dirs;
	}

	return config;
}

/**
 * Recursively get all file paths in a remote directory
 * @param {string} gitBaseUrl
 * @param {string} dir
 * @returns {string[]} file paths
 *  */
async function getRemoteFilePaths( gitBaseUrl, dir ){
	
	const url = `${gitBaseUrl}/${dir}`;

	const items = await getRemoteItems(url);

	let files = [];

	for(const item of items){

		if(ignore && ignores.some(x => item.path.includes(x))){
			continue;
		}
		if(item.contentType === 'file'){
			files = [...files, item.path];
		}
		if(item.contentType === 'directory'){
			const subFiles = await getRemoteFilePaths( gitBaseUrl, item.path );
			files = [...files, ...subFiles];
		}
	}

	return files.flat();
}

/**
 * Get remote sfmm config file
 * @param {string} url
 * @returns {object} config
 * */
async function getRemoteConfig(url){

	console.log('\nChecking remote config file...')

	const uri = url.replace('/tree', '/blob')

	const response = await fetch(`${uri}/.sfmm.json?raw=true`);

	try {
		const json = await response.json();
		return json;
	}
	catch(e){
		console.log('No remote config file found\n');
		return false;
	}
}