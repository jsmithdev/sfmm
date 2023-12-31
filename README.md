# sfmm - Salesforce Module Manager

## Install

with Nodejs installed, install sfmm globally:

```bash
npm i -g sfmm
```

For one offs, using in CI/CD workflows, etc you can use npx:

```bash
npx sfmm <action> <repo> [flags]
```

## Usage

You can use sfmm with a GitHub author and repo:

```bash
sfmm <action> <author> <repo> [flags]
```

You can also use a url:

```bash
sfmm <action> <url> [flags]
```

Flags:

```bash
    -h, --help : Print out help message
    -v, --version : Print out install version of sfmm
    -d, --dev  : Development mode (more logs)
```

## Actions

### add

Add modules from a remote sfdx project to your current sfdx project. 

Any dependency in the remote sfmm config file, if exists, will also be added.

Usage:

```bash
sfmm add <author> <repo> [flags]
```

or use a url:

```bash
sfmm add <url> [flags]
```

Flags:

```bash
    -s, --save   : Save to config file
    -i, --ignore : Append modules to .gitignore file
    -a, --all    : Include all files (typically not wanted)
```

Examples:

```bash
# install modal component to current sfdx project's lwc directory
sfmm add jsmithdev modal
```

```bash
# via url, install modal component to current sfdx project's lwc directory
sfmm add https://github.com/jsmithdev/extenda-modal
```

```bash
# install modal component to current sfdx project's lwc directory and save to config file
sfmm add jsmithdev modal --save 
```

```bash
# using short flags together
sfmm add jsmithdev modal -si
```

### remove

Remove module from your current sfdx project and sfmm config file

Usage:

```bash
sfmm remove <author> <repo>
```

or with a url:

```bash
sfmm remove <url>
```

Examples:

```bash
# remove modal component and from .sfmm config file
sfmm remove jsmithdev extenda-modal
```

```bash
# via url, remove modal component and from .sfmm config file
sfmm remove https://github.com/jsmithdev/extenda-modal
```

## Development

```bash
# clone sfmm
git clone https://github.com/jsmithdev/sfmm.git

# enter sfmm directory
cd sfmm

# install
npm i

# optionally, link to global npm modules
npm link 

# test run linked module
sfmm add jsmithdev modal -si

# test run without linking
node index.js add jsmithdev modal -si
```
