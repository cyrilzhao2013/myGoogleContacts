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
  // const resourceName = `contactGroups/${params?.resourceName}`;
  const resourceNameRef = useRef<string>();
  resourceNameRef.current = `contactGroups/${params?.resourceName}`;

  const authorized = useSelector(selectAuthorized);
  const googleApiScriptLoaded = useSelector(selectGoogleApiScriptLoaded);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [group, setGroup] = useImmer<Group | null>(null);

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

  const { handleAuthClick } = useAuth({
    callback: async () => {
      await fetchData();
    },
  });

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
