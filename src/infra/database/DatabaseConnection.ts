import pgp from 'pg-promise';

export default interface DatabaseConnection {
  query(statement: string, params?: any, transactional?: boolean): Promise<any>;
  close(): Promise<void>;
  commit(): Promise<void>;
}

export class PgPromiseAdapter implements DatabaseConnection {
  connection: any;

  constructor(readonly connectionString: string) {
    this.connection = pgp()(connectionString);
  }

  private toPgParam(statement: string): string {
    return statement.replace(/:[a-zA-Z0-9_]+/g, match => `$/${match.substring(1)}/`);
  }

  query(statement: string, params?: any): Promise<any> {
    return this.connection.query(this.toPgParam(statement), params);
  }

  close(): Promise<void> {
    return this.connection.$pool.end();
  }

  async commit(): Promise<void> {}
}

/*
export class WowPgPromiseAdapter implements DatabaseConnection {
  connection: any;
  statements: { statement: string; params: any }[];

  constructor() {
    this.connection = pgp()('postgres://postgres:123456@localhost:5432/app');
    this.statements = [];
  }

  async query(statement: string, params: any, transactional: boolean = false): Promise<any> {
    if (!transactional) {
      return this.connection.query(statement, params);
    } else {
      this.statements.push({ statement, params });
    }
  }

  close(): Promise<void> {
    return this.connection.$pool.end();
  }

  async commit(): Promise<void> {
    await this.connection
      .tx(async (t: any) => {
        const transactions = [];
        for (const statement of this.statements) {
          transactions.push(await t.query(statement.statement, statement.params));
        }
        return t.batch(transactions);
      })
      .then((data: any) => {
        console.log('commit');
      })
      .catch((data: any) => {
        console.log('rollback');
      });
  }
}
*/
