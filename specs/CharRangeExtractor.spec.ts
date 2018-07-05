import { CharRangeExtractor } from '../src/helpers/CharRangeExtractor';

describe('CharRangeExtractor.getSetOfCharacters()', () => {
	it('should extract single characters', () => {
		expect(CharRangeExtractor.getSetOfCharacters('asdf'))
			.toEqual({
				a: true,
				s: true,
				d: true,
				f: true
			});
	});

	it('should extract a range of characters', () => {
		expect(CharRangeExtractor.getSetOfCharacters('a-d'))
			.toEqual({
				a: true,
				b: true,
				c: true,
				d: true
			});
	});

	it('should combine single characters with a range', () => {
		expect(CharRangeExtractor.getSetOfCharacters('af-iz'))
			.toEqual({
				a: true,
				f: true,
				g: true,
				h: true,
				i: true,
				z: true
			});
	});

	it('should combine multiple ranges', () => {
		expect(CharRangeExtractor.getSetOfCharacters('a-dx-z'))
			.toEqual({
				a: true,
				b: true,
				c: true,
				d: true,
				x: true,
				y: true,
				z: true
			});
	});
});
