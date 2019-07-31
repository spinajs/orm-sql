import { InvalidOperationException } from "@spinajs/exceptions";
import { ColumnStatement, DeleteQueryBuilder, IColumnsBuilder, IColumnsCompiler, ICompilerOutput, ILimitBuilder, ILimitCompiler, InsertQueryBuilder, IOrderByBuilder, IOrderByCompiler, IQueryCompiler, IWhereBuilder, IWhereCompiler, OrderByBuilder, QueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "@spinajs/orm";
import { use } from "typescript-mix";

export abstract class SqlQueryCompiler<T extends QueryBuilder> implements IQueryCompiler {
    protected _builder: T;

    constructor(builder: T) {
        if (!builder) {
            throw new InvalidOperationException('builder cannot be null or undefined');
        }

        this._builder = builder;
    }

    public tableAliasCompiler() {
        let table = "";

        if (this._builder.Schema) {
            table += `\`${this._builder.Schema}\`.`;
        }

        table += `\`${this._builder.Table}\``;


        if (this._builder.TableAlias) {
            table += ` as ${this._builder.TableAlias}`;
        }

        return table;
    }

    public abstract compile(): ICompilerOutput;
}

export class SqlOrderByCompiler implements IOrderByCompiler {
    public sort(builder: OrderByBuilder): ICompilerOutput {
        const _sort = builder.getSort();
        let stmt = ' ';
        const bindings = [];

        if (_sort) {
            stmt = `ORDER BY ? ?`
            bindings.push(_sort.column, _sort.order);
        }

        return {
            bindings,
            expression: stmt,
        }
    }
}

export class SqlLimitCompiler implements ILimitCompiler {
    public limit(builder: ILimitBuilder): ICompilerOutput {
        const limits = builder.getLimits();
        const bindings = [];
        let stmt = ' ';

        if (limits.limit > 0) {
            stmt += `LIMIT ?`
            bindings.push(limits.limit);
        } else {
            if (limits.offset > 0) {
                stmt += `LIMIT 18446744073709551615`;
            }
        }

        if (limits.offset > 0) {
            stmt += ` OFFSET ?`;
            bindings.push(limits.offset);

        }

        return {
            bindings,
            expression: stmt
        }
    }
}

export class SqlColumnsCompiler implements IColumnsCompiler {
    public columns(builder: IColumnsBuilder) {
        return {
            bindings: [] as any[],
            expression: builder.getColumns().map(c => {
                return c.build().Statements[0];
            }).join(",")
        }
    }
}


export class SqlWhereCompiler implements IWhereCompiler {

    public where(builder: IWhereBuilder) {
        const where: string[] = [];
        const bindings: any[] = [];

        builder.Statements.map(x => {
            return x.build();
        }).forEach(r => {
            where.push(...r.Statements);

            if (Array.isArray(r.Bindings)) {
                bindings.push(...r.Bindings);
            }
        });

        return {
            bindings,
            expression: where.join(` ${builder.Op.toUpperCase()} `),
        }
    }
}


// tslint:disable-next-line
export interface SqlSelectQueryCompiler extends IWhereCompiler, ILimitCompiler, IOrderByCompiler, IColumnsCompiler { }
export class SqlSelectQueryCompiler extends SqlQueryCompiler<SelectQueryBuilder> {

    @use(SqlWhereCompiler, SqlOrderByCompiler, SqlLimitCompiler, SqlColumnsCompiler)
    /// @ts-ignore
    private this: this;

    constructor(builder: SelectQueryBuilder) {
        super(builder);
    }


    public compile(): ICompilerOutput {
        const columns = this.select();
        const from = this.from();
        const limit = this.limit(this._builder as ILimitBuilder);
        const sort = this.sort(this._builder as IOrderByBuilder);
        const where = this.where(this._builder as IWhereBuilder);

        const expression = columns + " " + from + ((where.expression) ? ` WHERE ${where.expression}` : "") + limit.expression + sort.expression;

        const bindings = [];
        bindings.push(...where.bindings);
        bindings.push(...limit.bindings);
        bindings.push(...sort.bindings);

        return {
            bindings,
            expression: expression.trim()
        }
    }


    protected select() {

        let _stmt = "SELECT ";

        if (this._builder.IsDistinct) {
            _stmt += "DISTINCT "
        }

        if (!this._builder.getColumns()) {
            return _stmt + '*';
        }

        return _stmt + this.columns(this._builder)
    }

    protected from() {
        return "FROM " + this.tableAliasCompiler();
    }
}

// tslint:disable-next-line
export interface SqlUpdateQueryCompiler extends IWhereCompiler { };
export class SqlUpdateQueryCompiler extends SqlQueryCompiler<UpdateQueryBuilder>
{

    @use(SqlWhereCompiler)
    /// @ts-ignore
    private this: this

    constructor(builder: UpdateQueryBuilder) {
        super(builder);
    }

    public compile(): ICompilerOutput {

        const table = this.table();
        const set = this.set();
        const where = this.where(this._builder as IWhereBuilder);

        const bindings = [];
        bindings.push(set.bindings);
        bindings.push(...where.bindings);

        return {
            bindings,
            expression: table + set + where
        }
    }

    protected set() {

        const bindings = [];
        let exprr = "";

        for (const prop of Object.keys(this._builder.Value)) {
            const val = (this._builder.Value as any)[prop];

            exprr += `\`${prop}\` = ?`
            bindings.push(val);
        }

        return {
            bindings,
            expression: exprr
        }
    }


    protected table() {
        return `UPDATE ${this.tableAliasCompiler()} SET`;
    }

}

// tslint:disable-next-line
export interface DeleteQueryCompiler extends IWhereCompiler { }
export class DeleteQueryCompiler extends SqlQueryCompiler<DeleteQueryBuilder>
{

    @use(SqlWhereCompiler)
    /// @ts-ignore
    private this: this;

    public compile() {

        const _bindings = [];
        const _from = this.from();
        const _limit = this.limit();
        const _where = this.where(this._builder as IWhereBuilder)

        let _expression = "";

        if (this._builder.Truncate) {
            _expression = `TRUNCATE TABLE ${this.tableAliasCompiler()}`;
        } else {
            _expression = _from + ((!_where.expression) ? ` WHERE ${_where.expression}` : "") + _limit.expression;
        }

        _bindings.push(..._where.bindings);
        _bindings.push(..._limit.bindings);

        return {
            bindings: _bindings,
            expression: _expression.trim()
        }
    }


    protected limit() {
        const _limits = this._builder.getLimits();
        const _bindings = [];
        let _stmt = ' ';

        if (_limits.limit > 0) {
            _stmt += `LIMIT ?`
            _bindings.push(_limits.limit);
        }

        return {
            bindings: _bindings,
            expression: _stmt
        }
    }


    protected from() {
        return `DELETE FROM ${this.tableAliasCompiler()}`;
    }
}

export class SqlInsertQueryCompiler extends SqlQueryCompiler<InsertQueryBuilder> {

    public compile() {

        const into = this.into();
        const columns = this.columns();
        const values = this.values();

        return {
            bindings: values.bindings,
            expression: into + " " + columns + " " + values.data
        }
    }

    protected values() {
        const bindings: any[] = [];
        let data = "VALUES ";

        data += this._builder.Values.map(val => {
            const toInsert = val.map(v => {

                if (v === undefined) {
                    return "DEFAULT";
                }

                bindings.push(v);
                return "?";
            });
            return `(` + toInsert.join(",") + ")";
        }).join(",");

        return {
            bindings,
            data
        }
    }

    protected columns() {
        const columns = this._builder.getColumns().map(c => {
            return (c as ColumnStatement).Column
        }).map(c => {
            return `\`${c}\``;
        });

        return `(` + columns.join(",") + ")";
    }

    protected into() {
        return `INSERT INTO \`${this._builder.Table}\``;
    }
}