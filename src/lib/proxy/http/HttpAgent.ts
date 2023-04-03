import http, { type Agent } from 'node:http';
import https, { type AgentOptions } from 'node:https';

interface Agents {
	http: Agent;
	https: Agent;
}

let agent: Agents = {
	http: new http.Agent(),
	https: new https.Agent(),
};

export default {
	init(options: AgentOptions): void {
		const agentOptions: AgentOptions = {
			keepAlive: true,
			keepAliveMsecs: 6e4,
			maxSockets: 2048,
			maxFreeSockets: 2048,
			...options,
		};

		agent = {
			http: new http.Agent(agentOptions),
			https: new https.Agent(agentOptions),
		};
	},
	getInstance(protocol: 'http' | 'https'): Agent {
		return agent[protocol];
	},
};
