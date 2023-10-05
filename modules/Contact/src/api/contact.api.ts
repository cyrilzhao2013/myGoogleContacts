import { IPaginationReq, IPaginationResp } from "@/types/pagination.type";
import { E_REQUEST_METHODS, request } from "@/utils/request";
import { IContactApiData } from "../types/api-response.type";
import { IContact } from "../types/contact.type";
import { parseContact } from "../parsers/contact.parser";

export function getContacts(
  params?: IPaginationReq
): Promise<IPaginationResp<IContact>> {
  return (window as any).gapi.client.people.people.connections
    .list({
      pageToken: params?.pageToken,
      pageSize: params?.pageSize,
      resourceName: "people/me",
      sortOrder: "FIRST_NAME_ASCENDING",
      personFields:
        "names,emailAddresses,coverPhotos,photos,phoneNumbers,genders,birthdays,memberships,clientData,locales,organizations",
    })
    .then(
      (res: {
        result: {
          connections: IContactApiData[];
          totalPeople: number;
          nextPageToken?: string;
        };
      }) => {
        return {
          results: res.result.connections.map((item) => {
            return parseContact(item);
          }),
          count: res.result.totalPeople,
          nextPageToken: res.result.nextPageToken,
        } as IPaginationResp<IContact>;
      }
    );
}

export function getContactsByResourceNames(params: {
  resourceNames: string[];
}): Promise<IContact[]> {
  return (window as any).gapi.client.people.people
    .getBatchGet({
      resourceNames: params.resourceNames,
      personFields:
        "names,emailAddresses,coverPhotos,photos,phoneNumbers,genders,birthdays,memberships,clientData,locales,organizations",
    })
    .then(
      (res: {
        result: {
          responses: {
            person: IContactApiData;
          }[];
        };
      }) => {
        console.info("cyril getContactsByResourceNames res: ", res);

        return res.result.responses.map((item) => {
          return parseContact(item.person);
        });
      }
    );
}

export function searchContacts(
  params: {
    keyword: string;
  } & IPaginationReq
): Promise<IPaginationResp<IContact>> {
  console.info(
    "cyril (window as any).gapi.client.people: ",
    (window as any).gapi.client.people.people
  );
  return (window as any).gapi.client.people.people
    .searchContacts({
      query: params.keyword,
      readMask:
        "names,emailAddresses,coverPhotos,photos,phoneNumbers,genders,birthdays,memberships,clientData,locales,organizations",
    })
    .then(
      (res: {
        result: {
          results: {
            person: IContactApiData;
          }[];
        };
      }) => {
        return {
          results:
            res.result?.results?.map((item) => {
              return parseContact(item.person);
            }) || [],
          count: res.result.results?.length || 0,
        } as IPaginationResp<IContact>;
      }
    );
}

export function deleteContact(params: { resourceName: string }) {
  return request.send<void>({
    url: "",
    method: E_REQUEST_METHODS.DELETE,
    data: params,
  });
}
