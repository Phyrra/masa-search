import * as moment from 'moment';
import { Moment } from 'moment';
import * as  _ from 'lodash';
import { guid } from './helpers/guid';
import { Type } from './types/Type.enum';
import { Match } from './types/Match.enum';
import { Index } from './types/Index.interface';
import { Query } from './types/Query.interface';
import { Condition } from './types/Condition.interface';
import { getMaxAllowedDistance, levenshtein } from './helpers/levenshtein';

const DATE_FORMAT: string = 'YYYY-MM-DD';

declare type TransformerFunction = (value: any) => string[];

declare type Transformers = {
	[key: string]: TransformerFunction;
}

const transformers: Transformers = {
	[Type.WORD]: (value: string) => {
		if (!value) {
			return [];
		}

		return [value.toLowerCase()];
	},
	[Type.TEXT]: (value: string) => {
		if (!value) {
			return [];
		}

		return value.trim().toLowerCase()
			.split(/\s+/)
			.filter(word => word.length > 0);
	},
	[Type.NUMBER]: (value: number | string) => {
		if (value == null) {
			return [];
		}

		return [value.toString()];
	},
	[Type.DATE]: (value: Date | string) => {
		if (value == null) {
			return [];
		}

		if (value instanceof Date) {
			return [moment(value).format(DATE_FORMAT)];
		} else {
			return [moment(value, DATE_FORMAT).format(DATE_FORMAT)]
		}
	}
}

declare type EvaluatorFunction = (value: string) => boolean;

declare type ComparatorFunction = (reference: string) => EvaluatorFunction;

declare type TypeComparators = {
	[key: string]: ComparatorFunction;
}

declare type Comparators = {
	[key: string]: TypeComparators;
}

const comparators: Comparators = {
	[Match.GT]: {
		[Type.NUMBER]: (reference: string) => {
			const refVal: number = Number(reference);

			return (value: string) => Number(value) > refVal;
		},
		[Type.DATE]: (reference: string) => {
			const refVal: Moment = moment(reference, DATE_FORMAT);

			return (value: string) => moment(value, DATE_FORMAT).isAfter(refVal, 'day');
		}
	},
	[Match.GTE]: {
		[Type.NUMBER]: (reference: string) => {
			const refVal: number = Number(reference);

			return (value: string) => Number(value) >= refVal;
		},
		[Type.DATE]: (reference: string) => {
			const refVal: Moment = moment(reference, DATE_FORMAT);

			return (value: string) => moment(value, DATE_FORMAT).isSameOrAfter(refVal, 'day');
		}
	},
	[Match.LT]: {
		[Type.NUMBER]: (reference: string) => {
			const refVal: number = Number(reference);

			return (value: string) => Number(value) < refVal;
		},
		[Type.DATE]: (reference: string) => {
			const refVal: Moment = moment(reference, DATE_FORMAT);

			return (value: string) => moment(value, DATE_FORMAT).isBefore(refVal, 'day');
		}
	},
	[Match.LTE]: {
		[Type.NUMBER]: (reference: string) => {
			const refVal: number = Number(reference);

			return (value: string) => Number(value) <= refVal;
		},
		[Type.DATE]: (reference: string) => {
			const refVal: Moment = moment(reference, DATE_FORMAT);

			return (value: string) => moment(value, DATE_FORMAT).isSameOrBefore(refVal, 'day');
		}
	}
};

interface WrappedItem {
	id: string;
	item: any;
}

interface IndexedData {
	[key: string]: WrappedItem[]
}

interface IndexMap {
	[key: string]: IndexedData
}

interface ResultMap {
	[key: string]: any;
}

export class Search {
	private _indexes: Index[];
	private _indexedData: IndexMap;
	private _unindexedData: any[];

	constructor() {
		this._indexes = [];
		this._indexedData = {};
		this._unindexedData = [];
	}

	addIndex(index: Index): Search {
		this._indexes.push(index);

		return this;
	}

