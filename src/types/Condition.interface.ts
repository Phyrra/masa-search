import { Index } from "./Index.interface";
import { Match } from "./Match.enum";

export interface Condition {
	index: Index;
	match?: Match;
	value: any;
}
