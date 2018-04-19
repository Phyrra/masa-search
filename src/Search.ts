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
import { SortArray, SortMomentArray, SortNumberArray } from './helpers/SortArray';

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
			.replace(/[^a-z\s]/g, ' ')
			.split(/\s+/)
			.filter(word => word.length > 0);
	},
	[Type.NUMBER]: (value: number | string) => {
		if (value == null) {
			return [];
		}

		return [String(value)];
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

declare type ListKeyExtractorFunction = (arr: SortArray<any>, reference: any) => any[];

declare type ListKeyExtractors = {
	[key: string]: ListKeyExtractorFunction;
}

const listKeyExtractors: ListKeyExtractors = {
	[Match.GT]: (arr: SortArray<any>, reference: string) => arr.getBiggerThanTransformed(reference),
	[Match.LT]: (arr: SortArray<any>, reference: string) => arr.getSmallerThanTransformed(reference),
	[Match.GTE]: (arr: SortArray<any>, reference: string) => arr.getBiggerEqualsToTransformed(reference),
	[Match.LTE]: (arr: SortArray<any>, reference: string) => arr.getSmallerEqualsToTransformed(reference)
};

interface WrappedItem {
	id: string;
	item: any;
}

interface IndexedData {
	[key: string]: WrappedItem[];
}

interface IndexObj {
	indexed: IndexedData;
	sorted: SortArray<any> | null;
}

interface IndexMap {
	[key: string]: IndexObj
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
						const getSortedArray: (type: Type) => SortArray<any> | null = (type) => {
							switch (type) {
								case Type.NUMBER:
									return new SortNumberArray();
								case Type.DATE:
									return new SortMomentArray(DATE_FORMAT, 'day');
								default:
									return null;
							}
						};

						this._indexedData[index.key] = {
							indexed: {},
							sorted: getSortedArray(index.type)
						};
					}

					const indexObj: IndexObj = this._indexedData[index.key];

					if (!indexObj.indexed.hasOwnProperty(key)) {
						indexObj.indexed[key] = [];
					}

					indexObj.indexed[key].push(wrappedItem);
					if (indexObj.sorted != null) {
						indexObj.sorted.pushTransformed(key);
					}
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

	private _extractMatchingResults(query: Condition, value: string, indexedData: IndexObj): WrappedItem[][] {
		const match: Match = query.match || Match.EQ;

		switch (match) {
			case Match.EQ:
				return [indexedData.indexed[value]];
			case Match.FUZZY:
				const fuzzyEval: (value: string) => boolean = (key: string) => {
					const maxAllowedDistance = getMaxAllowedDistance(key, value);

					return levenshtein(key, value) <= maxAllowedDistance;
				};

				return Object.keys(indexedData.indexed)
					.filter(key => fuzzyEval(key))
					.map(key => indexedData.indexed[key]);
			case Match.GT:
			case Match.GTE:
			case Match.LT:
			case Match.LTE:
				const arr: SortArray<any> | null = indexedData.sorted;
				if (arr == null) {
					throw new Error(`Type ${query.index.type} has no sorted array for ${match}`);
				}

				return listKeyExtractors[match](arr, value)
					.map(key => indexedData.indexed[key]);
			default:
				throw new Error(`Unknown matcher ${query.match}`);
		}
	}

	private _findSingleQueryResult(query: Condition): ResultMap {
		if (!transformers.hasOwnProperty(query.index.type)) {
			throw new Error(`Unknown type ${query.index.type}`);
		}

		const indexedData: IndexObj = this._indexedData[query.index.key];
		if (!indexedData) {
			return {};
		}

		const values: string[] = transformers[query.index.type](query.value);

		const valueResults: any[] = [];

		values.forEach(value => {
			const innerResults: ResultMap = {};

			this._extractMatchingResults(query, value, indexedData)
				.filter(partialResult => !!partialResult)
				.forEach(partialResult => {
					partialResult.forEach(result => {
						innerResults[result.id] = result.item;
					});
				});

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
