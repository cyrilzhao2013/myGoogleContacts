import { IGroup } from "../types/group.type";
import { IGroupApiData } from "../types/api-response.type";

export function parseGroup(apiData: IGroupApiData): IGroup {
  return {
    ...apiData,
    memberCount: apiData.memberCount || 0,
  };
}
