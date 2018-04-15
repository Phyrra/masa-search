export function levenshtein(a: string, b: string): number {
	if (a.length === 0) {
		return b.length;
	}

	if (b.length === 0) {
		return a.length
	}

	// swap to save some memory O(min(a,b)) instead of O(a)
	if (a.length > b.length) {
		let tmp: string = a;
		a = b;
		b = tmp;
	}
  
	let row: number[] = Array.apply(null, { length: a.length + 1 }).map(Number.call, Number);
  
	// fill in the rest
	let prev: number;
	let val: number;

	for (let i = 1; i <= b.length; ++i) {
		prev = i;

		for (let j = 1; j <= a.length; ++j) {
			if (b[i - 1] === a[j - 1]) {
				val = row[j - 1];		// match
			} else {
				val = Math.min(
					row[j-1] + 1,		// substitution
					Math.min(
						prev + 1,		// insertion
						row[j] + 1		// deletion
					)
				);
			}

			row[j - 1] = prev;
			prev = val;
		}

		row[a.length] = prev;
	}

	return row[a.length];
}

const maxLengths: any[] = [
	{ length: 4, dist: 1 },
	{ length: 8, dist: 2 },
	{ length: undefined, dist: 4 }
];

export function getMaxAllowedDistance(a: string, b: string): number {
	const maxLength = Math.max(a.length, b.length);

	let i = 0;
	while (i < maxLengths.length && maxLength > maxLengths[i].length) {
		++i;
	}

	return maxLengths[i].dist;
}
