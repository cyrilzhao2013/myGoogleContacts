export interface IEmail {
  email: string;
  tags?: string[];
}

export interface ITelephone {
  tel: string;
  tags?: string[];
}

export interface IContactGroup {
  id: string;
  resourceName: string;
}

export interface IContact {
  resourceName: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatar: string;
  company: string;
  jobTitle: string;
  emails?: IEmail[];
  telephones?: ITelephone[];
  birthday?: {
    year: number;
    month: number;
    day: number;
  };
  remark: string;
  groups: IContactGroup[];
}
