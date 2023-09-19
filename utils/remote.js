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

export async function downloadFiles(input){

	const dirs = await getRemoteDirs(`${input.gitBaseUrl}/${input.initUrl}`);

	const config = {}

	for(const dir of dirs){
		const dirs = await getRemoteFilePaths(dir, input.gitBaseUrl);
		const name = dir.substring( dir.lastIndexOf('/')+1, dir.length);
		config[ name ] = dirs;
	}

	for(const key of Object.keys(config)){

		console.log(`Getting ${key} files`)
		const filePaths = config[key];
		for(const path of filePaths){
			
			console.log(`Getting ${path}`)
			await downloadFile(path, key, input)

			if(input.gitIgnore){
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
		
		console.log(`Adding ${toGitIgnore.length} ${toGitIgnore.length > 1 ? 'lines' : 'line'} to .gitignore`)
		await appendArrayToGitIgnore(toGitIgnore);
		toGitIgnore.length = 0;
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

export async function getRemoteFilePaths(dir, gitBaseUrl){
	
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
			const subFiles = await getRemoteFilePaths(item.path, gitBaseUrl);
			files = [...files, ...subFiles];
		}
	}

	return files.flat();
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