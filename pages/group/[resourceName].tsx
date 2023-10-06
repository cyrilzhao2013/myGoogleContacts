"use client";
import { useAuth } from "@/hooks/useAuth";
import { Contact } from "@/modules/Contact";
import { Group } from "@/modules/Group";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { TagFilled, UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { useImmer } from "use-immer";
import { useDispatch, useSelector } from "react-redux";
import { setCustomGroups, selectCustomGroups } from "@/store/group";
import ContactTable from "@/components/contactTable";
import styles from "@/styles/Group.module.css";
import { Spin, message } from "antd";
import {
  selectAuthorized,
  selectGoogleApiScriptLoaded,
  setAuthorized,
  setGoogleApiScriptLoaded,
} from "@/store/auth";

export default function GroupPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const resourceNameRef = useRef<string>();
  resourceNameRef.current = `contactGroups/${params?.resourceName}`;

  /**
   * 用户身份是否已认证
   */
  const authorized = useSelector(selectAuthorized);
  /**
   * Google API 脚本是否已成功加载并初始化完毕
   */
  const googleApiScriptLoaded = useSelector(selectGoogleApiScriptLoaded);
  /**
   * 当前用户组下的所有联系人列表
   */
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  /**
   * 当前用户组
   */
  const [group, setGroup] = useImmer<Group | null>(null);

  /**
   * 页面初始化时获取用户组详情和联系人列表数据
   */
  const fetchData = async () => {
    if (!resourceNameRef.current) {
      return;
    }

    try {
      setLoading(true);

      const group = await Group.getGroupDetails(resourceNameRef.current);
      setGroup(group);

      const memberResourceNames = group.get("memberResourceNames");
      if (!memberResourceNames?.length) {
        setLoading(false);
        setContacts([]);
        return;
      }

      const contacts = await Contact.getContactsByResourceNames(
        memberResourceNames
      );
      setContacts(contacts);

      setLoading(false);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  /**
   * 页面初始化时先判断是否已授权身份认证，没有的话走授权流程，已授权则直接获取页面数据
   */
  const { handleAuthClick } = useAuth({
    callback: async () => {
      await fetchData();
    },
  });

  /**
   * 从当前用户组中删除某个用户时，需要重新获取用户组列表数据以更新左侧导航栏中用户组内用户数的显示数量
   */
  const reloadCustomGroups = async () => {
    const { results: groups } = await Group.getCustomGroups();
    dispatch(setCustomGroups(groups));
  };

  useEffect(() => {
    if (googleApiScriptLoaded && authorized) {
      fetchData();
    }
  }, [resourceNameRef.current]);

  return googleApiScriptLoaded ? (
    <div className={styles.groupPage}>
      {googleApiScriptLoaded && authorized ? (
        <div>
          {group?.get("formattedName")} {`(${group?.get("memberCount")})`}
        </div>
      ) : null}
      {googleApiScriptLoaded && !authorized ? (
        <button className={styles.authButton} onClick={handleAuthClick}>
          Click to Authorize
        </button>
      ) : (
        <ContactTable
          loading={loading}
          contacts={contacts}
          fetchNext={async () => {}}
          hasMore={false}
          renderOperations={(contact: Contact) => {
            return (
              <>
                <div
                  className={styles.contactOperationButton}
                  onClick={async (e) => {
                    e.preventDefault();

                    await group?.removeContacts([contact.get("resourceName")]);

                    await Promise.all([
                      fetchData().catch(() => {}),
                      reloadCustomGroups().catch(() => {}),
                    ]);

                    message.success(
                      `Contact ${contact.getName()} is removed from current group`
                    );

                    setContacts(
                      contacts.filter((item) => {
                        return (
                          item.get("resourceName") !==
                          contact.get("resourceName")
                        );
                      })
                    );
                  }}
                >
                  <DeleteOutlined />
                </div>
              </>
            );
          }}
        />
      )}
    </div>
  ) : (
    <div className={styles.loading}>
      <Spin size="large"></Spin>
    </div>
  );
}
