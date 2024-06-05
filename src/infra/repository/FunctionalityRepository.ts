import Functionality from '@src/domain/entity/Functionality';
import DatabaseConnection from '@src/infra/database/DatabaseConnection';

export interface FunctionalityRepository {
  save(functionality: Functionality): Promise<void>;
  update(functionality: Functionality): Promise<void>;
  getById(id: string): Promise<Functionality | undefined>;
  deleteById(id: string): Promise<void>;
}

export class FunctionalityRepositoryPostgres implements FunctionalityRepository {
  constructor(private connection: DatabaseConnection) {}

  async save(functionality: Functionality): Promise<void> {
    const query = `
      insert into iam.functionality 
        (functionality_type_id, id, name, description, path, active) 
      values
        ($(functionalityTypeId), $(id), $(name), $(description), $(path), $(active))`;
    await this.connection.query(query, {
      functionalityTypeId: functionality.getFunctionalityTypeId(),
      id: functionality.id,
      name: functionality.getName(),
      description: functionality.getDescription(),
      path: functionality.getPath(),
      active: functionality.isActive(),
    });
    this.connection.commit();
  }

  async update(functionality: Functionality): Promise<void> {
    const query = `
      update iam.functionality set 
        functionality_type_id = $(functionalityTypeId), 
        name = $(name), 
        description = $(description), 
        path = $(path), 
        active = $(active) 
      where id = $(id)`;
    await this.connection.query(query, {
      functionalityTypeId: functionality.getFunctionalityTypeId(),
      id: functionality.id,
      name: functionality.getName(),
      description: functionality.getDescription(),
      path: functionality.getPath(),
      active: functionality.isActive(),
    });
    this.connection.commit();
  }

  async getById(id: string): Promise<Functionality | undefined> {
    const query = `
      select 
        functionality_type_id as "functionalityTypeId", 
        id, 
        name, 
        description, 
        path, 
        active 
      from iam.functionality 
      where deleted is null and id = $(id)`;

    const [functionality] = await this.connection.query(query, { id });
    if (!functionality) {
      return;
    }
    return Functionality.restore(
      functionality.functionalityTypeId,
      functionality.id,
      functionality.name,
      functionality.description,
      functionality.path,
      functionality.active,
    );
  }

  async deleteById(id: string): Promise<void> {
    const query = 'update iam.functionality set deleted = now() where id = $(id)';
    await this.connection.query(query, { id });
    this.connection.commit();
  }
}

export class FunctionalityRepositoryMemoryDatabase implements FunctionalityRepository {
  functionalitys: Functionality[] = [];

  async save(functionality: Functionality): Promise<void> {
    this.functionalitys.push(functionality);
  }

  async update(functionality: Functionality): Promise<void> {
    const index = this.functionalitys.findIndex(p => p.id === functionality.id);
    this.functionalitys[index] = functionality;
  }

  async getById(id: string): Promise<Functionality | undefined> {
    return this.functionalitys.find(functionality => functionality.id === id);
  }

  async deleteById(id: string): Promise<void> {
    this.functionalitys = this.functionalitys.filter(functionality => functionality.id !== id);
  }

  async clear(): Promise<void> {
    this.functionalitys = [];
  }
}
