import path from 'node:path';
import fs from 'fs/promises';

export async function getReadmeData(){

    const readme = await fs.readFile( new URL(path.join('..', 'README.md'), import.meta.url) );
    const test = readme.toString()
    
    const regex = /(?<=Actions)(.*)(?=## Development)/gs
    const match = test.match(regex)
    const [data] = match;
    //const text = data.replaceAll(/<[^>]*>/g, "")

    const clean = data
        .replace(/```bash/g, '')
        .replace(/```/g, '')
        .replace(/\n\n/g, '\n')
    
    return clean || '';
}


export async function printHelp(version){
	console.log(`

sfmm - Salesforce Module Manager (v${version})

Usage: sfmm <action> <author> <repo> [flags]

Actions:
${await getReadmeData()}
`)
}