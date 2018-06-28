export function doTimed(fnc: Function, name: string, log: boolean = false): number {
	const start: number = Date.now();
	fnc();
	const stop: number = Date.now();

	const duration: number = stop - start;

	if (log) {
		console.log(name, duration);
	}

	return duration;
}
