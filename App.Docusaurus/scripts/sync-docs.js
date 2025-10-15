import path from 'path';

import chokidar from 'chokidar';
import fs from 'fs-extra';

const ROOT_PATH = path.resolve(__dirname, '..');
const STATIC_PATH = path.resolve(ROOT_PATH, 'static');
const API_SPECS_PATH = path.resolve(ROOT_PATH, 'App.API/swagger.json');

const WATCH_PATHS = [
  path.resolve(ROOT_PATH, 'App.API/Controllers'),
  path.resolve(ROOT_PATH, 'App.Web/src'),
  path.resolve(ROOT_PATH, 'App.API/Migrations'),
];

async function syncApiDocs() {
  console.warn('Syncing API documentation...');
  try {
    const apiSpec = await fs.readJson(API_SPECS_PATH);
    await fs.ensureDir(STATIC_PATH);
    await fs.writeJson(path.resolve(STATIC_PATH, 'swagger.json'), apiSpec, { spaces: 2 });
    console.warn('API documentation synced successfully.');
  } catch (error) {
    console.error('Error syncing API documentation:', error);
  }
}

function watchFiles() {
  console.warn('Watching for changes in:', WATCH_PATHS);
  const watcher = chokidar.watch(WATCH_PATHS, {
    ignored: /(^|[/\\])\../,
    persistent: true,
  });

  watcher.on('change', async (filePath) => {
    console.warn(`File ${filePath} changed. Triggering doc sync.`);
    await syncApiDocs();
  });
}

async function main() {
  await syncApiDocs();
  if (process.argv.includes('--watch')) {
    watchFiles();
  }
}

main().catch((error) => {
  console.error('Failed to sync API docs:', error);
  process.exit(1);
});
