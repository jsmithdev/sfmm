import fs from 'fs/promises';
import {
	access,
	constants
} from 'node:fs';

const cwd = process.cwd();

export async function getInstallPath(){

	// read sfdx-project.json from cwd
	const json = await fs.readFile(`${cwd}/sfdx-project.json`, 'utf8');

	const { packageDirectories } = JSON.parse(json);

	const [ config ] = packageDirectories;

	config //?
	
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
