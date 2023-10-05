export interface IPaginationReq {
  pageSize?: number;
  pageToken?: string;
}

export interface IPaginationResp<T> {
  results: T[];
  count: number;
  nextPageToken: string;
}
