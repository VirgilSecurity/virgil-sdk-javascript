import typescript from 'rollup-plugin-typescript2';
import replace from 'rollup-plugin-replace';

export default config => {
	return {
		input: 'src/index.ts',
		output: config.output,
		watch: {
			include: 'src/**/*.ts',
		},
		plugins: [
			typescript({
				useTsconfigDeclarationDir: true,
				tsconfigOverride: {
					compilerOptions: {
						module: 'es2015'
					}
				}
			}),
			replace({ 'process.browser': JSON.stringify(Boolean(config.browser)) })
		].concat(config.plugins || [])
	};
};
