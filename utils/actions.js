import {
	downloadFiles,
} from './remote.js';

import {
	removeFiles,
} from './local.js';


export async function add(config){
	console.log('\nAdding to', config.localBasePath);

	await downloadFiles(config);
	
	console.log('Done!');
}

export async function remove(config){
	console.log('\nRemoving from', config.localBasePath);

	await removeFiles(config);
	
	console.log('Done!');
}

export async function noAction(config){
	console.warn('No action specified');
}

export async function unknownAction(config){
	console.log('Unknown action', config.action);
}