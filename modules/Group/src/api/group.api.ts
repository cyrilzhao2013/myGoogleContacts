import { IPaginationReq, IPaginationResp } from "@/types/pagination.type";
import { E_REQUEST_METHODS, request } from "@/utils/request";
import { IGroupApiData } from "../types/api-response.type";
import { IGroup } from "../types/group.type";
import { parseGroup } from "../parsers/group.parse";
import { GROUP_TYPE } from "../constants/group.const";

export function getCustomGroups(): Promise<IPaginationResp<IGroup>> {
  return (window as any).gapi.client.people.contactGroups
    .list({
      pageSize: 20,
      groupFields: "clientData,groupType,memberCount,metadata,name",
    })
    .then((res: any) => {
      const groups =
        res.result?.contactGroups
          ?.filter((item: any) => {
            return item.groupType === GROUP_TYPE.USER_CONTACT_GROUP;
          })
          .map(parseGroup) || [];

      return {
        results: groups,
        count: groups.length,
      };
    });
}

export function updateContactsInGroup(
  resourceName: string,
  params: {
    resourceNamesToAdd?: string[];
    resourceNamesToRemove?: string[];
  }
) {
  return (window as any).gapi.client.people.contactGroups.members
    .modify({
      resourceName: resourceName,
      resourceNamesToAdd: params.resourceNamesToAdd,
      resourceNamesToRemove: params.resourceNamesToRemove,
    })
    .then((res: any) => {
      const groups =
        res.result?.contactGroups
          ?.filter((item: any) => {
            return item.groupType === GROUP_TYPE.USER_CONTACT_GROUP;
          })
          .map(parseGroup) || [];

      return {
        results: groups,
        count: groups.length,
      };
    });

  // return request.send<{
  //   notFoundResourceNames: string[];
  //   canNotRemoveLastContactGroupResourceNames: string[];
  // }>({
  //   url: "",
  //   method: E_REQUEST_METHODS.POST,
  //   data: params,
  // });
}

export function getGroupDetails(params: {
  resourceName: string;
}): Promise<IGroup> {
  return (window as any).gapi.client.people.contactGroups
    .get({
      resourceName: params.resourceName,
      maxMembers: 99999,
      groupFields: "clientData,groupType,memberCount,metadata,name",
    })
    .then((res: { result: IGroupApiData }) => {
      console.info("cyril getGroupDetails res: ", res);

      return parseGroup(res.result);
    });
}

export function deleteGroup(params: { resourceName: string }) {
  return (window as any).gapi.client.people.contactGroups.delete(params);
}

export function createGroup(params: Pick<IGroupApiData, "name">) {
  return (window as any).gapi.client.people.contactGroups.create({
    contactGroup: params,
  });
}
