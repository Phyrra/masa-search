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

	describe('findAllMatching()', () => {
		beforeEach(() => {
			trie.insert('hello');
			trie.insert('hell');
			trie.insert('halloween');
			trie.insert('helsinki');
			trie.insert('halbert');
		});

		describe('.', () => {
			it('should find a wildcard character', () => {
				expect(trie.findAllMatching('h.lloween'))
					.toEqual(['halloween']);
			});

			it('should not match wildcard to missing character', () => {
				expect(trie.findAllMatching('ha.lloween'))
					.toEqual([]);
			});
		});

		describe('?', () => {
			it('should match a non-required wildcard to a missing character', () => {
				expect(trie.findAllMatching('ha.?lloween'))
					.toEqual(['halloween']);
			});

			it('should match a non-required wildcard to an existing character', () => {
				expect(trie.findAllMatching('h.?lloween'))
					.toEqual(['halloween']);
			});

			it('should match a selection of non-required characters to an existing character', () => {
				expect(trie.findAllMatching('ha?e?lloween'))
					.toEqual(['halloween']);
			});
		});

		describe('*', () => {
			it('should match multiple non-required wildcards', () => {
				expect(trie.findAllMatching('h.*ween'))
					.toEqual(['halloween']);
			});

			it('should match non-existing wildcards', () => {
				expect(trie.findAllMatching('hall.*oween'))
					.toEqual(['halloween']);
			});

			it('should match multiple non-required wildcards to existing and non-existing characters', () => {
				expect(trie.findAllMatching('hell.*'))
					.toEqual(['hell', 'hello']);
			});
		});

		describe('+', () => {
			it('should match multiple required wildcards', () => {
				expect(trie.findAllMatching('h.+ween'))
					.toEqual(['halloween']);
			});

			it('should not match required wildcards to non-existing characters', () => {
				expect(trie.findAllMatching('hallo.+ween'))
					.toEqual([]);
			});

			it('should match multiple required wildcards to existing characters', () => {
				expect(trie.findAllMatching('hell.+'))
					.toEqual(['hello']);
			});
		});

		describe('[]', () => {
			it('should match a selection of characters', () => {
				expect(trie.findAllMatching('h[ae]lloween'))
					.toEqual(['halloween']);
			});

			it('should match a range of characters', () => {
				expect(trie.findAllMatching('h[a-e]lloween'))
					.toEqual(['halloween']);
			});

			it('should match ranged character muliple times', () => {
				expect(trie.findAllMatching('h[a-z]+ween'))
					.toEqual(['halloween']);
			});

			it('should throw an error for unbalanced brackets', () => {
				expect(() => {
					trie.findAllMatching('h[aelloween')
				}).toThrow();
			});

			it('should throw an error for incomplete range', () => {
				expect(() => {
					trie.findAllMatching('h[a-]lloween')
				}).toThrow();
			});
		});

		describe('[^]', () => {
			it('should not match a selection of characters', () => {
				expect(trie.findAllMatching('h[^ae]lloween'))
					.toEqual([]);
			});

			it('should match where a selection of characters does not occur', () => {
				expect(trie.findAllMatching('h[^e]lloween'))
					.toEqual(['halloween']);
			});
		});
	});
});
