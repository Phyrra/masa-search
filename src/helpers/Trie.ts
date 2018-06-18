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

	findFuzzy(word: string, dist: number): string[] {
		return this._collectFuzzySubtree(this._root, word, dist, 0, '', 0, []);
	}

	private _collectFuzzySubtree(node: Node, word: string, maxDist: number, pos: number, path: string, dist: number, result: string[]): string[] {
		if (!node) {
			return result;
		}

		if (node.isWord) {
			if (Math.abs(pos - word.length) <= maxDist - dist) {
				result.push(path);
			}
		}

		let c: string;
		if (pos < word.length) {
			c = word.charAt(pos);
			this._collectFuzzySubtree(node.children[c], word, maxDist, pos + 1, path + c, dist, result);
		}

		if (dist < maxDist) {
			Object.keys(node.children)
				.filter(cc => cc !== c)
				.forEach(cc => {
					// Replace letter -> halloween / helloween
					this._collectFuzzySubtree(node.children[cc], word, maxDist, pos + 1, path + cc, dist + 1, result);

					// Additional letter -> halloween / hallloween
					this._collectFuzzySubtree(node.children[cc], word, maxDist, pos + 2, path + cc, dist + 1, result);

					// Leftout Letter -> halloween / haloween
					this._collectFuzzySubtree(node.children[cc], word, maxDist, pos, path + cc, dist + 1, result);
				});
		}


		return result;
	}

	findAllMatching(word: string): string[] {
        return this._collectWildcardSubtree(this._root, word, 0, '', [], {});
    }
    
    private _collectWildcardSubtree(node: Node, word: string, pos: number, path: string, result: string[], cache: { [key: string]: boolean}): string[] {
        if (!node) {
            return result;
        }
        
        const key = path + ' ' + pos;
        if (cache[key]) {
            return result;
        }
        cache[key] = true;
        
        if (pos >= word.length) {
            if (node.isWord) {
                result.push(path);
            }
            
            return result;
        }
        
        const c = word.charAt(pos);
        
        let nextC = null;
        if (pos < word.length - 1) {
            nextC = word.charAt(pos + 1);
        }
        
        let childrenToCheck;
        if (c === '.') {
            // any character
            childrenToCheck = Object.keys(node.children);
        } else {
            // current character
            childrenToCheck = [c];
        }
        
        if (nextC === '?' || nextC === '*') {
            // skip character
            this._collectWildcardSubtree(node, word, pos + 2, path, result, cache);
        }
        
        if (nextC === '?' || nextC === '+' || nextC === '*') {
            // use character once (the last time)
            childrenToCheck
                .forEach(cc => this._collectWildcardSubtree(node.children[cc], word, pos + 2, path + cc, result, cache));
        }
        
        if (nextC === '+' || nextC === '*') {
            // use character n times
            childrenToCheck
                .forEach(cc => this._collectWildcardSubtree(node.children[cc], word, pos, path + cc, result, cache));
        }
        
        if (nextC !== '?' && nextC !== '*' && nextC !== '+') {
            // normal, check character
            childrenToCheck
                .forEach(cc => this._collectWildcardSubtree(node.children[cc], word, pos + 1, path + cc, result, cache));
        }
        
        return result;
    }
}