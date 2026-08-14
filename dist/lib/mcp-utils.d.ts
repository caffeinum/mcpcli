export declare function isPathish(token: string): boolean;
/**
 * Split a possibly-greedy -a/--args list into:
 *   - serverArgs (to pass to the MCP server)
 *   - tool (if found)
 *   - toolArgs
 *
 * Heuristic: collect pathish tokens and option-looking tokens (start with '-')
 * until we hit the first non-pathish, non-flag token → that's the tool name.
 */
export declare function splitServerArgsAndTool(flagArgs?: string[], explicitTool?: string, explicitToolArgs?: string[]): {
    serverArgs: string[];
    tool?: string;
    toolArgs: string[];
};
export declare function coerceByType(raw: string, schema?: any): any;
export declare function parseCliArgsForTool(tool: any, argv: string[]): Record<string, any>;
