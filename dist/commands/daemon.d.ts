import { Command } from '@oclif/core';
export default class Daemon extends Command {
    static args: {};
    static description: string;
    static examples: string[];
    static flags: {
        port: import("@oclif/core/interfaces").OptionFlag<number, import("@oclif/core/interfaces").CustomOptions>;
        'log-level': import("@oclif/core/interfaces").OptionFlag<string, import("@oclif/core/interfaces").CustomOptions>;
    };
    run(): Promise<void>;
}
