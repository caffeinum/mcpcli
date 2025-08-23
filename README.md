# mcpcli

A CLI tool for interacting with any [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server

## Installation

```bash
npm install -g mcpcli
```

## Usage

The `mcp` command allows you to start any MCP server and interact with its tools.

### Basic Syntax

```bash
mcpcli <package-name> [tool-name] [tool-args...]
```

### Examples

**List available tools from a server:**
```bash
mcpcli @modelcontextprotocol/server-filesystem
```

**Call a specific tool:**
```bash
mcpcli @modelcontextprotocol/server-filesystem list_directory /path/to/directory
```

**Pass server arguments:**
```bash
mcpcli @modelcontextprotocol/server-filesystem -a /allowed/directory list_directory /allowed/directory
```

**Start interactive mode:**
```bash
mcpcli @modelcontextprotocol/server-filesystem --interactive
```

## Command Options

### Flags

- `-v, --version=<value>` - Exact version or "latest" for the MCP server package
- `-a, --args=<value>` - Arguments to pass to the server binary (multiple allowed)
- `-e, --env=<value>` - Extra environment variables (KEY=VALUE format, multiple allowed)
- `--client-name=<value>` - Identify your app to the server
- `--client-version=<value>` - Client version to report to the server
- `-i, --interactive` - Start interactive tool runner mode

### Arguments

- `package` - **Required.** MCP server package name (e.g., `@modelcontextprotocol/server-filesystem`)
- `tool` - **Optional.** Tool name to call immediately
- `toolArgs` - **Optional.** Arguments to pass to the specified tool

## Interactive Mode

When using `--interactive` flag, you'll enter an interactive session where you can:

- `list` - Show all available tools from the server
- `call <tool_name>` - Call a specific tool
- `help` - Show available commands
- `exit` - Exit interactive mode

## Examples

### File System Server

```bash
# List directory contents
mcpcli @modelcontextprotocol/server-filesystem -a / list_directory /

# Read a file
mcpcli @modelcontextprotocol/server-filesystem -a / read_file /path/to/file.txt

# Interactive mode
mcpcli @modelcontextprotocol/server-filesystem -a / --interactive
```

### With Environment Variables

```bash
# Pass environment variables to the server
mcpcli @modelcontextprotocol/server-filesystem -e DEBUG=1 -a / list_directory /
```

### With Specific Version

```bash
# Use a specific version of the server
mcpcli @modelcontextprotocol/server-filesystem --version 0.1.0 -a / list_directory /
```