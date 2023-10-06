"use client";
import styles from "@/styles/Contact.module.css";
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
  const dispatch = useDispatch();
  /**
   * 用户身份是否已认证
   */
  const authorized = useSelector(selectAuthorized);
  /**
   * Google API 脚本是否已成功加载并初始化完毕
   */
  const googleApiScriptLoaded = useSelector(selectGoogleApiScriptLoaded);
  const [options, setOptions] = useState<IContactOption[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  const {
    list: contactsList,
    loading,
    fetchNext: fetchMoreContacts,
    reload: reloadContacts,
    hasMore,
  } = useLoadPaginationData<Contact>({
    requestFunc: (params: { pageToken?: string; pageSize?: number }) => {
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

  const handleSearchContacts = async (keyword: string) => {
    setSearching(!!keyword);

    if (keyword) {
      const resp = await Contact.searchContacts({ keyword });
      setContacts(resp.results);
    } else {
      await reloadContacts();
    }
  };

  const handleSelectContact = (value: string | number, option: IOption) => {};

  const renderContactOption = (option: IOption) => {
    return (
      <div className={styles.contactSearchOption}>
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

  const fetchSelectedContacts = async (
    selectedContactResourceNames: string[]
  ) => {
    const newSelectedContacts = await Contact.getContactsByResourceNames(
      selectedContactResourceNames
    );

    const newSelectedContactsMap: {
      [resourceName: string]: Contact;
    } = {};
    newSelectedContacts.forEach((contact) => {
      newSelectedContactsMap[contact.get("resourceName")] = contact;
    });

    const newContacts = [...contacts];
    newContacts.forEach((contact, index) => {
      const contactResourceName = contact.get("resourceName");

      if (newSelectedContactsMap[contactResourceName]) {
        newContacts.splice(
          index,
          1,
          newSelectedContactsMap[contactResourceName]
        );
      }
    });

    setContacts(newContacts);
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
          loading={loading === undefined ? true : loading}
          selectable={true}
          contacts={contacts}
          fetchNext={
            searching
              ? () => {
                  return Promise.resolve();
                }
              : fetchMoreContacts
          }
          hasMore={searching ? false : hasMore}
          onContactsUpdated={fetchSelectedContacts}
        />
      )}
    </div>
  ) : (
    <div className={styles.loading}>
      <Spin size="large"></Spin>
    </div>
  );
}
