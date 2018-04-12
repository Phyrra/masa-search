const { guid } = require('./dist/guid');
const { Search } = require('./dist/Search');
const { Type } = require('./dist/Type.enum');
const { Match } = require('./dist/Match.enum');

module.exports = {
	guid: guid,
	Search: Search,
	Type: Type,
	Match: Match
}