import { SortNumberArray } from '../src/helpers/SortArray';

describe('Sorted array', () => {
	let arr: SortNumberArray;

	beforeEach(() => {
		arr = new SortNumberArray();

		['17', '25', '3', '19', '8', '1', '22', '5']
			.forEach(val => arr.push(val));
	});

	describe('getAll()', () => {
		it('should be in order', () => {
			expect(arr.getAll())
				.toEqual(['1', '3', '5', '8', '17', '19', '22', '25']);
		});

		it('should ignore duplicates', () => {
			arr.push('17');

			expect(arr.getAll())
				.toEqual(['1', '3', '5', '8', '17', '19', '22', '25']);
		});
	});

	describe('smaller than', () => {
		it('should extract all numbers smaller than a reference', () => {
			expect(arr.getSmallerThan('20'))
				.toEqual(['1', '3', '5', '8', '17', '19']);
		});

		it('should not extract numbers equal to the reference', () => {
			expect(arr.getSmallerThan('19'))
				.toEqual(['1', '3', '5', '8', '17']);
		});
	});

	describe('smaller than or equal to', () => {
		it('should extract numbers equal to the reference', () => {
			expect(arr.getSmallerEqualsTo('19'))
				.toEqual(['1', '3', '5', '8', '17', '19']);
		});
	});

	describe('bigger than', () => {
		it('should extract all numbers bigger than a reference', () => {
			expect(arr.getBiggerThan('20'))
				.toEqual(['22', '25']);
		});

		it('should not extract numbers equal to the reference', () => {
			expect(arr.getBiggerThan('19'))
				.toEqual(['22', '25']);
		});
	});

	describe('bigger than or equal to', () => {
		it('should extract numbers equal to the reference', () => {
			expect(arr.getBiggerEqualsTo('19'))
				.toEqual(['19', '22', '25']);
		});
	});
});
