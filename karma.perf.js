module.exports = function(config) {
	config.set({
		frameworks: [
			'jasmine',
			'karma-typescript'
		],
		files: [
			'src/**/*.ts',
			'perf/**/*.ts'
		],
		preprocessors: {
			'**/*.ts': 'karma-typescript'
		},
		reporters: [
			'progress'
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
		singleRun: true,
		captureTimeout: 60000,
		browserDisconnectTimeout: 60000,
		browserNoActivityTimeout: 60000,
		browserDisconnectTolerance: 1
	});
};
