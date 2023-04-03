import { Agent } from 'undici';

let agent = new Agent();

export default {
	getInstance(): Agent {
		return agent;
	},

	init(options: Agent.Options): void {
		agent = new Agent(options);
	},
};
