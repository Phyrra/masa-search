import { Moment, unitOfTime } from 'moment';
import * as moment from 'moment';

export declare type ArrayComparatorFunction<T> = (a: T, b: T) => boolean;

interface FindResult {
	found: boolean;
	index: number;
}

export abstract class SortArray<T> {
	private _data: T[] = [];

	constructor(
		private _biggerThan: ArrayComparatorFunction<T>,
		private _smallerThan: ArrayComparatorFunction<T>
	) {}

	push(value: T): void {
		const peek: FindResult = this._find(value);
		if (peek.found) {
			return;
		}

		this._data.splice(peek.index, 0, value);
	}

	private _find(value: T): FindResult {
		if (this._data.length === 0) {
			return {
				found: false,
				index: 0
			}
		};

		let minIndex: number = 0;
		let maxIndex: number = this._data.length - 1;
		let currentIndex: number = 0;
		let currentElement: T = this._data[0];

		while (minIndex <= maxIndex) {
			currentIndex = (minIndex + maxIndex) / 2 | 0;
			currentElement = this._data[currentIndex];

			if (this._smallerThan(currentElement, value)) {
				minIndex = currentIndex + 1;
			} else if (this._biggerThan(currentElement, value)) {
				maxIndex = currentIndex - 1;
			} else {
				return {
					found: true,
					index: currentIndex
				};
			}
		}

		return {
			found: false,
			index: this._smallerThan(currentElement, value) ? currentIndex + 1 : currentIndex
		};
	}

	getAll(): T[] {
		return this._data.slice(0);
	}

	getBiggerThan(value: T): T[] {
		let startIdx: number;

		const peek: FindResult = this._find(value);
		if (peek.found) {
			startIdx = peek.index + 1;
		} else {
			startIdx = peek.index;
		}

		return this._data.slice(startIdx);
	}

	getSmallerThan(value: T): T[] {
		const peek: FindResult = this._find(value);

		return this._data.slice(0, peek.index);
	}

	getBiggerEqualsTo(value: T): T[] {
		const peek: FindResult = this._find(value);

		return this._data.slice(peek.index);
	}

	getSmallerEqualsTo(value: T): T[] {
		let stopIdx: number;

		const peek: FindResult = this._find(value);

		if (peek.found) {
			stopIdx = peek.index;
		} else {
			stopIdx = peek.index - 1;
		}

		return this._data.slice(0, stopIdx + 1);
	}

	abstract pushTransformed(value: string): void;
	abstract getAllTransformed(): string[];
	abstract getBiggerThanTransformed(value: string): string[];
	abstract getSmallerThanTransformed(value: string): string[];
	abstract getBiggerEqualsToTransformed(value: string): string[];
	abstract getSmallerEqualsToTransformed(value: string): string[];
}

export class SortNumberArray extends SortArray<number> {
	constructor() {
		super(
			(a: number, b: number) => a > b,
			(a: number, b: number) => a < b
		);
	}

	private _transform(values: number[]): string[] {
		return values.map(elem => String(elem));
	}

	pushTransformed(value: string): void {
		super.push(Number(value));
	}

	getAllTransformed(): string[] {
		return this._transform(
			super.getAll()
		);
	}

	getBiggerThanTransformed(value: string): string[] {
		return this._transform(
			super.getBiggerThan(Number(value))
		);
	}

	getSmallerThanTransformed(value: string): string[] {
		return this._transform(
			super.getSmallerThan(Number(value))
		);
	}

	getBiggerEqualsToTransformed(value: string): string[] {
		return this._transform(
			super.getBiggerEqualsTo(Number(value))
		);
	}

	getSmallerEqualsToTransformed(value: string): string[] {
		return this._transform(
			super.getSmallerEqualsTo(Number(value))
		);
	}
}

export class SortMomentArray extends SortArray<Moment> {
	constructor(private dateFormat: string, granularity: unitOfTime.StartOf) {
		super(
			(a: Moment, b: Moment) => a.isAfter(b, granularity),
			(a: Moment, b: Moment) => a.isBefore(b, granularity)
		);
	}

	private _transform(values: Moment[]): string[] {
		return values.map(elem => elem.format(this.dateFormat));
	}

	pushTransformed(value: string): void {
		super.push(moment(value, this.dateFormat));
	}

	getAllTransformed(): string[] {
		return this._transform(
			super.getAll()
		);
	}

	getBiggerThanTransformed(value: string): string[] {
		return this._transform(
			super.getBiggerThan(moment(value, this.dateFormat))
		);
	}

	getSmallerThanTransformed(value: string): string[] {
		return this._transform(
			super.getSmallerThan(moment(value, this.dateFormat))
		);
	}

	getBiggerEqualsToTransformed(value: string): string[] {
		return this._transform(
			super.getBiggerEqualsTo(moment(value, this.dateFormat))
		);
	}

	getSmallerEqualsToTransformed(value: string): string[] {
		return this._transform(
			super.getSmallerEqualsTo(moment(value, this.dateFormat))
		);
	}
}
