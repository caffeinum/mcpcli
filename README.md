mcpcli
=================

CLI for any MCP server


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mcpcli.svg)](https://npmjs.org/package/mcpcli)
[![Downloads/week](https://img.shields.io/npm/dw/mcpcli.svg)](https://npmjs.org/package/mcpcli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mcpcli
$ mcpcli COMMAND
running command...
$ mcpcli (--version)
mcpcli/0.0.0 win32-x64 node-v20.18.0
$ mcpcli --help [COMMAND]
USAGE
  $ mcpcli COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mcpcli hello PERSON`](#mcpcli-hello-person)
* [`mcpcli hello world`](#mcpcli-hello-world)
* [`mcpcli help [COMMAND]`](#mcpcli-help-command)
* [`mcpcli plugins`](#mcpcli-plugins)
* [`mcpcli plugins add PLUGIN`](#mcpcli-plugins-add-plugin)
* [`mcpcli plugins:inspect PLUGIN...`](#mcpcli-pluginsinspect-plugin)
* [`mcpcli plugins install PLUGIN`](#mcpcli-plugins-install-plugin)
* [`mcpcli plugins link PATH`](#mcpcli-plugins-link-path)
* [`mcpcli plugins remove [PLUGIN]`](#mcpcli-plugins-remove-plugin)
* [`mcpcli plugins reset`](#mcpcli-plugins-reset)
* [`mcpcli plugins uninstall [PLUGIN]`](#mcpcli-plugins-uninstall-plugin)
* [`mcpcli plugins unlink [PLUGIN]`](#mcpcli-plugins-unlink-plugin)
* [`mcpcli plugins update`](#mcpcli-plugins-update)

## `mcpcli hello PERSON`

Say hello

```
USAGE
  $ mcpcli hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ mcpcli hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/makosst/mcpcli/blob/v0.0.0/src/commands/hello/index.ts)_

## `mcpcli hello world`

Say hello world

```
USAGE
  $ mcpcli hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ mcpcli hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/makosst/mcpcli/blob/v0.0.0/src/commands/hello/world.ts)_

## `mcpcli help [COMMAND]`

Display help for mcpcli.

```
USAGE
  $ mcpcli help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for mcpcli.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.32/src/commands/help.ts)_

## `mcpcli plugins`

List installed plugins.

```
USAGE
  $ mcpcli plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ mcpcli plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/index.ts)_

## `mcpcli plugins add PLUGIN`

Installs a plugin into mcpcli.

```
USAGE
  $ mcpcli plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into mcpcli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the MCPCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the MCPCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ mcpcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ mcpcli plugins add myplugin

  Install a plugin from a github url.

    $ mcpcli plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ mcpcli plugins add someuser/someplugin
```

## `mcpcli plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ mcpcli plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ mcpcli plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/inspect.ts)_

## `mcpcli plugins install PLUGIN`

Installs a plugin into mcpcli.

```
USAGE
  $ mcpcli plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into mcpcli.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the MCPCLI_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the MCPCLI_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ mcpcli plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ mcpcli plugins install myplugin

  Install a plugin from a github url.

    $ mcpcli plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ mcpcli plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/install.ts)_

## `mcpcli plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ mcpcli plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ mcpcli plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/link.ts)_

## `mcpcli plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ mcpcli plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mcpcli plugins unlink
  $ mcpcli plugins remove

EXAMPLES
  $ mcpcli plugins remove myplugin
```

## `mcpcli plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ mcpcli plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/reset.ts)_

## `mcpcli plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ mcpcli plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mcpcli plugins unlink
  $ mcpcli plugins remove

EXAMPLES
  $ mcpcli plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/uninstall.ts)_

## `mcpcli plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ mcpcli plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mcpcli plugins unlink
  $ mcpcli plugins remove

EXAMPLES
  $ mcpcli plugins unlink myplugin
```

## `mcpcli plugins update`

Update installed plugins.

```
USAGE
  $ mcpcli plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.46/src/commands/plugins/update.ts)_
<!-- commandsstop -->
# mcp
