import { Type } from '../src/types/Type.enum';
import { SearchKeyTransformer } from '../src/helpers/SearchKeyTransformer';
import * as moment from 'moment';

describe('SearchKeyTransformer.canTransform()', () => {
	const knownTypes: Type[] = [
		Type.WORD,
		Type.TEXT,
		Type.NUMBER,
		Type.DATE
	];

	knownTypes.forEach(type => {
		it(`should yield true for ${type}`, () => {
			expect(SearchKeyTransformer.canTransform(type)).toBe(true);
		});
	});

	it('should yield false for unknown type', () => {
		expect(SearchKeyTransformer.canTransform('UNKNOWN' as Type)).toBe(false);
	});
});

describe('SearchKeyTransformer.transform()', () => {
	describe('WORD',  () => {
		it('should return an empty array for no value', () => {
			expect(SearchKeyTransformer.transform(Type.WORD, null))
				.toEqual([]);
		});

		it('should return an empty array for an empty string', () => {
			expect(SearchKeyTransformer.transform(Type.WORD, ''))
				.toEqual([]);
		});

		it('should return an empty array for a blank string', () => {
			expect(SearchKeyTransformer.transform(Type.WORD, ' '))
				.toEqual([]);
		});

		it('should lowerCase the string', () => {
			expect(SearchKeyTransformer.transform(Type.WORD, 'SoMeInPuT'))
				.toEqual(['someinput']);
		});
	});

	describe('TEXT', () => {
		it('should return an empty array for no value', () => {
			expect(SearchKeyTransformer.transform(Type.TEXT, null))
				.toEqual([]);
		});

		it('should return an empty array for an empty string', () => {
			expect(SearchKeyTransformer.transform(Type.TEXT, ''))
				.toEqual([]);
		});

		it('should return an empty array for a blank string', () => {
			expect(SearchKeyTransformer.transform(Type.TEXT, ' '))
				.toEqual([]);
		});

		it('should lowerCase the string', () => {
			expect(SearchKeyTransformer.transform(Type.TEXT, 'SoMeInPuT'))
				.toEqual(['someinput']);
		});

		it('should split on whitespace', () => {
			expect(SearchKeyTransformer.transform(Type.TEXT, 'i love my wife'))
				.toEqual([
					'i',
					'love',
					'my',
					'wife'
				]);
		});

		it('should treat non text characters as whitespace', () => {
			expect(SearchKeyTransformer.transform(Type.TEXT, 'i<3my_wife'))
				.toEqual([
					'i',
					'my',
					'wife'
				]);
		});

		it('should remove empty elements', () => {
			expect(SearchKeyTransformer.transform(Type.TEXT, 'big   break'))
				.toEqual([
					'big',
					'break'
				]);
		});
	});

	describe('NUMBER', () => {
		it('should return an empty array for no value', () => {
			expect(SearchKeyTransformer.transform(Type.NUMBER, null))
				.toEqual([]);
		});

		it('should return an empty array for not a number', () => {
			expect(SearchKeyTransformer.transform(Type.NUMBER, 'hello'))
				.toEqual([]);
		});

		it('should return a stringified number', () => {
			expect(SearchKeyTransformer.transform(Type.NUMBER, '1'))
				.toEqual(['1']);
		});

		it('should stringify a number', () => {
			expect(SearchKeyTransformer.transform(Type.NUMBER, 1))
				.toEqual(['1']);
		});
	});

	describe('DATE', () => {
		it('should return an empty array for no value', () => {
			expect(SearchKeyTransformer.transform(Type.DATE, null))
				.toEqual([]);
		});

		it('should return an empty array for a non-date value', () => {
			expect(SearchKeyTransformer.transform(Type.DATE, 'hello'))
				.toEqual([]);
		});

		it('should format a date', () => {
			expect(SearchKeyTransformer.transform(Type.DATE, new Date(2018, 5, 16)))
				.toEqual(['2018-06-16']);
		});

		it('should format a moment', () => {
			expect(SearchKeyTransformer.transform(Type.DATE, moment(new Date(2018, 5, 16))))
				.toEqual(['2018-06-16']);
		});

		it('should return a stringified date', () => {
			expect(SearchKeyTransformer.transform(Type.DATE, '2018-06-16'))
				.toEqual(['2018-06-16']);
		});
	});
});
