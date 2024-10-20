import cluster from 'node:cluster';
import { cpus } from 'node:os';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ClusterService {
  static clusterize(callback: () => any): void {
    const maxWorkers = Number(process.env.MAX_WORKERS ?? 1);
    if (cluster.isPrimary && maxWorkers > 1) {
      console.log(`Master server started on ${process.pid}`);
      const CPUS: any = cpus();
      const isDev =
        process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

      CPUS.filter((c: any, i: number) => (isDev && i < maxWorkers) || !isDev).forEach(
        () => cluster.fork(),
      );

      cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} died. Restarting`);
        cluster.fork();
      });
    } else {
      callback();
    }
  }
}
