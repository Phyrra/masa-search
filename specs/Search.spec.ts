import { Search } from '../src/Search';
import { Type } from '../src/Type.enum';
import { Query } from '../src/Query.interface';
import { Index } from '../src/Index.interface';
import { Match } from '../src/Match.enum';

describe('Search', () => {
	let search;

	beforeEach(() => {
		search = new Search();
	});

	describe('addIndex()', () => {

	});

	describe('addData()', () => {

	});

	describe('reIndex()', () => {

	});

	describe('find()', () => {
		const data = [
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
							value: 'Donald'
						}
					};

					expect(search.find(query)).toEqual([]);
				});
	
				it('should find an existing element', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'Alice'
						}
					};

					expect(search.find(query)).toEqual([data[0]]);
				});

				it('should find value case insensitive', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'bEaT'
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
							value: 'uncool'
						}
					};

					expect(search.find(query)).toEqual([]);
				});

				it('should find match for existing single word', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'He'
						}
					};

					expect(search.find(query)).toEqual([data[1]]);
				});

				it('should find match for single word case insensitively', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'tOo'
						}
					};

					expect(search.find(query)).toEqual([data[2]]);
				});

				it('should find match for two words', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'cool too'
						}
					};

					expect(search.find(query)).toEqual([data[2]]);
				});

				it('should not find match for one out of two words', () => {
					const query: Query = {
						condition: {
							index: index,
							value: 'uncool too'
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
	});
});