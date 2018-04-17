import { Tree } from "./Tree";

export class NumberTree extends Tree<number> {
	constructor() {
		super(
			(a: number, b: number) => a > b,
			(a: number, b: number) => a < b,
			(a: number, b: number) => a === b
		);
	}
}