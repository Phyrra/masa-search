import * as moment from 'moment';
import { Moment } from 'moment';
import * as  _ from 'lodash';
import { guid } from './guid';
import { Type } from './Type.enum';
import { Match } from './Match.enum';
import { Index } from './Index.interface';

const DATE_FORMAT: string = 'YYYY-MM-DD';

const transformers: { [key: string]: (value: any) => string[] } = {
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
	[Type.NUMBER]: (value: number) => {
		if (value == null) {
			return [];
		}

		return [value.toString()];
	},
	[Type.DATE]: (value: Date) => {
		if (value == null) {
			return [];
		}

		return [moment(value).format(DATE_FORMAT)];
	}
}

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

	constructor() {
		this._indexes = [];
		this._indexedData = {};
	}

	addIndex(index: Index): Search {
		this._indexes.push(index);

		return this;
	}

	addData(data: any[]): Search {
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

	private _extractMatchingResults(query: any /* TODO */, value: string, indexedData: IndexedData): WrappedItem[] {
		if (query.index.type === Type.WORD || query.index.type === Type.TEXT || query.match === Match.EQ) {
			return indexedData[value];
		}

		let partialResults: WrappedItem[] = [];

		switch (query.index.type) {
			case Type.NUMBER:
				const numValue: number = Number(value);

				Object.keys(indexedData)
					.forEach(key => {
						const number: number = Number(key);

						switch (query.match) {
							case Match.GT:
								if (number > numValue) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							case Match.LT:
								if (number < numValue) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							case Match.GTE:
								if (number >= numValue) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							case Match.LTE:
								if (number <= numValue) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							default:
								throw new Error(`Unknown matcher ${query.match}`);
						}
					});

				break;
			case Type.DATE:
				const dateValue: Moment = moment(value, DATE_FORMAT);

				Object.keys(indexedData)
					.forEach(key => {
						const date: Moment = moment(key, DATE_FORMAT);

						switch (query.match) {
							case Match.GT:
								if (date.isAfter(dateValue, 'day')) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							case Match.LT:
								if (date.isBefore(dateValue, 'day')) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							case Match.GTE:
								if (date.isSameOrAfter(dateValue, 'day')) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							case Match.LTE:
								if (date.isSameOrBefore(dateValue, 'day')) {
									partialResults = partialResults.concat(indexedData[key]);
								}

								break;
							default:
								throw new Error(`Unknown matcher ${query.match}`);
						}
					});

				break;
			default:
				throw new Error(`Unknown type ${query.index.type}`);
		}

		return partialResults;
	}

	private _findSingleQueryResult(query: any /* TODO */): ResultMap {
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
			const partialResults: WrappedItem[] = this._extractMatchingResults(query, value, indexedData);
			if (!partialResults || partialResults.length === 0) {
				return;	
			}

			const innerResults: ResultMap = {};

			partialResults.forEach(result => {
				innerResults[result.id] = result.item;
			});

			valueResults.push(innerResults);
		});
	
		return this._andCombine(valueResults);
	}

	private _findPartial(search: any /* TODO */): ResultMap {
		if (search.hasOwnProperty('condition')) {
			return this._findSingleQueryResult(search.condition);
		} else if (search.hasOwnProperty('and')) {
			return this._andCombine(
				search.and.map((condition: any /* TODO */) => {
					return this._findPartial(condition);
				})
			);
		} else if (search.hasOwnProperty('or')) {
			return this._orCombine(
				search.or.map((condition: any /* TODO */) => {
					return this._findPartial(condition);
				})
			);
		}

		throw new Error('Search should have one of [condition, and, or]');
	}

	find(search: any /* TODO */): any[] {
		const results: ResultMap = this._findPartial(search);

		return Object.keys(results)
			.map(key => results[key]);
	}
}
