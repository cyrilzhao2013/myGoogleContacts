import { IGroupApiData } from "./api-response.type";

export type IGroup = Pick<
  IGroupApiData,
  | "groupType"
  | "memberCount"
  | "resourceName"
  | "name"
  | "formattedName"
  | "etag"
  | "memberResourceNames"
>;
