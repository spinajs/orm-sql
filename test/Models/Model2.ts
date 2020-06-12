import { Connection, ModelBase, Model, Primary } from "@spinajs/orm";

@Connection("sqlite")
@Model("TestTable2")
// @ts-ignore
export class Model2 extends ModelBase<Model2>
{
    @Primary()
    public Id: number;

    public Far : string;
    
    public Bar: string;
}
