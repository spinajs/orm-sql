import { Container, DI } from "@spinajs/di";
import { BetweenStatement, ColumnStatement, InStatement, Orm, RawQueryStatement, WhereStatement } from "@spinajs/orm";
import { SqlBetweenStatement, SqlColumnStatement, SqlInStatement, SqlRawStatement, SqlWhereStatement } from './statements';

export class SqlOrm extends Orm {

  public Container : Container;

  public async initialize() {

    // create child container for injecting sql statements & compilers
    this.Container = DI.child();

    this.Container.register(SqlInStatement).as(InStatement);
    this.Container.register(SqlRawStatement).as(RawQueryStatement);
    this.Container.register(SqlBetweenStatement).as(BetweenStatement);
    this.Container.register(SqlWhereStatement).as(WhereStatement);
    this.Container.register(SqlColumnStatement).as(ColumnStatement);

  }
}