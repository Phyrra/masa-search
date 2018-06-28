import { Search } from "../src/Search";
import { Type } from "../src/types/Type.enum";
import { Match } from "../src/types/Match.enum";
import { doTimed } from "./helpers/doTimed";

var ainulindale: string = require('./data/Ainulindale.txt');
var ofTheValar: string = require('./data/OfTheValar.txt');
var ofTheBeginningOfDays: string = require('./data/OfTheBeginningOfDays.txt');

describe('text searches', () => {
	let search: Search;

	let base: number;
	let expected: number;

	beforeAll(() => {
		search = new Search();

		search.addIndex({
			key: 'text',
			type: Type.TEXT
		});

		search.addData([
			{ text: ainulindale },
			{ text: ofTheValar },
			{ text: ofTheBeginningOfDays }
		]);

		base = doTimed(() => {
			expected = search.find({
				condition: {
					index: {
						key: 'text',
						type: Type.WORD
					},
					value: 'Iluvatar',
					match: Match.EQ
				}
			}).length;
		}, 'find exact');
	});

	it('should find the same amount fuzzy', () => {
		const result: number = search.find({
			condition: {
				index: {
					key: 'text',
					type: Type.WORD
				},
				value: 'Illuvatar',
				match: Match.FUZZY
			}
		}).length;

		expect(result).toBe(expected);
	});

	it('should find the same amount with wildcard', () => {
		const result: number = search.find({
			condition: {
				index: {
					key: 'text',
					type: Type.WORD
				},
				value: 'I.*uvatar',
				match: Match.WILDCARD
			}
		}).length;

		expect(result).toBe(expected);
	});

	it('should take less time direct compared to fuzzy', () => {
		const timeFuzzy: number = doTimed(() => {
			search.find({
				condition: {
					index: {
						key: 'text',
						type: Type.WORD
					},
					value: 'Illuvatar',
					match: Match.FUZZY
				}
			})
		}, 'find fuzzy');

		expect(base).toBeLessThan(timeFuzzy);
	});

	it('should take less time direct compared to wildcard', () => {
		const timeWildcard: number = doTimed(() => {
			search.find({
				condition: {
					index: {
						key: 'text',
						type: Type.WORD
					},
					value: 'I.*uvatar',
					match: Match.WILDCARD
				}
			})
		}, 'find wildcard');

		expect(base).toBeLessThan(timeWildcard);
	});

	xit('should take roughly the same time between wild and fuzzy', () => {
		const timeFuzzy: number = doTimed(() => {
			search.find({
				condition: {
					index: {
						key: 'text',
						type: Type.WORD
					},
					value: 'Iluvatar',
					match: Match.FUZZY
				}
			})
		}, 'find fuzzy');

		const timeWildcard: number = doTimed(() => {
			search.find({
				condition: {
					index: {
						key: 'text',
						type: Type.WORD
					},
					value: 'I.*uvatar',
					match: Match.WILDCARD
				}
			})
		}, 'find wildcard');

		expect(Math.max(timeFuzzy, timeWildcard) / Math.min(timeFuzzy, timeWildcard))
			.toBeLessThan(1.5);
	});
});

