import { Connection, ModelBase, Model, Primary, Uuid } from "@spinajs/orm";

@Connection("sqlite")
@Model("TestTable2")
// @ts-ignore
export class UuidModel extends ModelBase<Model2>
{
    @Primary()
    @Uuid()
    public Id: string;

    public Far : string;
    
    public Bar: string;
}
