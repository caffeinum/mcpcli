import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { NpmServerOptions } from '../client.js';
export declare function startNpmServerAndConnect(opts: NpmServerOptions): Promise<{
    client: Client<{
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
                progressToken?: string | number | undefined;
            } | undefined;
        } | undefined;
    }, {
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
            } | undefined;
        } | undefined;
    }, {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    }>;
    /** Gracefully close transport + child process */
    close: () => Promise<void>;
}>;
