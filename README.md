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

> All actions can be used with \<url> or \<author> \<repo>

| Action | Description | Usage | Flags |
| ------ | ----------- | ----- | ----- |
| add | Add modules from a remote sfdx project to your current sfdx project | `sfmm add <url> [flags]` | `-s, --save : Save to config file` <br> `-i, --ignore : Append modules to .gitignore file` <br> `-a, --all : Include all files (typically not wanted)` |
| remove | Remove module from your current sfdx project and sfmm config file | `sfmm remove <url>` | (N/A) |
| open | Open the project in your default browser | `sfmm open <url>` | (N/A) |
| read | Print the project's README.md to the console | `sfmm read <url>` | (N/A) |

## Examples

```bash
# install component to current sfdx project's lwc directory
sfmm add jsmithdev extenda-modal
```

```bash
# via url, install modal component to current sfdx project's lwc directory
sfmm add https://github.com/jsmithdev/extenda-modal
```

```bash
# install modal component to current sfdx project's lwc directory and save to config file
sfmm add jsmithdev extenda-modal --save 
```

```bash
# using short flags together
sfmm add jsmithdev extenda-modal -si
```

```bash
# remove modal component and from .sfmm config file
sfmm remove jsmithdev extenda-modal
```

```bash
# via url, remove modal component and from .sfmm config file
sfmm remove https://github.com/jsmithdev/extenda-modal
```

```bash
sfmm open <author> <repo>
```

```bash
sfmm read <author> <repo>
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
