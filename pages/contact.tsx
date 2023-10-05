"use client";
import styles from "@/styles/Home.module.css";
import Image from "next/image";
import SearchInput, { IOption } from "@/components/search-input";
import { useEffect, useMemo, useState } from "react";
import { Contact } from "@/modules/Contact";
import { Group } from "@/modules/Group";
import { useImmer } from "use-immer";
import { googleApi } from "@/utils/google-api";
import { useDispatch, useSelector } from "react-redux";
import { Spin } from "antd";
import {
  selectAuthorized,
  selectGoogleApiScriptLoaded,
  setAuthorized,
  setGoogleApiScriptLoaded,
} from "@/store/auth";
import { setCustomGroups, selectCustomGroups } from "@/store/group";
import ContactTable from "@/components/contactTable";
import { useLoadPaginationData } from "@/hooks/useLoadPaginationData";
import { IPaginationResp } from "@/types/pagination.type";
import { useAuth } from "@/hooks/useAuth";

export interface IContactOption extends IOption {
  avatar: string;
}

export default function ContactsPage() {
  const authorized = useSelector(selectAuthorized);
  const googleApiScriptLoaded = useSelector(selectGoogleApiScriptLoaded);
  const customGroups = useSelector(selectCustomGroups);
  const dispatch = useDispatch();
  const [options, setOptions] = useState<IContactOption[]>([]);
  const [contacts, setContacts] = useImmer<Contact[]>([]);

  useEffect(() => {
    console.info("cyril page mounted");
  }, []);

  const {
    list: contactsList,
    fetchNext: fetchMoreContacts,
    reload: reloadContacts,
    hasMore,
  } = useLoadPaginationData<Contact>({
    requestFunc: (params: { pageToken?: string; pageSize?: number }) => {
      console.info("cyril params: ", params);
      return Contact.getContacts({
        pageToken: params.pageToken,
        pageSize: params.pageSize,
      });
    },
  });

  useEffect(() => {
    setContacts(contactsList || []);
  }, [contactsList]);

  const { handleAuthClick } = useAuth({
    callback: async () => {
      await reloadContacts();
    },
  });

  // const handleAuthClick = async () => {
  //   await googleApi.auth();
  //   dispatch(setAuthorized(true));

  //   // const resp = await Contact.getContacts();
  //   // setContacts(resp.results);

  //   await reloadContacts();
  // };

  // const fetchInitData = async () => {
  //   // const { results: groups } = await Group.getCustomGroups();
  //   // dispatch(setCustomGroups(groups));

  //   await reloadContacts();
  // };

  // const init = async () => {
  //   if (googleApiScriptLoaded || authorized) {
  //     return;
  //   }

  //   await googleApi.init();
  //   dispatch(setGoogleApiScriptLoaded(true));

  //   await handleAuthClick();
  // };

  // useEffect(() => {
  //   init();
  // }, []);

  // const customGroupNamesMap = useMemo(() => {
  //   const map: {
  //     [resourceName: string]: string;
  //   } = {};

  //   customGroups?.forEach((group) => {
  //     map[group.get("resourceName")] = group.get("name");
  //   });

  //   return map;
  // }, [customGroups]);

  const handleSearchContacts = async (keyword: string) => {
    const resp = await Contact.searchContacts({ keyword });

    console.info("cyril resp aaaaa: ", resp);

    // const resp = await Contact.getContacts({
    //   keyword: keyword,
    // });

    setOptions(
      resp.results.map((contact) => {
        return {
          label: contact.getName(),
          value: contact.get("resourceName"),
          avatar: contact.get("avatar"),
        };
      }) || []
    );
  };

  const handleSelectContact = (value: string | number, option: IOption) => {};

  const renderContactOption = (option: IOption) => {
    return (
      <div className={styles.contactSearchOption}>
        {/* <Image
          src={(option as IContactOption).avatar}
          className={styles.contactSearchOptionAvatar}
          width={40}
          height={40}
          alt={option.label}
        /> */}
        <img
          alt={option.label}
          src={(option as IContactOption).avatar}
          className={styles.contactSearchOptionAvatar}
        />
        <div className={styles.contactSearchOptionName} title={option.label}>
          {option.label}
        </div>
      </div>
    );
  };

  return googleApiScriptLoaded ? (
    <div className={styles.contactPage}>
      <SearchInput
        width={800}
        options={options}
        search={handleSearchContacts}
        onSelect={handleSelectContact}
        renderOption={renderContactOption}
        placeholder={"Search contacts"}
      />

      {googleApiScriptLoaded && !authorized ? (
        <button className={styles.authButton} onClick={handleAuthClick}>
          Click to Authorize
        </button>
      ) : (
        <ContactTable
          contacts={contacts}
          fetchNext={fetchMoreContacts}
          hasMore={hasMore}
        />
      )}
    </div>
  ) : (
    <div className={styles.loading}>
      <Spin size="large"></Spin>
    </div>
  );
}
