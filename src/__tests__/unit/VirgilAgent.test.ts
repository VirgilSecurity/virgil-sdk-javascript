// @ts-nocheck
import { VirgilAgent } from "../../Client/VirgilAgent";
import data from './data/userAgents.json';

describe('VirgilAgent', () => {
	it('Should return header value in proper format', () => {
		const headerValue = new VirgilAgent('sdk', '5.0.0').value;
		assert.equal(/sdk;js;.+;5\.0\.0/.test(headerValue), true)
	})

	it('Should properly detect os and browser by user agent', () => {
		data.forEach(uaObj => {
			const agent = new VirgilAgent('sdk', '5.0.0', uaObj.user_agent);
			assert.equal(agent.getOsName(), uaObj.os);
			assert.equal(agent.getBrowser(), uaObj.browser);
		})
	})
})
