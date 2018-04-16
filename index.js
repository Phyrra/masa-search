const { guid } = require('./dist/helpers/guid');
const { Search } = require('./dist/Search');
const { Type } = require('./dist/types/Type.enum');
const { Match } = require('./dist/types/Match.enum');

module.exports = {
	guid: guid,
	Search: Search,
	Type: Type,
	Match: Match
}