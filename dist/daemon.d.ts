declare class McpDaemon {
    private port;
    private servers;
    private app;
    private server;
    constructor(port?: number);
    private setupMiddleware;
    private setupRoutes;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export default McpDaemon;
