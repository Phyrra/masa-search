function formatObj(json: any, indent: number): string[] {
	const baseIndentation: string = '\t'.repeat(indent);
	const valueIndentation: string = '\t'.repeat(indent + 1);

	const keys: string[] = Object.keys(json);
	const objLines = keys
		.map((key, idx) => {
			const lead: string = valueIndentation + '"' + key + '": ';

			const value: string = json[key];
			
			let lines: string[];
			if (typeof value === 'number') {
				lines = [lead + value];
			} else if (typeof value === 'string') {
				lines = [lead + '"' + value + '"'];
			} else if (Array.isArray(value)) {
				const innerLines: string[] = formatArray(value, indent + 1);

				lines = [
					lead + innerLines[0].trim(),
					...innerLines.slice(1)
				];
			} else {
				const innerLines: string[] = formatObj(value, indent + 1);

				lines = [
					lead + innerLines[0].trim(),
					...innerLines.slice(1)
				];
			}

			if (idx < keys.length - 1) {
				lines[lines.length - 1] += ',';
			}

			return lines;
		})
		.reduce((arr, val) => arr.concat(val), []);

	if (objLines.length === 0) {
		return ['{}'];
	}

	return [
		baseIndentation + '{',
		...objLines,
		baseIndentation + '}'
	];
}

function formatArray(json: any[], indent: number): string[] {
	const baseIndentation: string = '\t'.repeat(indent);
	const valueIndentation: string = '\t'.repeat(indent + 1);

	const arrLines: string[] = json
		.map((value, idx) => {
			let lines: string[];

			if (typeof value === 'number') {
				lines = [valueIndentation + value];
			} else if (typeof value === 'string') {
				lines = [valueIndentation + '"' + value.replace(/\r?\n/g, '\\n') + '"'];
			} else if (Array.isArray(value)) {
				lines = formatArray(value, indent + 1);
			} else {
				lines = formatObj(value, indent + 1);
			}

			if (idx < json.length - 1) {
				lines[lines.length - 1] += ',';
			}

			return lines;
		})
		.reduce((arr, val) => arr.concat(val), []);

	if (arrLines.length === 0) {
		return ['[]'];
	}

	return [
		baseIndentation + '[',
		...arrLines,
		baseIndentation + ']'
	];
}

export function formatJson(json: any) {
	let lines: string[];

	if (typeof json === 'number') {
		lines = [json.toString()];
	} else if (typeof json === 'string') {
		lines = ['"' + json.replace(/\r?\n/g, '\\n').replace(/"/g, '\\"') + '"'];
	} else if (Array.isArray(json)) {
		lines = formatArray(json, 0);
	} else {
		lines = formatObj(json, 0);
	}

	return lines.join('\n');
}