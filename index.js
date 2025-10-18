// index.js

import cluster from 'cluster';
import os from 'os';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { startServer } from './app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cpuCount = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking server for ${cpuCount} CPUs`);

  // Fork workers.
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    console.log('Forking a new worker');
    cluster.fork();
  });
} else {
  console.log(`Worker ${process.pid} started`);
  startServer();
}

