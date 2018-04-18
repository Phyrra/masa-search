import { Condition } from './Condition.interface';

export interface Query {
	and?: Query[],
	or?: Query[],
	condition?: Condition
}
