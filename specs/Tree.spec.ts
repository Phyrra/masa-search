import { NumberTree } from '../src/tree/NumberTree';

describe('NumberTree', () => {
	let tree: NumberTree;

	beforeEach(() => {
		tree = new NumberTree();

		[17, 25, 3, 19, 8, 1, 22, 5, 19]
			.forEach(val => tree.add(val));
	});

	describe('smaller than', () => {
		it('should extract all numbers smaller than a reference', () => {
			expect(tree.getSmallerElements(20))
				.toEqual([17, 3, 1, 8, 5, 19]);
		});
	
		it('should not extract numbers equal to the reference', () => {
			expect(tree.getSmallerElements(19))
				.toEqual([17, 3, 1, 8, 5]);
		});
	});

	describe('smaller than or equal to', () => {
		it('should extract numbers equal to the reference', () => {
			expect(tree.getSmallerEqualsElements(19))
				.toEqual([17, 3, 1, 8, 5, 19]);
		});
	});

	describe('bigger than', () => {
		it('should extract all numbers bigger than a reference', () => {
			expect(tree.getBiggerElements(20))
				.toEqual([25, 22]);
		});
	
		it('should not extract numbers equal to the reference', () => {
			expect(tree.getBiggerElements(19))
				.toEqual([25, 22]);
		});
	});

	describe('bigger than or equal to', () => {
		it('should extract numbers equal to the reference', () => {
			expect(tree.getBiggerEqualsElements(19))
				.toEqual([25, 19, 22]);
		});
	});
});