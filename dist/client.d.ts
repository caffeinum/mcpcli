export interface DaemonHealthResponse {
    status: string;
    servers: string[];
}
export interface ServerInfo {
    id: string;
    packageName: string;
    lastUsed: string;
}
export interface ToolInfo {
    name: string;
    description?: string;
    inputSchema?: any;
}
export interface ToolCallResponse {
    serverId: string;
    toolName: string;
    result: any;
}
export interface NpmServerOptions {
    pkg: string;
    version?: string;
    args?: string[];
    env?: Record<string, string>;
    clientName?: string;
    clientVersion?: string;
}
export declare class McpClient {
    private baseUrl;
    private axios;
    constructor(baseUrl?: string);
    healthCheck(): Promise<DaemonHealthResponse>;
    startServer(serverId: string, options: NpmServerOptions): Promise<{
        message: string;
        serverId: string;
    }>;
    listServers(): Promise<ServerInfo[]>;
    listTools(serverId: string): Promise<{
        serverId: string;
        tools: ToolInfo[];
    }>;
    callTool(serverId: string, toolName: string, args?: any): Promise<ToolCallResponse>;
    stopServer(serverId: string): Promise<{
        message: string;
    }>;
    stopAllServers(): Promise<{
        message: string;
    }>;
    isDaemonRunning(): Promise<boolean>;
    waitForDaemon(maxRetries?: number, delay?: number): Promise<void>;
}
export default McpClient;
