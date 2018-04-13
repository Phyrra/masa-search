Installation
============

The module is registered on [npmjs.org](https://www.npmjs.com/package/masa-search), to install run
```
npm i --save masa-search
```
or
```
yarn add masa-search
```

Usage
=====

### Node

Once installed, you can pull components from the module and use them in your code.
```
const { Search, Type, Match } = require('masa-search');

const search = new Search();

search.addIndex({
	key: 'name',
	type: Type.WORD
});

search.addData([
	{ name: 'Albert' },
	{ name: 'Berta' },
	{ name: 'Charlie' }
]);

console.log(
	search.find({
		condition: {
			index: {
				key: 'name',
				type: Type.WORD
			},
			match: Match.EQ,
			value: 'ALBERT'
		}
	})
);
```

### TypeScript

The module was written in TypeScript and comes with its own types.
```
import * from 'masa-search';

const search = new Search();

...
```

API
===

### addIndex

Add an index definition. All indexes have to be added before adding data.
Allready processed data will not be re-indexed upon completion (might be revisited in the future).

The index should match the following interface
```
interface Index {
	key: string;
	type: Type;
}
```

* 	`key` being the field to be indexed. The fields may be nested, refer to [_.get](https://lodash.com/docs#get).

* 	`type` being the description of how to index the field. `Type` is an enum of
	```
	enum Type {
		WORD = 'word',
		TEXT = 'text',
		NUMBER = 'number',
		DATE = 'date'
	}
	```

### addData

Add new data for future searches. The data can be anything and nested as is required.

### find

Find a set of results, based on the provided search query. The query can be any combination of and/or.
It should follow this structure
```
export interface Query {
	and?: Query[],
	or?: Query[],
	condition?: Condition
}
```

*	`and` will combine all queries with `&&`

*	`or` will combine all queries with `||`

*	`condition` is the final condition (stops recursion)
	It should match the following format
	```
	interface Condition {
		index: Index,
		match ?: Match,
		value: any
	}
	```

	*	`index` being the index, see definition above

	*	`match` being the match type (currently only used for `Type.Number` and `Type.Date`).
		`Match` is an enum of
		```
		enum Match {
			EQ = '=',
			GT = '>',
			LT = '<',
			GTE = '>=',
			LTE = '<='
		}
		```

The query should only ever have one of the keys filled.

Examples
========

```
const { Search, Type, Match } = require('../index');

const search = new Search();

search.addIndex({
	key: 'name',
	type: Type.WORD
});

search.addIndex({
	key: 'comment',
	type: Type.TEXT
});

search.addIndex({
	key: 'age',
	type: Type.NUMBER
})

search.addData([
	{ name: 'Albert', comment: 'He is cool', age: 25 },
	{ name: 'Berta', comment: 'She is cool', age: 50 },
	{ name: 'Charlie', comment: 'He is cool too', age: 35 }
]);

const query = {
	and: [
		{
			condition: {
				index: {
					key: 'age',
					type: Type.NUMBER
				},
				match: Match.GT,
				value: 30
			}
		}, {
			or: [
				{
					condition: {
						index: {
							key: 'comment',
							type: Type.TEXT
						},
						value: 'cool too'
					}
				}, {
					condition: {
						index: {
							key: 'name',
							type: Type.WORD
						},
						value: 'Albert'
					}
				}
			]
		}
	]
};

console.log(search.find(query));
```