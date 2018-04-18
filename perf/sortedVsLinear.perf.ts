import { SortNumberArray } from '../src/helpers/SortArray';
import * as _ from 'lodash';

class LinearSearch {
	private _indexedData: any;

	constructor() {
		this._indexedData = {};
	}

	addData(data: any[], field): void {
		data.forEach(elem => {
			const key: string = _.get(elem, field).toString();

			if (!this._indexedData.hasOwnProperty(key)) {
				this._indexedData[key] = [];
			}

			this._indexedData[key].push(elem);
		});
	}

	findBiggerThan(value: number): any[] {
		return Object.keys(this._indexedData)
			.filter(key => Number(key) > value)
			.reduce((acc, key) => acc.concat(this._indexedData[key]), []);
	}
}

class SortedSearch {
	private _indexedData: any;
	private _sorted: SortNumberArray;

	constructor() {
		this._indexedData = {};
		this._sorted = new SortNumberArray();
	}

	addData(data: any[], field): void {
		data.forEach(elem => {
			const val: number = _.get(elem, field);
			const key: string = val.toString();

			if (!this._indexedData.hasOwnProperty(key)) {
				this._indexedData[key] = [];
			}

			this._indexedData[key].push(elem);
			this._sorted.push(String(val));
		});
	}

	findBiggerThan(value: number): any[] {
		return this._sorted.getBiggerThan(String(value))
			.reduce((acc, val) => acc.concat(this._indexedData[value.toString()]), []);
	}
}

describe('Comparison', () => {
	const max: number = 250000;

	let search1: LinearSearch;
	let search2: SortedSearch;

	beforeEach(() => {
		search1 = new LinearSearch();
		search2 = new SortedSearch();

		const data: any[] = [];
		for (var i = 0; i < max; ++i) {
			data.push({
				value: Math.floor(Math.random() * max)
			});
		}

		search1.addData(data, 'value');
		search2.addData(data, 'value');
	});

	it('should require less time for sorted', () => {
		const find: number = max * 0.9;

		var start1: number = Date.now();
		search1.findBiggerThan(find);
		const stop1: number = Date.now();

		const duration1: number = stop1 - start1;

		const start2: number = Date.now();
		search2.findBiggerThan(find);
		const stop2: number = Date.now();

		const duration2: number = stop2 - start2;

		console.log('comparison duration', duration1, duration2);

		expect(duration1).toBeGreaterThan(duration2);
	});
});
