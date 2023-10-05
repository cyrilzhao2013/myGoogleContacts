export interface IEmailApiData {
  email: string;
  tags?: string[];
}

export interface ITelephoneApiData {
  tel: string;
  tags?: string[];
}

// export interface IContactApiData {
//   id: string;
//   firstName: string;
//   lastName: string;
//   avatar: string;
//   company: string;
//   jobTitle: string;
//   emails?: IEmailApiData[];
//   telephones?: ITelephoneApiData[];
//   birthday: string;
//   remark: string;
//   tags: string[];
// }

export interface IMetadataApiData {
  primary: boolean;
  source: {
    id: string;
    type: string;
  };
}

export interface IContactApiData {
  etag: string;
  resourceName: string;
  emailAddresses: {
    formattedType: string;
    type: string;
    value: string;
    metadata: IMetadataApiData;
  }[];
  birthdays: {
    date: {
      year: number;
      month: number;
      day: number;
    };
    text: string; // "1992/04/16"
    metadata: IMetadataApiData;
  }[];
  phoneNumbers: {
    canonicalForm: string; // +8615889988999
    formattedType: string;
    type: string;
    value: string;
    metadata: IMetadataApiData;
  }[];
  photos: {
    url: string;
    metadata: IMetadataApiData;
  }[];
  names: {
    displayName: string;
    displayNameLastFirst: string;
    givenName: string;
    familyName: string;
    metadata: IMetadataApiData;
    unstructuredName: string;
  }[];
  memberships: {
    metadata: IMetadataApiData;
    contactGroupMembership: {
      contactGroupId: string;
      contactGroupResourceName: string;
    };
  }[];
  organizations: {
    metadata: IMetadataApiData;
    name: string; // company
    title: string; // jobTitle
  }[];
}
