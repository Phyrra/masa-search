import { Index } from "../src/types/Index.interface";
import { Type } from "../src/types/Type.enum";
import { Search } from "../src/Search";
import { Match } from "../src/types/Match.enum";
import { Query } from "../src/types/Query.interface";

describe('number indexes', () => {
	const index: Index = {
		key: 'value',
		type: Type.NUMBER
	};

	let search1: Search;
	let search2: Search;

	const doTimed: (fnc: Function, name: string) => number = (fnc, name) => {
		const start: number = Date.now();
		fnc();
		const stop: number = Date.now();

		const duration: number = stop - start;
		console.log(name, duration);

		return duration;
	}

	beforeEach(() => {
		search1 = new Search();
		search1.addIndex(index);

		search2 = new Search();
		search2.addIndex(index);
	});

	it('should grow time less than linearly', () => {
		const factor: number = 100;

		/*
		 * Small Block
		 */

		const max1: number = 10000;

		doTimed(() => {
			const data1: any[] = [];
			for (let i = 0; i < max1; ++i) {
				data1.push({
					value: i
				});
			}

			search1.addData(data1);
		}, `adding ${max1} elements`);

		const time1: number = doTimed(() => {
			search1.find({
				condition: {
					index: index,
					value: max1 * 0.9,
					match: Match.GT
				}
			});
		}, `finding in ${max1} elements`);

		/*
		 * Big block
		 */

		const max2: number = max1 * factor;

		doTimed(() => {
			const data2: any[] = [];
			for (let i = 0; i < max2; ++i) {
				data2.push({
					value: i
				});
			}

			search2.addData(data2);
		}, `adding ${max2} elements`);

		const time2: number = doTimed(() => {
			search2.find({
				condition: {
					index: index,
					value: max2 * 0.9,
					match: Match.GT
				}
			});
		}, `finding in ${max2} elements`);

		/*
		 * Eval block
		 */

		expect(time1 * factor).toBeGreaterThan(time2);
	});

	it('should have swift direct access', () => {
		const max: number = 100000;

		const data: any[] = [];
		for (let i = 0; i < max; ++i) {
			data.push({
				value: i
			});
		}

		search1.addData(data);

		const time = doTimed(() => {
			search1.find({
				condition: {
					index: index,
					value: max / 2,
					match: Match.EQ
				}
			});
		}, 'direct access');

		expect(time).toBeLessThan(10);
	});
});
