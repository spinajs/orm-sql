import { IContainer } from "@spinajs/di";
import { BetweenStatement, ColumnStatement, DeleteQueryCompiler, InsertQueryCompiler, InStatement, Orm, RawQueryStatement, SelectQueryCompiler, UpdateQueryCompiler, WhereStatement } from "@spinajs/orm";
import { SqlDeleteQueryCompiler, SqlInsertQueryCompiler, SqlSelectQueryCompiler, SqlUpdateQueryCompiler } from "./compilers";
import { SqlBetweenStatement, SqlColumnStatement, SqlInStatement, SqlRawStatement, SqlWhereStatement } from './statements';

export class SqlOrm extends Orm {

  public async resolveAsync(container : IContainer) {

    await super.resolveAsync(container);

    // create child container for injecting sql statements & compilers
    this.Container = container.child();

    this.Container.register(SqlInStatement).as(InStatement);
    this.Container.register(SqlRawStatement).as(RawQueryStatement);
    this.Container.register(SqlBetweenStatement).as(BetweenStatement);
    this.Container.register(SqlWhereStatement).as(WhereStatement);
    this.Container.register(SqlColumnStatement).as(ColumnStatement);

    this.Container.register(SqlSelectQueryCompiler).as(SelectQueryCompiler);
    this.Container.register(SqlUpdateQueryCompiler).as(UpdateQueryCompiler);
    this.Container.register(SqlDeleteQueryCompiler).as(DeleteQueryCompiler);
    this.Container.register(SqlInsertQueryCompiler).as(InsertQueryCompiler);
  }
}