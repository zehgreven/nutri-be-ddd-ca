import AccountPermission from '@src/domain/entity/AccountPermission';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';
import { inject } from '../dependency-injection/Registry';

export interface AccountPermissionRepository {
  save(permission: AccountPermission): Promise<void>;
  deleteByAccountIdAndFunctionalityId(accountId: string, functionalityId: string): Promise<void>;
  getByAccountIdAndFunctionalityId(accountId: string, functionalityId: string): Promise<AccountPermission | undefined>;
  updateAllowById(id: string, allow: boolean): Promise<void>;
}

export class AccountPermissionRepositoryPostgres implements AccountPermissionRepository {
  @inject('DatabaseConnection')
  private connection!: DatabaseConnection;

  async save(permission: AccountPermission): Promise<void> {
    const query = `
      insert into iam.account_permission (
        id,
        active,
        allow,
        account_id,
        functionality_id
      ) values (
        $(id),
        $(active),
        $(allow),
        $(accountId),
        $(functionalityId)
      )
    `;

    await this.connection.query(query, permission);
  }

  async deleteByAccountIdAndFunctionalityId(accountId: string, functionalityId: string): Promise<void> {
    const query = `
      update iam.account_permission 
      set deleted = now()
      where account_id = $(accountId) 
      and functionality_id = $(functionalityId) 
      and deleted is null
    `;
    await this.connection.query(query, { accountId, functionalityId });
  }

  async getByAccountIdAndFunctionalityId(
    accountId: string,
    functionalityId: string,
  ): Promise<AccountPermission | undefined> {
    const query = `
      select
        id,
        active,
        allow,
        account_id as "accountId",
        functionality_id as "functionalityId"
      from
        iam.account_permission
      where 1=1
        and deleted is null
        and account_id = $(accountId)
        and functionality_id = $(functionalityId)
    `;
    const [permission] = await this.connection.query(query, { accountId, functionalityId });
    if (!permission) {
      return;
    }
    return AccountPermission.restore(
      permission.id,
      permission.accountId,
      permission.functionalityId,
      permission.allow,
      permission.active,
    );
  }

  async updateAllowById(id: string, allow: boolean): Promise<void> {
    const query = `
      update iam.account_permission
      set allow = $(allow)
      where id = $(id)
    `;
    await this.connection.query(query, { id, allow });
  }
}
