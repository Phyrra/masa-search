import { Index } from "../src/types/Index.interface";
import { Type } from "../src/types/Type.enum";
import { Search } from "../src/Search";
import { Match } from "../src/types/Match.enum";
import { Query } from "../src/types/Query.interface";

fdescribe('number indexes', () => {
	const index: Index = {
		key: 'value',
		type: Type.NUMBER
	};

	let search1: Search;
	let search2: Search;

	beforeEach(() => {
		search1 = new Search();
		search1.addIndex(index);

		search2 = new Search();
		search2.addIndex(index);
	});

	it('should grow time linearly', () => {
		/*
		 * Small Block
		 */

		const max1: number = 10000;

		const data1: any[] = [];
		for (let i = 0; i < max1; ++i) {
			data1.push({
				value: i
			});
		}

		search1.addData(data1);

		const start1: number = Date.now();
		search1.find({
			condition: {
				index: index,
				value: max1 * 0.9,
				match: Match.GT
			}
		});
		const stop1: number = Date.now();

		const time1: number = stop1 - start1;

		/*
		 * Big block
		 */

		const max2: number = max1 * 10;

		const data2: any[] = [];
		for (let i = 0; i < max2; ++i) {
			data2.push({
				value: i
			});
		}

		search2.addData(data2);

		const start2: number = Date.now();
		search2.find({
			condition: {
				index: index,
				value: max2 * 0.9,
				match: Match.GT
			}
		});
		const stop2: number = Date.now();

		const time2: number = stop2 - start2;

		/*
		 * Eval block
		 */

		console.log('query times', time1, time2);

		expect(time1 * 10).toBeGreaterThan(time2);
	});

	/*
	it('should have swift direct access', () => {
		const max: number = 100000;

		let value: number;

		const data: any[] = [];
		for (let i = 0; i < max; ++i) {
			const nr: number = Math.floor(Math.random() * max);
			data.push({
				value: nr
			});

			if (i === max / 2) {
				value = nr;
			}
		}

		search1.addData(data);

		const start = Date.now();
		search1.find({
			condition: {
				index: index,
				value: max / 2,
				match: Match.EQ
			}
		});
		const stop = Date.now();

		const time = stop - start;

		console.log('access time', time);

		expect(time).toBeLessThan(10);
	});
	*/
});
