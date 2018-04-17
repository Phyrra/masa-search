import { Tree } from "./Tree";
import { Moment, unitOfTime } from "moment";

export class MomentTree extends Tree<Moment> {
	constructor(granularity: unitOfTime.StartOf) {
		super(
			(a: Moment, b: Moment) => a.isAfter(b, granularity),
			(a: Moment, b: Moment) => a.isBefore(b, granularity),
			(a: Moment, b: Moment) => a.isSame(b, granularity)
		);
	}
}