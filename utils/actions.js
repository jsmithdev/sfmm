import open from 'open';

import {
    downloadFiles,
} from './remote.js';

import {
    removeFiles,
} from './local.js';


export async function add(config) {
    console.info('\nAdding to', config.localBasePath);

    await downloadFiles(config);

    console.info('Done!');
}

export async function remove(config) {
    console.info('\nRemoving from', config.localBasePath);

    await removeFiles(config);

    console.info('Done!');
}

export async function openInBrowser(url) {
    console.info('\nOpening in the default browser: ', url);

    try {
        await open(url);
    }
    catch(e){
        console.warn(e);
    }
}

export async function noAction(config) {
    console.warn('No action specified');
}

export async function unknownAction(config) {
    console.warn('Unknown action', config.action);
}