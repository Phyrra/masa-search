module.exports = function(config) {
	config.set({
		frameworks: [
			'jasmine',
			'karma-typescript'
		],
		files: [
			'src/**/*.ts',
			'specs/**/*.ts'
		],
		preprocessors: {
			'**/*.ts': 'karma-typescript'
		},
		reporters: [
			'progress',
			'karma-typescript'
		],
		browsers: [
			'ChromeHeadless'
		],
		customLaunchers: {
			ChromeHeadless: {
				base: 'Chrome',
				flags: [
					'--headless',
					'--no-sandbox',
					'--disable-gpu',
					'--remote-debugging-port=9222'
				]
			}
		},
		singleRun: true
	});
};