import { googleApi } from "@/utils/google-api";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  selectAuthorized,
  selectGoogleApiScriptLoaded,
  setAuthorized,
  setGoogleApiScriptLoaded,
} from "@/store/auth";
import { setCustomGroups, selectCustomGroups } from "@/store/group";
import { Group } from "@/modules/Group";

export interface IProps {
  callback: () => Promise<void>;
}

/**
 * 负责 Google API 脚本的加载、初始化和用户身份授权认证工作
 *
 * @param callback  授权认证成功后调用的函数，一般用于在用户认证后获取页面数据
 * @returns
 */
export function useAuth(props: IProps) {
  /**
   * 用户身份是否已认证
   */
  const authorized = useSelector(selectAuthorized);
  /**
   * Google API 脚本是否已成功加载并初始化完毕
   */
  const googleApiScriptLoaded = useSelector(selectGoogleApiScriptLoaded);
  const dispatch = useDispatch();
  const { callback } = props;

  /**
   * 授权完成后获取数据
   */
  const fetchData = async () => {
    const { results: groups } = await Group.getCustomGroups();
    dispatch(setCustomGroups(groups));

    await callback();
  };

  /**
   * 如果刷新页面时的授权窗口弹出被拦截，也可以通过点击页面按钮来授权
   */
  const handleAuthClick = async () => {
    await googleApi.auth();
    dispatch(setAuthorized(true));

    await fetchData();
  };

  /**
   * 加载并初始化 Google API 库，完成后进行用户身份授权
   */
  const init = async () => {
    if (googleApiScriptLoaded || authorized) {
      await fetchData();
      return;
    }

    await googleApi.init();
    dispatch(setGoogleApiScriptLoaded(true));

    await handleAuthClick();
  };

  useEffect(() => {
    init();
  }, []);

  return {
    handleAuthClick,
  };
}
