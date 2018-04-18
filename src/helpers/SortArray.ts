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

	getAll() {
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
}

export class SortNumberArray extends SortArray<any> {
	constructor() {
		super(
			(a: number, b: number) => a > b,
			(a: number, b: number) => a < b
		);
	}

	push(value: string): void {
		super.push(Number(value));
	}

	getBiggerThan(value: string): string[] {
		return super.getBiggerThan(Number(value))
			.map(elem => String(elem));
	}

	getSmallerThan(value: string): string[] {
		return super.getSmallerThan(Number(value))
			.map(elem => String(elem));
	}

	getBiggerEqualsTo(value: string): string[] {
		return super.getBiggerEqualsTo(Number(value))
			.map(elem => String(elem));
	}

	getSmallerEqualsTo(value: string): string[] {
		return super.getSmallerEqualsTo(Number(value))
			.map(elem => String(elem));
	}
}

export class SortMomentArray extends SortArray<any> {
	constructor(private dateFormat: string, granularity: unitOfTime.StartOf) {
		super(
			(a: Moment, b: Moment) => a.isAfter(b, granularity),
			(a: Moment, b: Moment) => a.isBefore(b, granularity)
		);
	}

	push(value: string): void {
		super.push(moment(value, this.dateFormat));
	}

	getBiggerThan(value: string): string[] {
		return super.getBiggerThan(moment(value, this.dateFormat))
			.map(elem => elem.format(this.dateFormat));
	}

	getSmallerThan(value: string): string[] {
		return super.getSmallerThan(moment(value, this.dateFormat))
			.map(elem => elem.format(this.dateFormat));
	}

	getBiggerEqualsTo(value: string): string[] {
		return super.getBiggerEqualsTo(moment(value, this.dateFormat))
			.map(elem => elem.format(this.dateFormat));
	}

	getSmallerEqualsTo(value: string): string[] {
		return super.getSmallerEqualsTo(moment(value, this.dateFormat))
			.map(elem => elem.format(this.dateFormat));
	}
}
