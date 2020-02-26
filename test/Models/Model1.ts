import { Connection, ModelBase, Model, Primary } from "@spinajs/orm";

@Connection("sqlite")
@Model("TestTable1")
// @ts-ignore
export class Model1 extends ModelBase<Model1>
{
    @Primary()
    public Id: number;

    public Bar: string;
}
