import { SortNumberArray } from '../src/helpers/SortArray';

describe('Sorted array', () => {
	let sortArr: SortNumberArray;
	let arr: number[];

	const findIndex: (arr: number[], value: number) => number = (arr, value) => {
		for (let i = 0; i < arr.length; ++i) {
			if (arr[i] === value) {
				return i;
			}
		}

		return -1;
	};

	const getBigger: (arr: number[], value: number) => number[] = (arr, value) => {
		for (let i = 0; i < arr.length; ++i) {
			if (arr[i] > value) {
				return arr.slice(i);
			}
		}
	};

	beforeEach(() => {
		sortArr = new SortNumberArray();
		arr = [];

		for (let i = 0; i < 1000000; ++i) {
			sortArr.push(i);
			arr.push(i);
		}
	});

	it('should have less time to find a number in sorted', () => {
		const find: number = 400000;

		const start1: number = new Date().getTime();
		findIndex(arr, find);
		const stop1: number = new Date().getTime();

		const duration1: number = stop1 - start1;

		const start2: number = new Date().getTime();
		sortArr['_find'](find);
		const stop2: number = new Date().getTime();

		const duration2: number = stop2 - start2;

		console.log('times to find', duration1, duration2);

		expect(duration2).toBeLessThan(duration1);
	});

	it('should have less time to find a subset', () => {
		const find: number = 400000;

		const start1: number = new Date().getTime();
		getBigger(arr, find);
		const stop1: number = new Date().getTime();

		const duration1: number = stop1 - start1;

		const start2: number = new Date().getTime();
		sortArr.getBiggerThan(find);
		const stop2: number = new Date().getTime();

		const duration2: number = stop2 - start2;

		console.log('times to get subset', duration1, duration2);

		expect(duration2).toBeLessThan(duration1);
	});
});
