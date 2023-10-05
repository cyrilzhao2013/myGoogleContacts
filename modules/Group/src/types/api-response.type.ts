import { GROUP_TYPE } from "../constants/group.const";

export interface IGroupApiData {
  resourceName: string;
  etag: string;
  metadata: {
    updateTime: string;
    deleted: boolean;
  };
  groupType: GROUP_TYPE;
  name: string;
  formattedName: string;
  memberResourceNames: string[];
  memberCount: number;
  clientData: {
    key: string;
    value: string;
  }[];
}
