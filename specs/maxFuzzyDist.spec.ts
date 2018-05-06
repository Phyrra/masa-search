import { getMaxAllowedDistance } from '../src/helpers/maxFuzzyDist';

describe('getMaxAllowedDistance()', () => {
	it('should return 1 for very short word', () => {
		expect(getMaxAllowedDistance('dog')).toBe(1);
	});

	it('should return 2 for medium sized word', () => {
		expect(getMaxAllowedDistance('doggo')).toBe(2);
	});

	it('should return 4 for long word', () => {
		expect(getMaxAllowedDistance('dogtastic')).toBe(4);
	});
});