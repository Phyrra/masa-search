import { Search } from '../src/Search';
import { Type } from '../src/types/Type.enum';
import { Query } from '../src/types/Query.interface';
import { Index } from '../src/types/Index.interface';
import { Match } from '../src/types/Match.enum';

describe('Search', () => {
	let search;

	const data: any[] = [
		{
			name: 'Alice',
			age: 30,
			birthday: new Date(1988, 0, 1),
			comment: 'She is cool'
		},
		{
			name: 'Beat',
			age: 25,
			birthday: new Date(1993, 0, 1),
			comment: 'He is cool'
		},
		{
			name: 'Charlie',
			age: 35,
			birthday: new Date(1983, 0, 1),
			comment: 'She is cool too'
		}
	];

	beforeEach(() => {
		search = new Search();
	});

	describe('addIndex()', () => {
		it('should have an empty list of indexes initially', () => {
			expect(search['_indexes']).toEqual([]);
		});

		it('should push an index to the list', () => {
			const index: Index = {
				key: 'name',
				type: Type.WORD
			};

			search.addIndex(index);

			expect(search['_indexes']).toEqual([index]);
		});
	});

	describe('addData()', () => {
		describe('word', () => {
			const index: Index = {
				key: 'name',
				type: Type.WORD
			};

			beforeEach(() => {
				search.addIndex(index);
				search.addData(data);
			});

			it('should have created a new index entry', () => {
				expect(search['_indexedData']['name']).toEqual(jasmine.any(Object));
			});

			it('should have indexed values', () => {
				const indexed: any = search['_indexedData']['name'].indexed;

				expect(
					Object.keys(indexed).sort()
				).toEqual(['alice', 'beat', 'charlie']);
			});

			it('should not have created a sorted array', () => {
				expect(search['_indexedData']['name'].sorted).toBeNull();
			});

			it('should have set the entries to their indexes', () => {
				const indexed: any = search['_indexedData']['name'].indexed;

				expect(indexed['alice'].map(elem => elem.item)).toEqual([data[0]]);
				expect(indexed['beat'].map(elem => elem.item)).toEqual([data[1]]);
				expect(indexed['charlie'].map(elem => elem.item)).toEqual([data[2]]);
			});

			it('should put a new data entry to the same index', () => {
				const newPerson: any = {
					name: 'Alice',
					age: 40
				};

				search.addData([newPerson]);

				const indexed: any = search['_indexedData']['name'].indexed;

				expect(indexed['alice'].map(elem => elem.item)).toEqual([data[0], newPerson]);
			});
		});

		describe('text', () => {
			const index: Index = {
				key: 'comment',
				type: Type.TEXT
			};

			beforeEach(() => {
				search.addIndex(index);
				search.addData(data);
			});

			it('should have created a new index entry', () => {
				expect(search['_indexedData']['comment']).toEqual(jasmine.any(Object));
			});

			it('should have indexed all words', () => {
				const indexed: any = search['_indexedData']['comment'].indexed;

				expect(
					Object.keys(indexed).sort()
				).toEqual(['cool', 'he', 'is', 'she', 'too']);
			});

			it('should not have created a sorted array', () => {
				expect(search['_indexedData']['comment'].sorted).toBeNull();
			});

			it('should have set the entries to their indexes', () => {
				const indexed: any = search['_indexedData']['comment'].indexed;

				expect(indexed['cool'].map(elem => elem.item)).toEqual([data[0], data[1], data[2]]);
				expect(indexed['he'].map(elem => elem.item)).toEqual([data[1]]);
				expect(indexed['is'].map(elem => elem.item)).toEqual([data[0], data[1], data[2]]);
				expect(indexed['she'].map(elem => elem.item)).toEqual([data[0], data[2]]);
				expect(indexed['too'].map(elem => elem.item)).toEqual([data[2]]);
			});
		});

		describe('number', () => {
			const index: Index = {
				key: 'age',
				type: Type.NUMBER
			};

			beforeEach(() => {
				search.addIndex(index);
				search.addData(data);
			});

			it('should have created a new index entry', () => {
				expect(search['_indexedData']['age']).toEqual(jasmine.any(Object));
			});

			it('should have indexed all values', () => {
				const indexed: any = search['_indexedData']['age'].indexed;

				expect(
					Object.keys(indexed).map(key => Number(key)).sort()
				).toEqual([25, 30, 35]);
			});

			it('should have added all values in sorted order', () => {
				const arr: any = search['_indexedData']['age'].sorted;

				expect(
					arr.getAll()
				).toEqual([25, 30, 35]);
			});

			it('should have set the entries to their indexes', () => {
				const indexed: any = search['_indexedData']['age'].indexed;

				expect(indexed['25'].map(elem => elem.item)).toEqual([data[1]]);
				expect(indexed['30'].map(elem => elem.item)).toEqual([data[0]]);
				expect(indexed['35'].map(elem => elem.item)).toEqual([data[2]]);
			});
		});

		describe('date', () => {
			const index: Index = {
				key: 'birthday',
				type: Type.DATE
			};

			beforeEach(() => {
				search.addIndex(index);
				search.addData(data);
			});

			it('should have created a new index entry', () => {
				expect(search['_indexedData']['birthday']).toEqual(jasmine.any(Object));
			});

			it('should have indexed all values', () => {
				const indexed: any = search['_indexedData']['birthday'].indexed;

				expect(
					Object.keys(indexed).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
				).toEqual(['1983-01-01', '1988-01-01', '1993-01-01']);
			});

			it('should have added all values in sorted order', () => {
				const sorted: any = search['_indexedData']['birthday'].sorted;

				expect(
					sorted.getAll().map(date => date.get('year'))
				).toEqual([1983, 1988, 1993]);
			});

			it('should have set the entries to their indexes', () => {
				const indexed: any = search['_indexedData']['birthday'].indexed;

				expect(indexed['1983-01-01'].map(elem => elem.item)).toEqual([data[2]]);
				expect(indexed['1988-01-01'].map(elem => elem.item)).toEqual([data[0]]);
				expect(indexed['1993-01-01'].map(elem => elem.item)).toEqual([data[1]]);
			});
		});
	});

	describe('reIndex()', () => {
		const index: Index = {
			key: 'name',
			type: Type.WORD
		};

		const newPerson: any = {
			name: 'Alice',
			age: 40
		};

		beforeEach(() => {
			search.addData([newPerson]);

			search.addIndex(index);
			search.addData(data);
		});

		it('should not have indexed old data', () => {
			const indexed: any = search['_indexedData']['name'].indexed;

			expect(indexed['alice'].map(elem => elem.item)).toEqual([data[0]]);
		});

		it('should have indexed all data', () => {
			search.reIndex();

			const indexed: any = search['_indexedData']['name'].indexed;

			expect(indexed['alice'].map(elem => elem.item)).toEqual([newPerson, data[0]]);
		});
	});

	describe('find()', () => {
		describe('single search', () => {
			describe('word search', () => {
				const index: Index = {
					key: 'name',
					type: Type.WORD
				};

				beforeEach(() => {
					search.addIndex(index);
					search.addData(data);
				});

				it('should not find inexistent element', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'Donald',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([]);
				});

				it('should find an existing element', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'Alice',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([data[0]]);
				});

				it('should find value case insensitive', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'bEaT',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([data[1]]);
				});
			});

			describe('text search', () => {
				const index: Index = {
					key: 'comment',
					type: Type.TEXT
				};

				beforeEach(() => {
					search.addIndex(index);
					search.addData(data);
				});

				it('should not find match for non existing word', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'uncool',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([]);
				});

				it('should find match for existing single word', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'He',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([data[1]]);
				});

				it('should find match for single word case insensitively', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'tOo',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([data[2]]);
				});

				it('should find match for two words', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'cool too',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([data[2]]);
				});

				it('should not find match for one out of two words', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'uncool too',
							match: Match.EQ
						}
					};

					expect(search.find(query)).toEqual([]);
				});
			});

			describe('number search', () => {
				const index: Index = {
					key: 'age',
					type: Type.NUMBER
				};

				const floatMatch: any = {
					name: 'Donald',
					age: 31.415,
					birthday: new Date(1986, 0, 1),
					comment: 'He is not this cool'
				};

				beforeEach(() => {
					search.addIndex(index);
					search.addData(data);
					search.addData([floatMatch]);
				});

				describe('equals', () => {
					it('should not find inexistent element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 20,
								match: Match.EQ
							}
						};

						expect(search.find(query)).toEqual([]);
					});

					it('should find integer match', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 35,
								match: Match.EQ
							}
						};

						expect(search.find(query)).toEqual([data[2]]);
					});

					it('should find a flaoting point number match', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 31.415,
								match: Match.EQ
							}
						};

						expect(search.find(query)).toEqual([floatMatch]);
					});
				});

				describe('greater than', () => {
					it('should find all elements greater than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 32,
								match: Match.GT
							}
						};

						expect(search.find(query)).toEqual([data[2]]);
					});

					it('should not find equals element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 30,
								match: Match.GT
							}
						};

						expect(
							search.find(query).map(elem => elem.age).sort()
						).toEqual([31.415, 35]);
					});
				});

				describe('greater than or equal to', () => {
					it('should find all elements greater than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 32,
								match: Match.GTE
							}
						};

						expect(search.find(query)).toEqual([data[2]]);
					});

					it('should find equals integer element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 30,
								match: Match.GTE
							}
						};

						expect(
							search.find(query).map(elem => elem.age).sort()
						).toEqual([30, 31.415, 35]);
					});

					it('should find equals floating point number element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 31.415,
								match: Match.GTE
							}
						};

						expect(
							search.find(query).map(elem => elem.age).sort()
						).toEqual([31.415, 35]);
					});
				});

				describe('less than', () => {
					it('should find all elements less than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 29,
								match: Match.LT
							}
						};

						expect(search.find(query)).toEqual([data[1]]);
					});

					it('should not find equals element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 30,
								match: Match.LT
							}
						};

						expect(search.find(query)).toEqual([data[1]]);
					});
				});

				describe('less than or equal to', () => {
					it('should find all elements less than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 29,
								match: Match.LTE
							}
						};

						expect(search.find(query)).toEqual([data[1]]);
					});

					it('should find equals integer element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 30,
								match: Match.LTE
							}
						};

						expect(
							search.find(query).map(elem => elem.age).sort()
						).toEqual([25, 30]);
					});

					it('should find equals floating point number element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: 31.415,
								match: Match.LTE
							}
						};

						expect(
							search.find(query).map(elem => elem.age).sort()
						).toEqual([25, 30, 31.415]);
					});
				});
			});

			describe('date search', () => {
				const index: Index = {
					key: 'birthday',
					type: Type.DATE
				};

				beforeEach(() => {
					search.addIndex(index);
					search.addData(data);
				});

				describe('equals', () => {
					it('should not find inexistent element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(2018, 0, 1),
								match: Match.EQ
							}
						};

						expect(search.find(query)).toEqual([]);
					});

					it('should find match', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1988, 0, 1),
								match: Match.EQ
							}
						};

						expect(search.find(query)).toEqual([data[0]]);
					});
				});

				describe('greater than', () => {
					it('should find elements greater than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1990, 0, 1),
								match: Match.GT
							}
						};

						expect(search.find(query)).toEqual([data[1]]);
					});

					it('should not find equals element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1988, 0, 1),
								match: Match.GT
							}
						};

						expect(search.find(query)).toEqual([data[1]]);
					});
				});

				describe('greater than or equal to', () => {
					it('should find elements greater than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1990, 0, 1),
								match: Match.GTE
							}
						};

						expect(search.find(query)).toEqual([data[1]]);
					});

					it('should find equals element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1988, 0, 1),
								match: Match.GTE
							}
						};

						expect(
							search.find(query).map(elem => elem.age).sort()
						).toEqual([25, 30]);
					});
				});

				describe('less than', () => {
					it('should find elements less than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1985, 0, 1),
								match: Match.LT
							}
						};

						expect(search.find(query)).toEqual([data[2]]);
					});

					it('should not find equals element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1988, 0, 1),
								match: Match.LT
							}
						};

						expect(search.find(query)).toEqual([data[2]]);
					});
				});

				describe('less than or equal to', () => {
					it('should find elements less than a value', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1985, 0, 1),
								match: Match.LTE
							}
						};

						expect(search.find(query)).toEqual([data[2]]);
					});

					it('should find equals element', () => {
						const query: Query = {
							condition: {
								index: index,
								value: new Date(1988, 0, 1),
								match: Match.LTE
							}
						};

						expect(
							search.find(query).map(elem => elem.age).sort()
						).toEqual([30, 35]);
					});
				});
			});
		});

		describe('prefix search', () => {
			const index: Index = {
				key: 'name',
				type: Type.WORD
			};

			const names: any[] = [
				{ name: 'Adam' },
				{ name: 'Adalbert' },
				{ name: 'Adonis' },
				{ name: 'Andrea' },
				{ name: 'Antonidas' }
			];

			beforeEach(() => {
				search.addIndex(index);
				search.addData(names);
			});

			it('should find all names starting with a prefix', () => {
				const query: Query = {
					condition: {
						index: index,
						value: 'ad',
						match: Match.PREFIX
					}
				};

				expect(search.find(query).map(result => result.name).sort())
					.toEqual(['Adalbert', 'Adam', 'Adonis']);
			});
		});

		describe('fuzzy search', () => {
			const index: Index = {
				key: 'name',
				type: Type.WORD
			};

			beforeEach(() => {
				search.addIndex(index);
				search.addData(data);
			});

			it('should find an exact match', () => {
				const query: Query = {
					condition: {
						index: index,
						value: 'Alice',
						match: Match.FUZZY
					}
				};

				expect(search.find(query)).toEqual([data[0]]);
			});

			it('should find a one-off match', () => {
				const query: Query = {
					condition: {
						index: index,
						value: 'Allice',
						match: Match.FUZZY
					}
				};

				expect(search.find(query)).toEqual([data[0]]);
			});
		});

		describe('wildcard search', () => {
			const index: Index = {
				key: 'name',
				type: Type.WORD
			};

			beforeEach(() => {
				search.addIndex(index);
				search.addData(data);
			});

			it('should find a wildcard match', () => {
				const query: Query = {
					condition: {
						index: index,
						value: 'Ali.e',
						match: Match.WILDCARD
					}
				};

				expect(search.find(query)).toEqual([data[0]]);
			});
		});

		describe('and combination', () => {
			const index1: Index = {
				key: 'name',
				type: Type.WORD
			};

			const index2: Index = {
				key: 'age',
				type: Type.NUMBER
			};

			beforeEach(() => {
				search.addIndex(index1);
				search.addIndex(index2);

				search.addData(data);
			});

			it('should find values where both conditions match', () => {
				const query: Query = {
					and: [
						{
							condition: {
								index: index1,
								value: 'Alice',
								match: Match.EQ
							}
						}, {
							condition: {
								index: index2,
								value: 30,
								match: Match.EQ
							}
						}
					]
				};

				expect(search.find(query)).toEqual([data[0]]);
			});

			it('should not find values where only one condition matches', () => {
				const query: Query = {
					and: [
						{
							condition: {
								index: index1,
								value: 'Alice',
								match: Match.EQ
							}
						}, {
							condition: {
								index: index2,
								value: 25,
								match: Match.EQ
							}
						}
					]
				};

				expect(search.find(query)).toEqual([]);
			});
		});

		describe('or combination', () => {
			const index1: Index = {
				key: 'name',
				type: Type.WORD
			};

			const index2: Index = {
				key: 'age',
				type: Type.NUMBER
			};

			beforeEach(() => {
				search.addIndex(index1);
				search.addIndex(index2);

				search.addData(data);
			});

			it('should find values where both conditions match', () => {
				const query: Query = {
					or: [
						{
							condition: {
								index: index1,
								value: 'Alice',
								match: Match.EQ
							}
						}, {
							condition: {
								index: index2,
								value: 25,
								match: Match.EQ
							}
						}
					]
				};

				expect(
					search.find(query).map(elem => elem.age).sort()
				).toEqual([25, 30]);
			});
		});
	});
});
