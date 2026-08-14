import { Command } from '@oclif/core';
export { startNpmServerAndConnect } from '../lib/mcp-server.js';
export default class Mcp extends Command {
    static args: {
        package: import("@oclif/core/interfaces").Arg<string, Record<string, unknown>>;
        tool: import("@oclif/core/interfaces").Arg<string | undefined, Record<string, unknown>>;
        toolArgs: import("@oclif/core/interfaces").Arg<string | undefined, Record<string, unknown>>;
    };
    static description: string;
    static examples: string[];
    static flags: {
        version: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        args: import("@oclif/core/interfaces").OptionFlag<string[] | undefined, import("@oclif/core/interfaces").CustomOptions>;
        env: import("@oclif/core/interfaces").OptionFlag<string[] | undefined, import("@oclif/core/interfaces").CustomOptions>;
        clientName: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        clientVersion: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
        interactive: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        verbose: import("@oclif/core/interfaces").BooleanFlag<boolean>;
        daemonUrl: import("@oclif/core/interfaces").OptionFlag<string, import("@oclif/core/interfaces").CustomOptions>;
        serverId: import("@oclif/core/interfaces").OptionFlag<string | undefined, import("@oclif/core/interfaces").CustomOptions>;
    };
    private client;
    private ensureDaemonRunning;
    private generateServerId;
    private ensureServerRunning;
    private callToolByName;
    private runInteractiveToolRunner;
    run(): Promise<void>;
}
