import {
	processChecks,
	getConfig,
} from './utils/process.js';

import {
	downloadFiles,
} from './utils/remote.js';

import {
	removeFiles,
} from './utils/local.js';


const config = await getConfig();

await processChecks(config);

if(config.action === 'add'){

	console.log('\nAdding to', config.localBasePath);

	await downloadFiles(config);
	
	console.log('Done!');
}
else if(config.action === 'remove'){

	console.log('\nRemoving from', config.localBasePath);

	await removeFiles(config);
	
	console.log('Done!');
}
else if(config.action?.includes('-')){
	// nothing to do
}
else if(config.action === undefined){
	console.warn('No action specified');
}
else {
	console.log('Unknown action', config.action);
}

process.exit(0);