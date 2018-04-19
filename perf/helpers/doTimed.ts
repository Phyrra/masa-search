export function doTimed(fnc: Function, name: string): number {
	const start: number = Date.now();
	fnc();
	const stop: number = Date.now();

	const duration: number = stop - start;
	console.log(name, duration);

	return duration;
}
