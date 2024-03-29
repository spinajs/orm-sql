import { SqlSetConverter } from './converters';
import { ColumnQueryCompiler, SetValueConverter, GroupByStatement, DateTimeWrapper, DateWrapper } from '@spinajs/orm';
import {
  OrmDriver,
  InStatement,
  RawQueryStatement,
  BetweenStatement,
  WhereStatement,
  ColumnStatement,
  ColumnMethodStatement,
  ExistsQueryStatement,
  ColumnRawStatement,
  WhereQueryStatement,
  SelectQueryCompiler,
  UpdateQueryCompiler,
  DeleteQueryCompiler,
  InsertQueryCompiler,
  TableQueryCompiler,
  OrderByQueryCompiler,
  OnDuplicateQueryCompiler,
  JoinStatement,
  IndexQueryCompiler,
  WithRecursiveStatement,
  RecursiveQueryCompiler,
  ForeignKeyQueryCompiler,
  GroupByQueryCompiler
} from '@spinajs/orm';
import { IContainer } from '@spinajs/di';
import {
  SqlInStatement,
  SqlRawStatement,
  SqlBetweenStatement,
  SqlWhereStatement,
  SqlColumnStatement,
  SqlColumnMethodStatement,
  SqlExistsQueryStatement,
  SqlColumnRawStatement,
  SqlWhereQueryStatement,
  SqlJoinStatement,
  SqlWithRecursiveStatement,
  SqlGroupByStatement,
  SqlDateTimeWrapper,
  SqlDateWrapper,
} from './statements';
import {
  SqlSelectQueryCompiler,
  SqlUpdateQueryCompiler,
  SqlDeleteQueryCompiler,
  SqlInsertQueryCompiler,
  SqlTableQueryCompiler,
  SqlOrderQueryByCompiler,
  SqlOnDuplicateQueryCompiler,
  SqlIndexQueryCompiler,
  SqlWithRecursiveCompiler,
  SqlForeignKeyQueryCompiler,
  SqlColumnQueryCompiler,
  SqlGroupByCompiler,
} from './compilers';

export * from './compilers';
export * from './statements';

export abstract class SqlDriver extends OrmDriver {
  public resolve(container: IContainer) {
    super.resolve(container);
    this.Container = container.child();

    this.Container.register(SqlInStatement).as(InStatement);
    this.Container.register(SqlRawStatement).as(RawQueryStatement);
    this.Container.register(SqlBetweenStatement).as(BetweenStatement);
    this.Container.register(SqlWhereStatement).as(WhereStatement);
    this.Container.register(SqlColumnStatement).as(ColumnStatement);
    this.Container.register(SqlJoinStatement).as(JoinStatement);
    this.Container.register(SqlColumnMethodStatement).as(ColumnMethodStatement);
    this.Container.register(SqlExistsQueryStatement).as(ExistsQueryStatement);
    this.Container.register(SqlColumnRawStatement).as(ColumnRawStatement);
    this.Container.register(SqlWhereQueryStatement).as(WhereQueryStatement);
    this.Container.register(SqlWithRecursiveStatement).as(WithRecursiveStatement);
    this.Container.register(SqlGroupByStatement).as(GroupByStatement);
    this.Container.register(SqlDateTimeWrapper).as(DateTimeWrapper);
    this.Container.register(SqlDateWrapper).as(DateWrapper);


    this.Container.register(SqlWithRecursiveCompiler).as(RecursiveQueryCompiler);
    this.Container.register(SqlSelectQueryCompiler).as(SelectQueryCompiler);
    this.Container.register(SqlUpdateQueryCompiler).as(UpdateQueryCompiler);
    this.Container.register(SqlDeleteQueryCompiler).as(DeleteQueryCompiler);
    this.Container.register(SqlInsertQueryCompiler).as(InsertQueryCompiler);
    this.Container.register(SqlTableQueryCompiler).as(TableQueryCompiler);
    this.Container.register(SqlOrderQueryByCompiler).as(OrderByQueryCompiler);
    this.Container.register(SqlOnDuplicateQueryCompiler).as(OnDuplicateQueryCompiler);
    this.Container.register(SqlIndexQueryCompiler).as(IndexQueryCompiler);
    this.Container.register(SqlForeignKeyQueryCompiler).as(ForeignKeyQueryCompiler);
    this.Container.register(SqlColumnQueryCompiler).as(ColumnQueryCompiler);
    this.Container.register(SqlGroupByCompiler).as(GroupByQueryCompiler);

    this.Container.register(SqlSetConverter).as(SetValueConverter);
  }
}
