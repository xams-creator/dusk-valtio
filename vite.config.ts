import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({}),
        babel({ presets: [reactCompilerPreset()] }),
        dts({
            insertTypesEntry: true,
            include: ['src'],
            tsconfigPath: './tsconfig.app.json',
            rollupTypes: true,
            bundledPackages: [],
            compilerOptions: {
                'noEmit': false,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            src: path.resolve(__dirname, './src'),
        },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'DuskValtio',
            // 将添加适当的扩展名后缀
            fileName: 'dusk-valtio',
            formats: ['es', 'umd'],
        },
        rolldownOptions: {
            // 确保外部化处理那些
            // 你不想打包进库的依赖
            external: ['react', 'react-dom', 'lodash'],
            output: {
                // 在 UMD 构建模式下为这些外部化的依赖
                // 提供一个全局变量
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                },
            },
        },
    },
});
