import open from 'open';


import {
	processChecks,
	getConfig,
} from './utils/process.js';

import {
	add,
	remove,
	noAction,
	unknownAction,
	openInBrowser,
	printReadme,
} from './utils/actions.js';


const config = await getConfig();

await processChecks(config);

if(config.action === 'add'){
    add(config);
}
else if(config.action === 'remove'){
    remove(config);
}
else if(config.action === 'open'){
	openInBrowser(config.gitBaseUrl);
}
else if(config.action === 'read'){
	printReadme(config.gitRawReadme);
}
else if(config.action?.includes('-')){
	// nothing to do
}
else if(config.action === undefined){
    noAction(config);
}
else {
    unknownAction(config.action);
}

//process.exit(0);