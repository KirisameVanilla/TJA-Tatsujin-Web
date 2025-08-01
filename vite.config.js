import fs from 'fs';
import path from 'path';

function minifyJsonPlugin() {
  return {
    name: 'minify-json',
    apply: 'build',
    closeBundle() {
      // 1. 复制 alias.json 和 style.css 到 dist 目录
      const rootAlias = path.resolve(__dirname, 'alias.json');
      const rootCSS = path.resolve(__dirname, 'style.css');
      const publicDir = path.resolve(__dirname, 'dist');
      const publicAlias = path.join(publicDir, 'alias.json');
      const publicCSS = path.join(publicDir, 'style.css');
      if (fs.existsSync(rootAlias)) {
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        fs.copyFileSync(rootAlias, publicAlias);
      }
      if (fs.existsSync(rootCSS)) {
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        fs.copyFileSync(rootCSS, publicCSS);
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
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: './assets'
  },
  plugins: [minifyJsonPlugin()]
}