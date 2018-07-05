export class CharRangeExtractor {
	static getSetOfCharacters(group: string): { [key: string]: boolean } {
		const set: { [key: string]: boolean } = {};

		for (let i = 0; i < group.length; ++i) {
			const c: string = group.charAt(i);

			if (c === '-') {
				if (i === 0 || i === group.length - 1) {
					throw new Error(`Invalid range in ${group}`);
				}

				const start: number = group.charCodeAt(i - 1);
				const stop: number = group.charCodeAt(i + 1);

				// code at start has been added before
				// code at stop will be added in the next iteration
				for (let j = start + 1; j < stop; ++j) {
					set[String.fromCharCode(j)] = true;
				}

				continue;
			}

			set[group.charAt(i)] = true;
		}

		return set;
	}
}
