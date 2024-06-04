import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import dbMigration from 'node-pg-migrate';

export class DatabaseTestContainer {
  private static instance: DatabaseTestContainer;

  private postgresContainer?: StartedPostgreSqlContainer;

  private constructor() {}

  public static getInstance(): DatabaseTestContainer {
    if (!DatabaseTestContainer.instance) {
      DatabaseTestContainer.instance = new DatabaseTestContainer();
    }

    return DatabaseTestContainer.instance;
  }

  public async start(): Promise<void> {
    if (!this.postgresContainer) {
      this.postgresContainer = await new PostgreSqlContainer()
        .withDatabase('app')
        .withUsername('postgres')
        .withPassword('123456')
        .withExposedPorts(5432)
        .start();

      await dbMigration({
        dir: 'migrations',
        migrationsTable: 'pgmigrations',
        direction: 'up',
        databaseUrl: this.postgresContainer.getConnectionUri(),
      });
    }
  }

  public async stop(): Promise<void> {
    if (this.postgresContainer) {
      await this.postgresContainer.stop();
    }
  }

  public getConnectionUri(): string {
    if (this.postgresContainer) {
      return this.postgresContainer.getConnectionUri();
    }
    return '';
  }
}
