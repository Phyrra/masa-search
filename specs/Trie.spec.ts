import { Trie } from '../src/helpers/Trie';

describe('Trie', () => {
	let trie: Trie;

	beforeEach(() => {
		trie = new Trie();
	});

	describe('findAllStartingWith()', () => {
		beforeEach(() => {
			trie.insert('hello');
			trie.insert('hell');
			trie.insert('halloween');
			trie.insert('helsinki');
		});

		it('should find all strings starting with a prefix', () => {
			expect(trie.findAllStartingWith('hel'))
				.toEqual(['hell', 'hello', 'helsinki']);
		});

		it('should yield an empty array for non existent prefix', () => {
			expect(trie.findAllStartingWith('hodl'))
				.toEqual([]);
		});
	});

	describe('findFuzzy()', () => {
		beforeEach(() => {
			trie.insert('halloween');
			trie.insert('hallo');
		});

		describe('exact matches', () => {
			it('should find exact match with 0 distance', () => {
				expect(trie.findFuzzy('halloween', 0))
					.toEqual(['halloween']);
			});

			it('should find exact match with 1 distance', () => {
				expect(trie.findFuzzy('halloween', 1))
					.toEqual(['halloween']);
			});

			it('should not find inexact match with 0 distance', () => {
				expect(trie.findFuzzy('helloween', 0))
					.toEqual([]);
			});
	
			it('should not find intermediary words', () => {
				expect(trie.findFuzzy('halloween', 0))
					.not.toContain('hallo');
			});

			it('should find too short word with otherwise exact match', () => {
				expect(trie.findFuzzy('hallowee', 1))
					.toEqual(['halloween']);
			});

			it('should find too long word with otherwise exact match', () => {
				expect(trie.findFuzzy('halloweeni', 1))
					.toEqual(['halloween']);
			});

			it('should not find too short word for 0 distance', () => {
				expect(trie.findFuzzy('hallowee', 0))
					.toEqual([]);
			});

			it('should not find too long word for 0 distance', () => {
				expect(trie.findFuzzy('halloweeni', 0))
					.toEqual([]);
			});
		});
		
		describe('replacement', () => {
			it('should find offset of 1', () => {
				expect(trie.findFuzzy('helloween', 1))
					.toEqual(['halloween']);
			});
	
			it('should not find too short word with offset of 1', () => {
				expect(trie.findFuzzy('hellowee', 1))
					.toEqual([]);
			});
	
			it('should not find too long word with offset of 1', () => {
				expect(trie.findFuzzy('helloweeni', 1))
					.toEqual([]);
			});
		});
		
		describe('additional letter', () => {
			it('should find word with one additional letter', () => {
				expect(trie.findFuzzy('hallloween', 1))
					.toEqual(['halloween']);
			});

			it('should not find too short word with one additional letter', () => {
				expect(trie.findFuzzy('halllowee', 1))
					.toEqual([]);
			});

			it('should not find too long word with one additional letter', () => {
				expect(trie.findFuzzy('hallloweeni', 1))
					.toEqual([]);
			});
		});

		describe('missing letter', () => {
			it('should find word with one missing letter', () => {
				expect(trie.findFuzzy('haloween', 1))
					.toEqual(['halloween']);
			});

			it('should not find too short word with one missing letter', () => {
				expect(trie.findFuzzy('halowee', 1))
					.toEqual([]);
			});

			it('should not find too long word with one missing letter', () => {
				expect(trie.findFuzzy('haloweeni', 1))
					.toEqual([]);
			});
		});
	});
});