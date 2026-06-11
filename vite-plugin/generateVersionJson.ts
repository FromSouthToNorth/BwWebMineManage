import { Plugin, loadEnv } from 'vite'
import path from 'path'
import fs from 'fs'

// 自定义插件：生成 version.json 文件
export function generateVersionJson(): Plugin {
  return {
    name: 'generate-version-json',
    closeBundle() {
      const env = loadEnv('production', process.cwd());
      const version = env.VITE_APP_VERSION || '1.0.0.0';
      const now = new Date();
      const buildTime = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

      const versionData = {
        version,
        build: buildTime
      };

      const outputDir = path.join(process.cwd(), 'dist', env.VITE_APP_PATH || '');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(outputDir, 'version.json'),
        JSON.stringify(versionData, null, 2)
      );

      console.log(`✅ Version file generated: ${path.join(outputDir, 'version.json')}`);
    },
  };
}
