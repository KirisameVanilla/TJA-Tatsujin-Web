import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function minifyJsonPlugin() {
  return {
    name: 'minify-json',
    apply: 'build',
    closeBundle() {
      // 1. 复制 alias.json 到 dist 目录
      const rootAlias = path.resolve(__dirname, 'alias.json');
      const publicDir = path.resolve(__dirname, 'dist');
      const publicAlias = path.join(publicDir, 'alias.json');
      if (fs.existsSync(rootAlias)) {
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        fs.copyFileSync(rootAlias, publicAlias);
      }

      // 2. 压缩 dist 下所有 json
      const files = fs.readdirSync(publicDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          const filePath = path.join(publicDir, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          const minified = JSON.stringify(JSON.parse(content));
          fs.writeFileSync(filePath, minified, 'utf-8');
        }
      });
    }
  };
}

export default {
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: './assets',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  plugins: [minifyJsonPlugin(), tailwindcss()],
  define: {
    global: 'globalThis'
  },
  resolve: {
    alias: {
      path: 'path-browserify',
      fs: false
    }
  }
};
