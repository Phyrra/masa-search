import { guid } from '../src/guid';

describe('guid()', () => {
	it('should match the pattern', () => {
		// s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
		expect(guid()).toMatch(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/);
	});
});