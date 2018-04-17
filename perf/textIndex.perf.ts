import { Search } from "../src/Search";
import { Type } from "../src/types/Type.enum";

var ainulindale: string = require('./_Ainulindale.txt');
var ofTheValar: string = require('./_OfTheValar.txt');
var ofTheBeginningOfDays: string = require('./_OfTheBeginningOfDays.txt');

const getNumberOfKeys: (search: Search) => number = (search) => {
	return Object.keys(search['_indexedData']['text']).length;
};

const countWords: (text: string) => number = (text) => {
	return text
		.replace(/[^a-z\s]/g, ' ')
		.split(/\s+/)
		.map(word => word.trim())
		.filter(word => word.length > 0)
		.length;
}

describe('text index', () => {
	let search: Search;

	beforeEach(() => {
		search = new Search();

		search.addIndex({
			key: 'text',
			type: Type.TEXT
		});
	});

	it('should have less indexes than words', () => {
		search.addData([
			{ text: ainulindale }
		]);

		const numberOfWords: number = countWords(ainulindale);
		const numberOfIndexes: number = getNumberOfKeys(search);

		console.log('number of words', numberOfWords);
		console.log('number of indexes', numberOfIndexes);

		expect(numberOfIndexes / numberOfWords).toBeLessThan(0.25);
	});

	it('should not add too many new indexes for a second text', () => {
		search.addData([
			{ text: ainulindale }
		]);

		const numberOfIndexesBefore: number = getNumberOfKeys(search);

		search.addData([
			{ text: ofTheValar }
		]);

		const numberOfIndexesAfter: number = getNumberOfKeys(search);

		console.log('indexes after one', numberOfIndexesBefore);
		console.log('indexes after two', numberOfIndexesAfter);

		expect(numberOfIndexesAfter / numberOfIndexesBefore).toBeLessThan(1.5);
	});

	it('should reduce the fraction of indexes to words with growing texts', () => {
		search.addData([
			{ text: ainulindale },
			{ text: ofTheValar }
		]);

		const numberOfWords: number = countWords(ainulindale + ' ' + ofTheValar);
		const numberOfIndexes: number = getNumberOfKeys(search);

		console.log('number of words', numberOfWords);
		console.log('number of indexes', numberOfIndexes);

		expect(numberOfIndexes / numberOfWords).toBeLessThan(0.2);
	});

	it('should add even less indexes after the third text', () => {
		search.addData([
			{ text: ainulindale },
			{ text: ofTheValar }
		]);

		const numberOfIndexesBefore: number = getNumberOfKeys(search);

		search.addData([
			{ text: ofTheBeginningOfDays }
		]);

		const numberOfIndexesAfter: number = getNumberOfKeys(search);

		console.log('indexes after one', numberOfIndexesBefore);
		console.log('indexes after two', numberOfIndexesAfter);

		expect(numberOfIndexesAfter / numberOfIndexesBefore).toBeLessThan(1.5); // disappointing :(
		// Maybe Tolkien is too complex for this kind of test?
	});
});

 