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

	beforeEach(() => {
		search1 = new Search();
		search1.addIndex(index);

		search2 = new Search();
		search2.addIndex(index);
	});

	it('should grow time linearly', () => {
		const query: Query = {
			condition: {
				index: index,
				value: 500,
				match: Match.GT
			}
		};

		const data1: any[] = [];
		for (let i = 0; i < 10000; ++i) {
			data1.push({
				value: Math.floor(Math.random() * 10000)
			});
		}

		search1.addData(data1);

		const start1: number = new Date().getTime();
		search1.find(query);
		const stop1: number = new Date().getTime();

		const time1: number = stop1 - start1;

		const data2: any[] = [];
		for (let i = 0; i < 100000; ++i) {
			data2.push({
				value: Math.floor(Math.random() * 100000)
			});
		}

		search2.addData(data2);

		const start2: number = new Date().getTime();
		search2.find(query);
		const stop2: number = new Date().getTime();

		const time2: number = stop2 - start2;

		console.log(time1, time2);

		expect(time1 * 10).toBeGreaterThan(time2);
	});
});
