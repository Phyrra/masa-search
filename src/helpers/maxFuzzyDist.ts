const maxLengths: any[] = [
	{ length: 4, dist: 1 },
	{ length: 8, dist: 2 },
	{ length: undefined, dist: 4 }
];

export function getMaxAllowedDistance(s: string): number {
	let i = 0;
	while (i < maxLengths.length && s.length > maxLengths[i].length) {
		++i;
	}

	return maxLengths[i].dist;
}