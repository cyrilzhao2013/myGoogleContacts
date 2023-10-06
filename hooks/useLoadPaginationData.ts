import { IPaginationReq, IPaginationResp } from "@/types/pagination.type";
import { useEffect, useState } from "react";

export interface IProps<T> {
  pageSize?: number;
  requestFunc: (params: IPaginationReq) => Promise<IPaginationResp<T>>;
}

export function useLoadPaginationData<T>(props: IProps<T>) {
  const { pageSize, requestFunc } = props;

  const [nextPageToken, setNextPageToken] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [list, setList] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchNext = async () => {
    if (loading || !hasMore) {
      return;
    }

    try {
      setLoading(true);

      const resp = await requestFunc({
        pageSize: pageSize,
        pageToken: nextPageToken,
      });

      if (!resp.results?.length || !resp.nextPageToken) {
        setHasMore(false);
      }

      const newList = [...list, ...resp.results];

      setList(newList);
      setTotalCount(resp.count);
      setNextPageToken(resp.nextPageToken);
      setLoading(false);
    } catch (err) {
      setLoading(false);

      throw err;
    }
  };

  const reload = async () => {
    console.trace("cyril");

    setList([]);
    setTotalCount(0);
    setNextPageToken(undefined);
    setLoading(false);
    setHasMore(true);

    fetchNext();
  };

  return {
    list,
    totalCount,
    loading,
    hasMore,
    fetchNext,
    reload,
  };
}
