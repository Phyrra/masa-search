import { SortNumberArray } from '../src/helpers/SortArray';
import { doTimed } from './helpers/doTimed';

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

		for (let i = 0; i < 100000; ++i) {
			sortArr.push(i);
			arr.push(i);
		}
	});

	it('should have less time to find a number in sorted', () => {
		const find: number = 40000;

		const duration1: number = doTimed(() => findIndex(arr, find), 'find in linear array');
		const duration2: number = doTimed(() => sortArr['_find'](find), 'find in sorted array');

		expect(duration2).toBeLessThan(duration1);
	});

	it('should have less time to find a subset', () => {
		const find: number = 400000;

		const duration1: number = doTimed(() => getBigger(arr, find), 'subset of linear array');
		const duration2: number = doTimed(() => sortArr.getBiggerThan(find), 'subset of sorted array');

		expect(duration2).toBeLessThan(duration1);
	});
});
