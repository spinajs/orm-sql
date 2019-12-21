import { OrmDriver, InStatement, RawQueryStatement, BetweenStatement, WhereStatement, ColumnStatement, ColumnMethodStatement, ExistsQueryStatement, ColumnRawStatement, WhereQueryStatement, SelectQueryCompiler, UpdateQueryCompiler, DeleteQueryCompiler, InsertQueryCompiler, TableQueryCompiler } from "@spinajs/orm";
import { IContainer } from "@spinajs/di";
import { SqlInStatement, SqlRawStatement, SqlBetweenStatement, SqlWhereStatement, SqlColumnStatement, SqlColumnMethodStatement, SqlExistsQueryStatement, SqlColumnRawStatement, SqlWhereQueryStatement } from "./statements";
import { SqlSelectQueryCompiler, SqlUpdateQueryCompiler, SqlDeleteQueryCompiler, SqlInsertQueryCompiler, SqlTableQueryCompiler } from "./compilers";

export * from "./compilers";
export * from "./statements";

export abstract class SqlDriver extends OrmDriver {
    
    public resolve(container: IContainer) {

        super.resolve(container);
        this.Container = container.child();


        this.Container.register(SqlInStatement).as(InStatement);
        this.Container.register(SqlRawStatement).as(RawQueryStatement);
        this.Container.register(SqlBetweenStatement).as(BetweenStatement);
        this.Container.register(SqlWhereStatement).as(WhereStatement);
        this.Container.register(SqlColumnStatement).as(ColumnStatement);
        this.Container.register(SqlColumnMethodStatement).as(ColumnMethodStatement);
        this.Container.register(SqlExistsQueryStatement).as(ExistsQueryStatement);
        this.Container.register(SqlColumnRawStatement).as(ColumnRawStatement);
        this.Container.register(SqlWhereQueryStatement).as(WhereQueryStatement);

        this.Container.register(SqlSelectQueryCompiler).as(SelectQueryCompiler);
        this.Container.register(SqlUpdateQueryCompiler).as(UpdateQueryCompiler);
        this.Container.register(SqlDeleteQueryCompiler).as(DeleteQueryCompiler);
        this.Container.register(SqlInsertQueryCompiler).as(InsertQueryCompiler);
        this.Container.register(SqlTableQueryCompiler).as(TableQueryCompiler);
    }
}