	addData(data: any[]): Search {
		this._unindexedData = this._unindexedData.concat(data);
		
		data.forEach(item => {
			const wrappedItem: WrappedItem = {
				id: guid(),
				item: item
			};

			this._indexes.forEach(index => {
				if (!transformers.hasOwnProperty(index.type)) {
					throw new Error(`Unknown type ${index.type}`);
				}

				const keys: string[] = transformers[index.type](_.get(item, index.key, null));

				keys.forEach(key => {
					if (!this._indexedData.hasOwnProperty(index.key)) {
						this._indexedData[index.key] = {};
					}

					const indexedData: IndexedData = this._indexedData[index.key];

					if (!indexedData.hasOwnProperty(key)) {
						indexedData[key] = [];
					}

					indexedData[key].push(wrappedItem);
				});
			});
		});

		return this;
	}

	reIndex() {
		this._indexedData = {};

		this.addData(this._unindexedData);
	}

	private _andCombine(singleResults: ResultMap[]): ResultMap {
		const endResults: ResultMap = {};

		if (singleResults.length === 0) {
			return endResults;
		}

		// The set can never be bigger than one of its elements
		const pivot: ResultMap = singleResults[0];

		Object.keys(pivot)
			.filter(id => {
				return singleResults.every(result => result[id]);
			})
			.forEach(id => endResults[id] = pivot[id]);

		return endResults;
	}

	private _orCombine(singleResults: ResultMap[]): ResultMap {
		const endResults: ResultMap = {};

		singleResults.forEach(result => {
			Object.keys(result)
				.forEach(id => endResults[id] = result[id]);
		});

		return endResults;
	}

	private _extractMatchingResults(query: Condition, value: string, indexedData: IndexedData): WrappedItem[] {
		const match: Match = query.match || Match.EQ;

		const extractor: (evalFnc: EvaluatorFunction) => WrappedItem[] = (evalFnc) => {
			return Object.keys(indexedData)
				.filter(key => evalFnc(key))
				.reduce((acc, key) => acc.concat(indexedData[key]), [] as WrappedItem[]);
		};

		switch (match) {
			case Match.EQ:
				return indexedData[value];
			case Match.FUZZY:
				const fuzzyEval: EvaluatorFunction = (key: string) => {
					const maxAllowedDistance = getMaxAllowedDistance(key, value);

					return levenshtein(key, value) <= maxAllowedDistance;
				};

				return extractor(fuzzyEval);
			case Match.GT:
			case Match.GTE:
			case Match.LT:
			case Match.LTE:
				const comparativeEval: EvaluatorFunction = comparators[match][query.index.type](value);

				return extractor(comparativeEval);
			default:
				throw new Error(`Unknown matcher ${query.match}`);
		}
	}

	private _findSingleQueryResult(query: Condition): ResultMap {
		if (!transformers.hasOwnProperty(query.index.type)) {
			throw new Error(`Unknown type ${query.index.type}`);
		}

		const indexedData: IndexedData = this._indexedData[query.index.key];
		if (!indexedData) {
			return {};
		}

		const values: string[] = transformers[query.index.type](query.value);

		const valueResults: any[] = [];

		values.forEach(value => {
			const innerResults: ResultMap = {};

			const partialResults: WrappedItem[] = this._extractMatchingResults(query, value, indexedData);
			if (partialResults && partialResults.length > 0) {
				partialResults.forEach(result => {
					innerResults[result.id] = result.item;
				});
			}

			valueResults.push(innerResults);
		});

		return this._andCombine(valueResults);
	}

	private _findPartial(search: Query): ResultMap {
		if (Object.keys(search).length !== 1) {
			throw new Error('Search should only have one of [condition, and, or]');
		}

		if (search.hasOwnProperty('condition') && search.condition) {
			return this._findSingleQueryResult(search.condition);
		} else if (search.hasOwnProperty('and') && search.and) {
			return this._andCombine(
				search.and.map(condition => {
					return this._findPartial(condition);
				})
			);
		} else if (search.hasOwnProperty('or') && search.or) {
			return this._orCombine(
				search.or.map(condition => {
					return this._findPartial(condition);
				})
			);
		}

		throw new Error('Search should have one valid definition of [condition, and, or]');
	}

	find(search: Query): any[] {
		const results: ResultMap = this._findPartial(search);

		return Object.keys(results)
			.map(key => results[key]);
	}
}
