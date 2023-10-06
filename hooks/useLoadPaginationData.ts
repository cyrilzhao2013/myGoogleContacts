import { IPaginationReq, IPaginationResp } from "@/types/pagination.type";
import { useEffect, useState } from "react";

export interface IProps<T> {
  pageSize?: number;
  requestFunc: (params: IPaginationReq) => Promise<IPaginationResp<T>>;
}

/**
 * 用于处理分页获取数据的 Hook
 *
 * @param pageSize        每页获取的数据条数，不传的话默认是 100
 * @param requestFunc     实际的请求方法，hook 中会将上一次返回的 nextPageToken 传给实际请求方法用于获取下一页数据
 *
 * @returns
 */
export function useLoadPaginationData<T>(props: IProps<T>) {
  const { pageSize, requestFunc } = props;
  // 上一次接口返回的 nextPageToken 令牌，用于获取下一页的数据，获取第一页数据时可不传该参数
  const [nextPageToken, setNextPageToken] = useState<string>();
  const [loading, setLoading] = useState<boolean>();
  const [totalCount, setTotalCount] = useState<number>(0);
  const [list, setList] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  /**
   * 获取下一页的分页数据，并添加到 list 的末尾
   */
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

  /**
   * 重新获取数据，即会先重置之前的所有状态，从第一页开始获取数据
   */
  const reload = async () => {
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
