import { SortNumberArray, SortMomentArray } from '../src/helpers/SortArray';
import * as moment from 'moment';

describe('Sorted number array', () => {
	let arr: SortNumberArray;

	beforeEach(() => {
		arr = new SortNumberArray();

		[17, 25, 3, 19, 8, 1, 22, 5]
			.forEach(val => arr.push(val));
	});

	describe('getAll()', () => {
		it('should be in order', () => {
			expect(arr.getAll())
				.toEqual([1, 3, 5, 8, 17, 19, 22, 25]);
		});
	});

	describe('getAllTransformed()', () => {
		it('should be in order', () => {
			expect(arr.getAllTransformed())
				.toEqual(['1', '3', '5', '8', '17', '19', '22', '25']);
		});
	});

	describe('push()', () => {
		it('should ignore duplicates', () => {
			arr.push(17);

			expect(arr.getAll())
				.toEqual([1, 3, 5, 8, 17, 19, 22, 25]);
		});
	});

	describe('smaller than', () => {
		it('should extract all numbers smaller than a reference', () => {
			expect(arr.getSmallerThan(20))
				.toEqual([1, 3, 5, 8, 17, 19]);
		});

		it('should not extract numbers equal to the reference', () => {
			expect(arr.getSmallerThan(19))
				.toEqual([1, 3, 5, 8, 17]);
		});
	});

	describe('smaller than or equal to', () => {
		it('should extract numbers equal to the reference', () => {
			expect(arr.getSmallerEqualsTo(19))
				.toEqual([1, 3, 5, 8, 17, 19]);
		});
	});

	describe('bigger than', () => {
		it('should extract all numbers bigger than a reference', () => {
			expect(arr.getBiggerThan(20))
				.toEqual([22, 25]);
		});

		it('should not extract numbers equal to the reference', () => {
			expect(arr.getBiggerThan(19))
				.toEqual([22, 25]);
		});
	});

	describe('bigger than or equal to', () => {
		it('should extract numbers equal to the reference', () => {
			expect(arr.getBiggerEqualsTo(19))
				.toEqual([19, 22, 25]);
		});
	});
});

describe('Sorted moment array', () => {
	const DATE_FORMAT = 'YYYY-MM-DD';

	let arr: SortMomentArray;

	beforeEach(() => {
		arr = new SortMomentArray(DATE_FORMAT, 'day');

		[moment('1990-01-01'), moment('1980-01-01'), moment('2000-01-01')]
			.forEach(val => arr.push(val));
	});

	describe('getAllTransformed()', () => {
		it('should be in order', () => {
			expect(arr.getAllTransformed())
				.toEqual(['1980-01-01', '1990-01-01', '2000-01-01']);
		});
	});

	describe('push()', () => {
		it('should ignore duplicates', () => {
			arr.push(moment('1990-01-01'));

			expect(arr.getAllTransformed())
				.toEqual(['1980-01-01', '1990-01-01', '2000-01-01']);
		});
	});

	describe('smaller than', () => {
		it('should extract all dates smaller than a reference', () => {
			expect(arr.getSmallerThanTransformed('1991-01-01'))
				.toEqual(['1980-01-01', '1990-01-01']);
		});

		it('should not extract dates equal to the reference', () => {
			expect(arr.getSmallerThanTransformed('1990-01-01'))
				.toEqual(['1980-01-01']);
		});
	});

	describe('smaller than or equal to', () => {
		it('should extract dates equal to the reference', () => {
			expect(arr.getSmallerEqualsToTransformed('1990-01-01'))
				.toEqual(['1980-01-01', '1990-01-01']);
		});
	});

	describe('bigger than', () => {
		it('should extract all dates bigger than a reference', () => {
			expect(arr.getBiggerThanTransformed('1989-01-01'))
				.toEqual(['1990-01-01', '2000-01-01']);
		});

		it('should not extract dates equal to the reference', () => {
			expect(arr.getBiggerThanTransformed('1990-01-01'))
				.toEqual(['2000-01-01']);
		});
	});

	describe('bigger than or equal to', () => {
		it('should extract numbers equal to the reference', () => {
			expect(arr.getBiggerEqualsToTransformed('1990-01-01'))
				.toEqual(['1990-01-01', '2000-01-01']);
		});
	});
});
