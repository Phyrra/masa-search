interface Node {
	children: { [key: string]: Node };
	isWord: boolean;
}

export class Trie {
	private _root: Node;

	constructor() {
		this._root = {
			children: {},
			isWord: false
		};
	}

	insert(word: string): void {
		let node: Node = this._root;

		word.toLowerCase().split('')
			.forEach(c => {
				if (!Object.prototype.hasOwnProperty.call(node.children, c)) {
					node.children[c] = {
						children: {},
						isWord: false
					};
				}

				node = node.children[c];
			});

		node.isWord = true;
	}

	findAllStartingWith(prefix: string): string[] {
		let node: Node | undefined = prefix.toLowerCase().split('')
			.reduce((node: Node | undefined, c: string) => {
				if (!node) {
					return undefined;
				}

				return node.children[c];
			}, this._root);

		return this._collectSubtree(node, prefix, []);
	}

	private _collectSubtree(node: Node | undefined, word: string, result: string[]): string[] {
		if (!node) {
			return result;
		}

		if (node.isWord) {
			result.push(word);
		}

		Object.keys(node.children)
			.forEach(c => this._collectSubtree(node.children[c], word + c, result));

		return result;
	}
}