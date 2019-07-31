import { NewInstance } from "@spinajs/di";
import { BetweenStatement, ColumnStatement, InStatement, IQueryStatementResult, RawQueryStatement, WhereStatement } from "@spinajs/orm";

@NewInstance()
export class SqlRawStatement extends RawQueryStatement {
    public build(): IQueryStatementResult {
        return {
            Bindings: this._bindings,
            Statements: [`${this._query}`]
        }
    }
}

@NewInstance()
export class SqlBetweenStatement extends BetweenStatement {
    public build(): IQueryStatementResult {
        const exprr = this._not ? "NOT BETWEEN" : "BETWEEN";

        return {
            Bindings: this._val,
            Statements: [`\`${this._column}\` ${exprr} ? AND ?`]
        }
    }
}

@NewInstance()
export class SqlWhereStatement extends WhereStatement {
    public build(): IQueryStatementResult {
        return {
            Bindings: [this._value],
            Statements: [`\`${this._column}\` ${this._operator.toUpperCase()} ?`]
        }
    }
}

@NewInstance()
export class SqlInStatement extends InStatement
{
    public build(): IQueryStatementResult {
        const exprr = this._not ? "NOT IN" : "IN";

        return {
            Bindings: this._val,
            Statements: [`\`${this._column}\` ${exprr} (${this._val.map(_ => "?").join(",")})`]
        }
    }
}

@NewInstance()
export class SqlColumnStatement extends ColumnStatement
{
    public build(): IQueryStatementResult {
        let exprr = "";

        if (this.IsWildcard) {
            exprr = "*";
        } else {

            exprr = `\`${this._column}\``;

            if (!this._alias) {
                exprr += ` as \`${this._alias}\``
            }
        }

        return {
            Bindings: [],
            Statements: [exprr]
        }
    }
}
 