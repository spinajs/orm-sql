import { Connection, ModelBase, Model, Primary } from "@spinajs/orm";

@Connection("sqlite")
@Model("RelationTable4")
// @ts-ignore
export class RelationModel4 extends ModelBase<RelationModel2>
{
    @Primary()
    public Id: number;
    
    public Model4Property: string;
}
