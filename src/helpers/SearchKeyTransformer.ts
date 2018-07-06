import { Type } from '../types/Type.enum';
import { DATE_FORMAT } from '../constants/DATE_FORMAT';
import * as moment from 'moment';
import { Moment } from 'moment';

declare type TransformerFunction = (value: any) => string[];

declare type Transformers = {
	[key: string]: TransformerFunction;
}

export class SearchKeyTransformer {
	private static readonly transformers: Transformers = {
		[Type.WORD]: (value: string) => {
			if (!value || value.trim().length === 0) {
				return [];
			}

			return [value.toLowerCase()];
		},
		[Type.TEXT]: (value: string) => {
			if (!value || value.trim().length === 0) {
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

			const n: number = Number(value);
			if (isNaN(n)) {
				return [];
			}

			return [n.toString()];
		},
		[Type.DATE]: (value: Date | Moment | string) => {
			if (value == null) {
				return [];
			}

			if (moment.isDate(value)) {
				return [moment(value).format(DATE_FORMAT)];
			} else if (moment.isMoment(value)) {
				return [value.format(DATE_FORMAT)]
			} else {
				const m: Moment = moment(value, DATE_FORMAT);
				if (m.isValid()) {
					return [m.format(DATE_FORMAT)];
				}

				return [];
			}
		}
	}

	static transform(type: Type, value: any) {
		return SearchKeyTransformer.transformers[type](value);
	}

	static canTransform(type: Type) {
		return SearchKeyTransformer.transformers.hasOwnProperty(type);
	}
}
