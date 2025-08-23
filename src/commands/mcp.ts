import {Args, Command, Flags} from '@oclif/core'
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import * as readline from 'readline';

export type NpmServerOptions = {
  /** e.g. "@modelcontextprotocol/server-filesystem" */
  pkg: string;
  /** exact version or "latest"; optional */
  version?: string;
  /** args passed to the server binary (e.g., allowed directories) */
  args?: string[];
  /** extra env vars for the child process */
  env?: Record<string, string>;
  /** identify your app */
  clientName?: string;
  clientVersion?: string;
};

function isPathish(token: string): boolean {
  // Windows: C:\..., C:/..., \\server\share
  if (/^[A-Za-z]:[\\/]/.test(token)) return true;
  if (/^\\\\/.test(token)) return true;

  // POSIX-ish: /..., ./..., ../..., ~/...
  if (/^(\/|\.{1,2}[\\/]|~[\\/])/.test(token)) return true;

  // Also accept quoted-looking tokens as pathish (already one argv token)
  if (/^["'].*["']$/.test(token)) return true;

  return false;
}

/**
 * Split a possibly-greedy -a/--args list into:
 *   - serverArgs (to pass to the MCP server)
 *   - tool (if found)
 *   - toolArgs
 *
 * Heuristic: collect pathish tokens and option-looking tokens (start with '-')
 * until we hit the first non-pathish, non-flag token → that's the tool name.
 */
function splitServerArgsAndTool(
  flagArgs: string[] = [],
  explicitTool?: string,
  explicitToolArgs: string[] = []
): { serverArgs: string[]; tool?: string; toolArgs: string[] } {
  // If the user already supplied a positional tool, trust it.
  if (explicitTool) {
    return { serverArgs: flagArgs, tool: explicitTool, toolArgs: explicitToolArgs ?? [] };
  }

  const serverArgs: string[] = [];
  let i = 0;

  for (; i < flagArgs.length; i++) {
    const t = flagArgs[i];
    // Keep flags like --foo or -v (some servers accept options)
    if (t.startsWith('-') || isPathish(t)) {
      serverArgs.push(t);
      continue;
    }
    // First non-flag, non-pathish token → treat as tool name
    break;
  }

  const tool = flagArgs[i];
  const toolArgs = i < flagArgs.length ? flagArgs.slice(i + 1) : [];
  return { serverArgs, tool, toolArgs };
}


export async function startNpmServerAndConnect(opts: NpmServerOptions) {
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const pkgSpec = opts.version ? `${opts.pkg}@${opts.version}` : opts.pkg;

  // Launch the server via NPX; this downloads the package if missing.
  const transport = new StdioClientTransport({
    command: npx,
    args: ["-y", pkgSpec, ...(opts.args ?? [])],
    env: opts.env,
  });

  // Create and connect the MCP client
  const client = new Client({
    name: opts.clientName ?? "ts-bootstrap",
    version: opts.clientVersion ?? "1.0.0",
  });

  await client.connect(transport);

  return {
    client,
    /** Gracefully close transport + child process */
    close: () => transport.close(),
  };
}

async function listAvailableTools(client: Client) {
  try {
    const toolsResponse = await client.listTools();
    return toolsResponse.tools;
  } catch (error) {
    console.error('Error listing tools:', error);
    return [];
  }
}

async function callToolByName(client: Client, toolName: string, toolArgs: string[], commandInstance: Command) {
  try {
    const tools = await listAvailableTools(client);
    const tool = tools.find(t => t.name === toolName);
    if (!tool) {
      commandInstance.error(`Tool '${toolName}' not found. Available tools: ${tools.map(t => t.name).join(', ')}`);
      return;
    }

    // Parse tool arguments
    let parsedArgs: any = {};
    console.log("tool", tool);
    if (tool.inputSchema?.properties) {
      parsedArgs = parseCliArgsForTool(tool, toolArgs);
      console.log("parsedArgs", parsedArgs);
    } else if (toolArgs.length > 0) {
      // convention for schema-less tools
      parsedArgs = { path: toolArgs[0] };
    }

    commandInstance.log(`Calling tool: ${toolName}`);
    commandInstance.log(`Arguments: ${JSON.stringify(parsedArgs, null, 2)}`);

    const result = await client.callTool({
      name: toolName,
      arguments: parsedArgs
    });

    commandInstance.log('\nTool Result:');
    commandInstance.log(JSON.stringify(result, null, 2));

  } catch (error) {
    commandInstance.error(`Error calling tool: ${error}`);
  }
}

async function runInteractiveToolRunner(client: Client, commandInstance: Command) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  commandInstance.log('\n=== Interactive MCP Tool Runner ===');
  commandInstance.log('Commands:');
  commandInstance.log('  list     - List available tools');
  commandInstance.log('  call     - Call a tool by name');
  commandInstance.log('  help     - Show this help');
  commandInstance.log('  exit     - Exit interactive mode');
  commandInstance.log('');

  while (true) {
    try {
      const input = await question('mcp> ');

      if (!input.trim()) continue;

      const [command, ...args] = input.trim().split(/\s+/);

      switch (command.toLowerCase()) {
        case 'list':
          const availableTools = await listAvailableTools(client);
          if (availableTools.length === 0) {
            commandInstance.log('No tools available');
          } else {
            commandInstance.log('\nAvailable tools:');
            availableTools.forEach((tool, index) => {
              commandInstance.log(`${index + 1}. ${tool.name}`);
              if (tool.description) {
                commandInstance.log(`   ${tool.description}`);
              }
              if (tool.inputSchema) {
                commandInstance.log(`   Schema: ${JSON.stringify(tool.inputSchema, null, 2)}`);
              }
              commandInstance.log('');
            });
          }
          break;

        case 'call':
          if (args.length === 0) {
            commandInstance.log('Usage: call <tool_name>');
            break;
          }

          const toolName = args[0];
          const callTools = await listAvailableTools(client);
          const tool = callTools.find(t => t.name === toolName);

          if (!tool) {
            commandInstance.log(`Tool '${toolName}' not found. Use 'list' to see available tools.`);
            break;
          }

          let toolArgs: any = {};

          // If tool has input schema, ask for parameters
          if (tool.inputSchema?.properties) {
            const properties = tool.inputSchema.properties as Record<string, any>;

            for (const [paramName, paramSchema] of Object.entries(properties)) {
              const required = tool.inputSchema.required?.includes(paramName) || false;
              const paramType = paramSchema.type || 'string';
              const description = paramSchema.description || '';

              let prompt = `Enter ${paramName} (${paramType})`;
              if (description) prompt += ` - ${description}`;
              if (required) prompt += ' [required]';
              prompt += ': ';

              const value = await question(prompt);

              if (required && !value.trim()) {
                commandInstance.log(`Parameter '${paramName}' is required.`);
                toolArgs = null;
                break;
              }

              // Parse value based on type
              if (value.trim()) {
                switch (paramType) {
                  case 'number':
                    toolArgs[paramName] = parseFloat(value);
                    break;
                  case 'boolean':
                    toolArgs[paramName] = value.toLowerCase() === 'true';
                    break;
                  case 'array':
                    toolArgs[paramName] = value.split(',').map(v => v.trim());
                    break;
                  default:
                    toolArgs[paramName] = value;
                }
              }
            }

            if (toolArgs === null) continue; // Skip execution if required param missing
          }

          try {
            commandInstance.log(`\nCalling tool: ${toolName}`);
            commandInstance.log(`Arguments: ${JSON.stringify(toolArgs, null, 2)}`);

            const result = await client.callTool({
              name: toolName,
              arguments: toolArgs
            });

            commandInstance.log('\nTool Result:');
            commandInstance.log(JSON.stringify(result, null, 2));
          } catch (error) {
            commandInstance.error(`Error calling tool: ${error}`);
          }
          break;

        case 'help':
          commandInstance.log('\nCommands:');
          commandInstance.log('  list     - List available tools');
          commandInstance.log('  call     - Call a tool by name');
          commandInstance.log('  help     - Show this help');
          commandInstance.log('  exit     - Exit interactive mode');
          break;

        case 'exit':
        case 'quit':
          commandInstance.log('Exiting interactive mode...');
          rl.close();
          return;

        default:
          commandInstance.log(`Unknown command: ${command}. Type 'help' for available commands.`);
      }
    } catch (error) {
      commandInstance.error(`Error: ${error}`);
    }
  }
}

export default class Mcp extends Command {
  static override args = {
    package: Args.string({description: 'MCP server package name (e.g., @modelcontextprotocol/server-filesystem)', required: true}),
    tool: Args.string({description: 'Tool name to call (optional)'}),
    toolArgs: Args.string({description: 'Tool arguments (optional)', multiple: true}),
  }

  static override description = 'Start an MCP server and connect to it with interactive tool runner'

  static override examples = [
    '<%= config.bin %> <%= command.id %> @modelcontextprotocol/server-filesystem',
    '<%= config.bin %> <%= command.id %> @modelcontextprotocol/server-filesystem --version latest --args /path/to/allowed/dir',
    '<%= config.bin %> <%= command.id %> @modelcontextprotocol/server-filesystem --interactive',
    '<%= config.bin %> <%= command.id %> @modelcontextprotocol/server-filesystem -a C:/ list_directory C:\\Program Files',
  ]

  static override flags = {
    version: Flags.string({char: 'v', description: 'exact version or "latest"'}),
    args: Flags.string({char: 'a', description: 'args passed to the server binary', multiple: true}),
    env: Flags.string({char: 'e', description: 'extra env vars (KEY=VALUE)', multiple: true}),
    clientName: Flags.string({description: 'identify your app'}),
    clientVersion: Flags.string({description: 'client version'}),
    interactive: Flags.boolean({char: 'i', description: 'start interactive tool runner'}),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(Mcp);



    // Parse environment variables
    const env: Record<string, string> = {};
    if (flags.env) {
      for (const envVar of flags.env) {
        const [key, ...valueParts] = envVar.split('=');
        if (key && valueParts.length > 0) env[key] = valueParts.join('=');
      }
    }
  
    // Heuristically split server args (-a ...) from any accidentally appended tool tokens
    const rawFlagArgs = flags.args ?? [];
    let inferredTool = args.tool as string | undefined;
    let inferredToolArgs = (Array.isArray(args.toolArgs) ? args.toolArgs : (args.toolArgs ? [args.toolArgs] : [])) as string[];
  
    const split = splitServerArgsAndTool(rawFlagArgs, inferredTool, inferredToolArgs);
    const serverArgs = split.serverArgs;
    if (!inferredTool && split.tool) {
      inferredTool = split.tool;
      inferredToolArgs = split.toolArgs;
    }
  
    const options: NpmServerOptions = {
      pkg: args.package,
      version: flags.version,
      args: serverArgs,       // ✅ only the server's args now
      env: Object.keys(env).length ? env : undefined,
      clientName: flags.clientName,
      clientVersion: flags.clientVersion,
    };
  
    try {
      this.log(`Starting MCP server: ${options.pkg}`);
      this.log(`Server args: ${JSON.stringify(serverArgs)}`);
      const { client, close } = await startNpmServerAndConnect(options);
  
      this.log(`Successfully connected to MCP server: ${options.pkg}`);
      // Optional: show actual tools
      const toolList = await listAvailableTools(client);
      this.log(`Tools: ${toolList.map(t => t.name).join(', ') || '(none reported)'}`);
  
      if (inferredTool) {
        await callToolByName(client, inferredTool, inferredToolArgs, this);
      } else if (flags.interactive) {
        await runInteractiveToolRunner(client, this);
      } else {
        // default: list tools
        if (toolList.length > 0) {
          this.log('\nAvailable tools:');
          toolList.forEach((tool, i) => {
            this.log(`${i + 1}. ${tool.name}${tool.description ? ` – ${tool.description}` : ''}`);
          });
          this.log('\nTip: you can now run without `--` e.g.:');
          this.log(`${this.config.bin} ${this.id} ${args.package} -a C:\\ list_directory "C:\\Program Files"`);
        } else {
          this.log('No tools available');
        }
  
        process.on('SIGINT', () => {
          this.log('Closing connection...');
          close();
          process.exit(0);
        });
        await new Promise(() => {});
      }
  
      close();
    } catch (error) {
      this.error(`Failed to start MCP server: ${error}`);
    }
  }
  
}

function coerceByType(raw: string, schema?: any) {
  const t = schema?.type ?? 'string';
  if (t === 'number') return Number(raw);
  if (t === 'integer') return parseInt(raw, 10);
  if (t === 'boolean') return /^true$/i.test(raw);
  if (t === 'array') {
    try { return JSON.parse(raw); } catch { return raw.split(',').map(s => s.trim()); }
  }
  if (t === 'object') { try { return JSON.parse(raw); } catch {} }
  return raw;
}

function parseCliArgsForTool(tool: any, argv: string[]) {
  const props: Record<string, any> = (tool.inputSchema?.properties ?? {}) as any;
  const required: string[] = Array.isArray(tool.inputSchema?.required) ? tool.inputSchema.required : [];
  const keys = Object.keys(props);

  const kvArgs: Record<string, any> = {};
  const pos: string[] = [];

  for (const a of argv) {
    const i = a.indexOf('=');
    if (i > 0) {
      const k = a.slice(0, i);
      const v = a.slice(i + 1);
      kvArgs[k] = coerceByType(v, props[k]);
    } else {
      pos.push(a);
    }
  }

  const out: Record<string, any> = { ...kvArgs };

  // Single required key (e.g., 'path'): accept the whole remainder as one value (handles spaces)
  if (required.length === 1 && out[required[0]] === undefined && pos.length > 0) {
    out[required[0]] = coerceByType(pos.join(' '), props[required[0]]);
    pos.length = 0;
  }

  // If still nothing and property named 'path' exists, prefer mapping to it
  if (props.path && out.path === undefined && pos.length > 0) {
    if (keys.length === 1) {
      out.path = coerceByType(pos.join(' '), props.path);
      pos.length = 0;
    } else {
      out.path = coerceByType(pos.shift()!, props.path);
    }
  }

  // Fallback: map remaining by property order
  for (let i = 0; i < pos.length && i < keys.length; i++) {
    const k = keys[i];
    if (out[k] === undefined) out[k] = coerceByType(pos[i], props[k]);
  }

  // Validate required
  for (const r of required) {
    if (out[r] === undefined) {
      throw new Error(`Missing required parameter: ${r}`);
    }
  }
  return out;
}


