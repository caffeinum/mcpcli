import express from 'express';
import cors from 'cors';
class McpDaemon {
    port;
    servers = new Map();
    app;
    server;
    constructor(port = 3001) {
        this.port = port;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }
    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
    }
    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', servers: Array.from(this.servers.keys()) });
        });
        // Start a server
        this.app.post('/servers', async (req, res) => {
            try {
                const { serverId, ...options } = req.body;
                if (this.servers.has(serverId)) {
                    return res.status(400).json({ error: `Server ${serverId} already exists` });
                }
                console.log(`Starting MCP server: ${options.pkg} as ${serverId}`);
                // Import the function dynamically to avoid circular dependency
                const { startNpmServerAndConnect } = await import('./lib/mcp-server.js');
                const { client, close } = await startNpmServerAndConnect(options);
                const managedServer = {
                    client,
                    close,
                    packageName: options.pkg,
                    options,
                    lastUsed: new Date()
                };
                this.servers.set(serverId, managedServer);
                res.json({
                    message: `Server ${serverId} started successfully`,
                    serverId
                });
            }
            catch (error) {
                console.error('Error starting server:', error);
                res.status(500).json({ error: error?.message || 'Unknown error' });
            }
        });
        // List servers
        this.app.get('/servers', (req, res) => {
            const serverList = Array.from(this.servers.entries()).map(([id, server]) => ({
                id,
                packageName: server.packageName,
                lastUsed: server.lastUsed
            }));
            res.json(serverList);
        });
        // List tools for a server
        this.app.get('/servers/:serverId/tools', async (req, res) => {
            try {
                const { serverId } = req.params;
                const managedServer = this.servers.get(serverId);
                if (!managedServer) {
                    return res.status(404).json({ error: `Server ${serverId} not found` });
                }
                const toolsResponse = await managedServer.client.listTools();
                managedServer.lastUsed = new Date();
                res.json({
                    serverId,
                    tools: toolsResponse.tools
                });
            }
            catch (error) {
                console.error('Error listing tools:', error);
                res.status(500).json({ error: error?.message || 'Unknown error' });
            }
        });
        // Call tool on a server
        this.app.post('/servers/:serverId/tools/:toolName/call', async (req, res) => {
            try {
                const { serverId, toolName } = req.params;
                const { arguments: toolArgs } = req.body;
                const managedServer = this.servers.get(serverId);
                if (!managedServer) {
                    return res.status(404).json({ error: `Server ${serverId} not found` });
                }
                console.log(`Calling tool ${toolName} on server ${serverId} with args:`, toolArgs);
                const result = await managedServer.client.callTool({
                    name: toolName,
                    arguments: toolArgs || {}
                });
                managedServer.lastUsed = new Date();
                res.json({
                    serverId,
                    toolName,
                    result
                });
            }
            catch (error) {
                console.error('Error calling tool:', error);
                res.status(500).json({ error: error?.message || 'Unknown error' });
            }
        });
        // Stop a server
        this.app.delete('/servers/:serverId', (req, res) => {
            try {
                const { serverId } = req.params;
                const managedServer = this.servers.get(serverId);
                if (!managedServer) {
                    return res.status(404).json({ error: `Server ${serverId} not found` });
                }
                managedServer.close();
                this.servers.delete(serverId);
                res.json({ message: `Server ${serverId} stopped successfully` });
            }
            catch (error) {
                console.error('Error stopping server:', error);
                res.status(500).json({ error: error?.message || 'Unknown error' });
            }
        });
        // Stop all servers
        this.app.delete('/servers', (req, res) => {
            try {
                for (const [serverId, managedServer] of this.servers) {
                    managedServer.close();
                }
                this.servers.clear();
                res.json({ message: 'All servers stopped successfully' });
            }
            catch (error) {
                console.error('Error stopping servers:', error);
                res.status(500).json({ error: error?.message || 'Unknown error' });
            }
        });
    }
    async start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`MCP Daemon listening on port ${this.port}`);
                resolve();
            });
        });
    }
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                // Close all managed servers first
                for (const [serverId, managedServer] of this.servers) {
                    managedServer.close();
                }
                this.servers.clear();
                this.server.close(() => {
                    console.log('MCP Daemon stopped');
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
}
export default McpDaemon;
