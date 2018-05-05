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
});