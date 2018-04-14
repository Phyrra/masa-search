import * as fs from 'fs';
import * as path from 'path';
import { formatJson } from './formatJson';

export class Store {
	constructor(private dest: string) {}

	private _mkdir(filePath: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			if (fs.existsSync(filePath)) {
				resolve();
			} else {
				fs.mkdir(filePath, err => {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				});
			}
		});
	}
	
	private _writeFile(file: string, content: string): Promise<void> {
		const filePath = path.dirname(file);

		return this._mkdir(filePath)
			.then(() => {
				return new Promise<void>((resolve, reject) => {
					fs.writeFile(file, content, err => {
						if (err) {
							reject(err);
						} else {
							resolve();
						}
					});
				});
			});
	}

	private _readFile(file: string): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			if (!fs.existsSync(file)) {
				resolve({});
			} else {
				fs.readFile(file, 'utf8', (err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(JSON.parse(data));
					}
				});
			}
		});
	}

	store(content: any): Promise<void> {
		return this._writeFile(this.dest, formatJson(content));
	}

	retrieve(): Promise<any> {
		return this._readFile(this.dest);
	}
}