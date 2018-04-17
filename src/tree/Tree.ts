import { Node } from './Node.interface';
import { TreeComparator } from './TreeComparator.type';

export abstract class Tree<T> {
	private _root: Node<T> | null;

	constructor(
		private _biggerThan: TreeComparator<T>,
		private _smallerThan: TreeComparator<T>,
		private _equals: TreeComparator<T>
	) {
		this._root = null;
	}

	add(value: T) {
		if (this._root == null) {
			this._root = {
				value: value,
				left: null,
				right: null
			};

			return;
		}

		const iter = (node: Node<T>) => {
			if (this._smallerThan(value, node.value)) {
				if (node.left == null) {
					node.left = {
						value: value,
						left: null,
						right: null
					};
				} else {
					iter(node.left);
				}
			} else if (this._biggerThan(value, node.value)) {
				if (node.right == null) {
					node.right = {
						value: value,
						left: null,
						right: null
					};
				} else {
					iter(node.right);
				}
			}
		};

		iter(this._root);
	}

	private _collectCompleteSubtree(node: Node<T> | null, acc: T[]): T[] {
		if (node == null) {
			return [];
		}

		return acc
			.concat([node.value])
			.concat(this._collectCompleteSubtree(node.left, []))
			.concat(this._collectCompleteSubtree(node.right, []));
	}

	private _collectMatchingSubtree(
		node: Node<T> | null,
		acc: T[],
		value: T,
		doProgress: (a: T, b: T) => boolean,
		getProgressNode: (node: Node<T>) => Node<T> | null,
		doSkip: (a: T, b: T) => boolean,
		getSkipNode: (node: Node<T>) => Node<T> | null,
		withEquality: boolean
	) {
		const iter = (node: Node<T> | null, acc: T[]): T[] => {
			if (node == null) {
				return [];
			}

			if (doProgress(node.value, value)) {
				const add = (this._equals(node.value, value) && withEquality) || !this._equals(node.value, value) ?
					[node.value] :
					[];

				return acc
					.concat(add)
					.concat(this._collectCompleteSubtree(getProgressNode(node), []))
					.concat(iter(getSkipNode(node), []));
			}

			if (doSkip(node.value, value)) {
				return acc
					.concat(iter(getProgressNode(node), []));
			}

			return [];
		};

		return iter(node, acc);
	}

	private _getBiggerSubtree(value: T, withEquality: boolean) {
		return this._collectMatchingSubtree(
			this._root,
			[],
			value,
			(value, reference) => this._biggerThan(value, reference) || this._equals(value, reference),
			(node) => node.right,
			(value, reference) => this._smallerThan(value, reference),
			(node) => node.left,
			withEquality
		);
	}

	private _getSmallerSubtree(value: T, withEquality: boolean) {
		return this._collectMatchingSubtree(
			this._root,
			[],
			value,
			(value, reference) => this._smallerThan(value, reference) || this._equals(value, reference),
			(node) => node.left,
			(value, reference) => this._biggerThan(value, reference),
			(node) => node.right,
			withEquality
		);
	}

	getBiggerElements(value: T) {
		return this._getBiggerSubtree(value, false);
	}

	getBiggerEqualsElements(value: T) {
		return this._getBiggerSubtree(value, true);
	}

	getSmallerElements(value: T) {
		return this._getSmallerSubtree(value, false);
	}

	getSmallerEqualsElements(value: T) {
		return this._getSmallerSubtree(value, true);
	}
}