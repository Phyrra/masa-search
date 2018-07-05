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

## Node

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

## TypeScript

The module was written in TypeScript and comes with its own types.
```
import * from 'masa-search';

const search = new Search();

...
```

API
===

## addIndex

Add an index definition. All indexes should be added before adding data.
Already processed data will not be re-indexed, unless manually triggered.

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

## addData

Add new data for future searches. The data can be anything and nested as is required.

## reIndex

Clears the current indexed data store and re-indexes all data.

## find

Find a set of results, based on the provided search query.

### Query

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

The query should only ever have one of the keys filled and can be nested as required.

### Condition

```
interface Condition {
	index: Index,
	match ?: Match,
	value: any
}
```

*	`index` being the index, see definition above

*	`match` being the match type where `Match` is an enum of
	```
	enum Match {
		EQ = '=',
		GT = '>',
		LT = '<',
		GTE = '>=',
		LTE = '<=',
		FUZZY = 'fuzzy',
		PREFIX = 'prefix',
		WILDCARD = 'wildcard'
	}
	```

*	`value` being the value that should be compared against

#### FUZZY

The `FUZZY` search matches words with an auto-determined maximum distance.

* up to 4 letters: 1
* up to 8 letters: 2
* longer words: 4

#### WILDCARD

The `WILDCARD` search mathes exact words supporting wildcards.

* `.` a single character wildcard
* `?` the previous character is not required, but may occur
* `+` the previous character may occur repeatedly, but at least once
* `*` the previous character may occur repeatedly or not at all
* `[]` defines a selection of characters, example: `[ab]` matches either a or b
	* `[^]` defines a negative selection of characters, example: `[^ab]` matches everything except a and b
	* `[-]` defines a range, example: `[a-d]` matches every character between a and d

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
