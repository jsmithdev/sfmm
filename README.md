# sfmm - Salesforce Module Manager

## Install and Usage

with Nodejs installed, install sfmm globally:

```bash
npm i -g sfmm
```

Usage:

```bash
sfmm <action> <author> <repo> [flags]
```

For one offs, using in CI/CD workflows, etc you can use npx:

```bash
npx sfmm <action> <repo> [flags]
```

## Actions

### add

Add modules from a remote sfdx project to your current sfdx project

Usage:

```bash
sfmm add <author> <repo> [flags]`
```

Flags:

```bash
    -a, --all  : Include all files
    -d, --dev  : Include dev dependencies
    -g, --gh   : Use GitHub as remote (default)
    -h, --help : Show this help message
    -s, --save : Save to config file
```

Examples:

```bash
# install modal component to current sfdx project's lwc directory
sfmm add jsmithdev modal
```

```bash
# install modal component to current sfdx project's lwc directory and save to config file
sfmm add jsmithdev modal --save 
```

```bash
# using short flags together
sfmm add jsmithdev modal -gs
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
sfmm add jsmithdev modal -gd

# test run without linking
node index.js add jsmithdev modal -gd
```
