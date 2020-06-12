import { Connection, ModelBase, Model, Primary } from "@spinajs/orm";

@Connection("sqlite")
@Model("JoinTable")
// @ts-ignore
export class JoinModel extends ModelBase<RelationModel2>
{
    @Primary()
    public Id: number;
    
    public owner_id: number;

    public target_id: number;
}
