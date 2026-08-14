import axios from 'axios';
export class McpClient {
    baseUrl;
    axios;
    constructor(baseUrl = 'http://localhost:3001') {
        this.baseUrl = baseUrl;
        this.axios = axios.create({
            baseURL: baseUrl,
            timeout: 30000, // 30 second timeout
        });
    }
    async healthCheck() {
        const response = await this.axios.get('/health');
        return response.data;
    }
    async startServer(serverId, options) {
        const response = await this.axios.post('/servers', { serverId, ...options });
        return response.data;
    }
    async listServers() {
        const response = await this.axios.get('/servers');
        return response.data;
    }
    async listTools(serverId) {
        const response = await this.axios.get(`/servers/${serverId}/tools`);
        return response.data;
    }
    async callTool(serverId, toolName, args = {}) {
        const response = await this.axios.post(`/servers/${serverId}/tools/${toolName}/call`, {
            arguments: args
        });
        return response.data;
    }
    async stopServer(serverId) {
        const response = await this.axios.delete(`/servers/${serverId}`);
        return response.data;
    }
    async stopAllServers() {
        const response = await this.axios.delete('/servers');
        return response.data;
    }
    // Utility method to check if daemon is running
    async isDaemonRunning() {
        try {
            await this.healthCheck();
            return true;
        }
        catch (error) {
            return false;
        }
    }
    // Utility method to wait for daemon to be ready
    async waitForDaemon(maxRetries = 10, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            if (await this.isDaemonRunning()) {
                return;
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        throw new Error('Daemon did not become ready within the expected time');
    }
}
export default McpClient;
