import { levenshtein, getMaxAllowedDistance } from '../src/helpers/levenshtein';

describe('levenshtein()', () => {
	it('should return 0 for matching values', () => {
		expect(levenshtein('dog', 'dog')).toBe(0);
	});

	it('should return 1 for a wrong letter', () => {
		expect(levenshtein('dog', 'dok')).toBe(1);
	});

	it('should return 1 for an additional letter', () => {
		expect(levenshtein('dog', 'dogg')).toBe(1);
	});

	it('should return 1 for a missing letter', () => {
		expect(levenshtein('dog', 'do')).toBe(1);
	});
});

describe('getMaxAllowedDistance()', () => {
	it('should return 1 for very short words', () => {
		expect(getMaxAllowedDistance('dog', 'dog')).toBe(1);
	});

	it('should return 2 for medium sized words', () => {
		expect(getMaxAllowedDistance('doggo', 'doggo')).toBe(2);
	});

	it('should return 4 for long words', () => {
		expect(getMaxAllowedDistance('dogtastic', 'dogtastic')).toBe(4);
	});

	it('should take the longer of the words into account', () => {
		expect(getMaxAllowedDistance('dog', 'dogtastic')).toBe(4);
	});
});