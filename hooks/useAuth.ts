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

export function useAuth(props: IProps) {
  const authorized = useSelector(selectAuthorized);
  const googleApiScriptLoaded = useSelector(selectGoogleApiScriptLoaded);
  const dispatch = useDispatch();
  const { callback } = props;

  const handleAuthClick = async () => {
    await googleApi.auth();
    dispatch(setAuthorized(true));

    const { results: groups } = await Group.getCustomGroups();
    dispatch(setCustomGroups(groups));

    await callback();
  };

  const init = async () => {
    if (googleApiScriptLoaded || authorized) {
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
