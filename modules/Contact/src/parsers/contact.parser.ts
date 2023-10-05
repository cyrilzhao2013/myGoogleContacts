import { IContact } from "../types/contact.type";
import { IContactApiData } from "../types/api-response.type";

export function parseContact(apiData: IContactApiData): IContact {
  const firstValidBirthday = apiData.birthdays?.find((birthday) => {
    return birthday.date.year && birthday.date.month && birthday.date.day;
  });

  return {
    resourceName: apiData.resourceName,
    firstName: apiData.names?.[0]?.givenName || "",
    lastName: apiData.names?.[0]?.familyName || "",
    displayName: apiData.names?.[0]?.displayName,
    avatar: apiData.photos?.[0].url,
    company: apiData.organizations?.[0]?.name || "",
    jobTitle: apiData.organizations?.[0]?.title || "",
    emails:
      apiData.emailAddresses?.map((email) => {
        return {
          email: email.value,
          tags: [email.type],
        };
      }) || [],
    telephones:
      apiData.phoneNumbers?.map((phoneNumber) => {
        return {
          tel: phoneNumber.value,
          tags: [phoneNumber.type],
        };
      }) || [],
    birthday: firstValidBirthday
      ? {
          year: firstValidBirthday.date.year,
          month: firstValidBirthday.date.month,
          day: firstValidBirthday.date.day,
        }
      : undefined,
    groups: apiData.memberships?.map((group) => {
      return {
        resourceName: group.contactGroupMembership.contactGroupResourceName,
        id: group.contactGroupMembership.contactGroupId,
      };
    }),
    remark: "",
  };
}
