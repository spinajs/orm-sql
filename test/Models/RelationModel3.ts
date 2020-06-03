import { Connection, ModelBase, Model, Primary } from "@spinajs/orm";

@Connection("sqlite")
@Model("RelationTable3")
// @ts-ignore
export class RelationModel3 extends ModelBase<RelationModel2>
{
    @Primary()
    public Id: number;
    
    public RelationProperty3: string;
    
}
