"use client";
import { Contact } from "@/modules/Contact";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { TagFilled, UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { selectCustomGroups, setCustomGroups } from "@/store/group";
import { Spin, Checkbox, Select, message } from "antd";
import { useImmer } from "use-immer";
import styles from "./style.module.css";
import { Group } from "@/modules/Group";

export interface IProps {
  contacts: Contact[];
  hasMore: boolean;
  selectable?: boolean;
  loading?: boolean;
  fetchNext: () => Promise<void>;
  renderOperations?: (contact: Contact) => ReactNode;
  onContactsUpdated?: (selectedContactResourceNames: string[]) => Promise<void>;
}

export default function ContactTable(props: IProps) {
  const {
    contacts,
    hasMore,
    selectable,
    loading,
    fetchNext,
    renderOperations,
    onContactsUpdated,
  } = props;
  const customGroups = useSelector(selectCustomGroups);
  const [groupSelectorDropdownVisible, setGroupSelectorDropdownVisible] =
    useState<boolean>(false);
  const [selectedGroupResourceNames, setSelectedGroupResourceNames] = useState<
    string[]
  >([]);
  const [selectedContactsMap, updateSelectedContactsMap] = useImmer<{
    [resourceName: string]: Contact;
  }>({});
  const ref = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const io = new IntersectionObserver((e) => {
      if (e?.[0]?.isIntersecting) {
        fetchNext();
      }
    });

    io.observe(ref.current!);

    return () => {
      if (!ref.current) {
        return;
      }

      io.unobserve(ref.current!);
    };
  }, [fetchNext]);

  useEffect(() => {
    const groupResourceNames: string[] = [];

    customGroups.forEach((group) => {
      const isGroupSelected = Object.values(selectedContactsMap).length
        ? Object.values(selectedContactsMap).every((contact) => {
            return contact.get("groups").some((item) => {
              return item.resourceName === group.get("resourceName");
            });
          })
        : false;

      if (isGroupSelected) {
        groupResourceNames.push(group.get("resourceName"));
      }
    });

    setSelectedGroupResourceNames(groupResourceNames);
  }, [selectedContactsMap, customGroups]);

  const operationHeaderVisible = useMemo(() => {
    return !!Object.keys(selectedContactsMap).length;
  }, [selectedContactsMap]);

  const groupOptions = useMemo(() => {
    return customGroups.map((group) => {
      return {
        label: group.get("name"),
        value: group.get("resourceName"),
      };
    });
  }, [customGroups]);

  const customGroupNamesMap = useMemo(() => {
    const map: {
      [resourceName: string]: string;
    } = {};

    customGroups?.forEach((group) => {
      map[group.get("resourceName")] = group.get("name");
    });

    return map;
  }, [customGroups]);

  const reloadCustomGroups = async () => {
    const { results: groups } = await Group.getCustomGroups();
    dispatch(setCustomGroups(groups));
  };

  const clearSelectedContactsMap = () => {
    updateSelectedContactsMap((map) => {
      Object.keys(map).forEach((key) => {
        delete map[key];
      });
    });
  };

  console.info("cyril contacts: ", contacts);

  return (
    <div className={styles.contactTable}>
      {!operationHeaderVisible ? (
        <div className={styles.contactTableHeader}>
          {selectable ? (
            <div className={styles.checkbox}>
              <></>
            </div>
          ) : null}
          <div className={styles.contactName}>Name</div>
          <div className={styles.contactEmail}>Email</div>
          <div className={styles.contactTel}>Tel</div>
          <div className={styles.contactJobAndCompany}>Job And Company</div>
          <div className={styles.contactTags}>Tag</div>
          {renderOperations ? (
            <div className={styles.operations}>Operations</div>
          ) : null}
        </div>
      ) : (
        <div className={styles.contactTableOperationHeader}>
          <div className={styles.selectedContactsCount}>{`${
            Object.keys(selectedContactsMap).length
          } ${
            Object.keys(selectedContactsMap).length > 1 ? "contacts" : "contact"
          } selected`}</div>

          <div className={styles.contactsBatchOperations}>
            <div className={styles.contactGroupSelectorWrapper}>
              <label>Manage Tags: </label>
              <Select
                popupMatchSelectWidth={300}
                className={styles.contactGroupSelector}
                open={groupSelectorDropdownVisible}
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Please select"
                value={selectedGroupResourceNames}
                onDropdownVisibleChange={(val) => {
                  setGroupSelectorDropdownVisible(val);
                }}
                onChange={async (newSelectedGroupResourceNames) => {
                  setGroupSelectorDropdownVisible(false);

                  const tasks: Promise<void>[] = [];

                  const selectedContactResourceNames = Object.values(
                    selectedContactsMap
                  ).map((contact) => {
                    return contact.get("resourceName");
                  });
                  clearSelectedContactsMap();

                  const addedGroupResourceNames: string[] =
                    newSelectedGroupResourceNames
                      .concat(selectedGroupResourceNames)
                      .filter((resourceName) => {
                        return !selectedGroupResourceNames.includes(
                          resourceName
                        );
                      });
                  addedGroupResourceNames.forEach((groupResourceName) => {
                    const group = customGroups.find((item) => {
                      return item.get("resourceName") === groupResourceName;
                    });

                    if (!group) {
                      return;
                    }

                    tasks.push(
                      group
                        .addContacts(selectedContactResourceNames)
                        .then(() => {
                          message.success(
                            `${selectedContactResourceNames.length} ${
                              selectedContactResourceNames.length > 1
                                ? "contacts"
                                : "contact"
                            } added into group ${group.get("name")}`
                          );
                        })
                        .catch(() => {})
                    );
                  });

                  const deletedGroupResourceNames: string[] =
                    newSelectedGroupResourceNames
                      .concat(selectedGroupResourceNames)
                      .filter((resourceName) => {
                        return !newSelectedGroupResourceNames.includes(
                          resourceName
                        );
                      });
                  deletedGroupResourceNames.forEach((groupResourceName) => {
                    const group = customGroups.find((item) => {
                      return item.get("resourceName") === groupResourceName;
                    });

                    if (!group) {
                      return;
                    }

                    tasks.push(
                      group
                        .removeContacts(selectedContactResourceNames)
                        .then(() => {
                          message.success(
                            `${selectedContactResourceNames.length} ${
                              selectedContactResourceNames.length > 1
                                ? "contacts"
                                : "contact"
                            } removed from group ${group.get("name")}`
                          );
                        })
                        .catch(() => {})
                    );
                  });

                  await Promise.all(tasks).catch(() => {});

                  await Promise.all([
                    reloadCustomGroups().catch(() => {}),
                    onContactsUpdated?.(selectedContactResourceNames).catch(
                      () => {}
                    ),
                  ]);

                  setSelectedGroupResourceNames(newSelectedGroupResourceNames);
                }}
                options={groupOptions}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex" }} className={styles.scrollLoading}>
          <Spin />
        </div>
      ) : (
        <>
          {contacts?.length ? (
            <div className={styles.contacts}>
              {contacts.map((contact) => {
                return (
                  <div
                    className={styles.contact}
                    key={contact.get("resourceName")}
                    onClick={() => {
                      if (!selectable) {
                        return;
                      }

                      updateSelectedContactsMap((map) => {
                        if (map[contact.get("resourceName")]) {
                          delete map[contact.get("resourceName")];
                        } else {
                          map[contact.get("resourceName")] = contact;
                        }
                      });
                    }}
                  >
                    {selectable ? (
                      <div className={styles.checkbox}>
                        <Checkbox
                          checked={
                            !!selectedContactsMap[contact.get("resourceName")]
                          }
                        />
                      </div>
                    ) : null}
                    <div className={styles.contactName}>
                      <img
                        alt={contact.getName()}
                        src={contact.get("avatar")}
                        className={styles.contactAvatar}
                      />
                      <div
                        title={contact.getName()}
                        className={styles.contactNameText}
                      >
                        {contact.getName()}
                      </div>
                    </div>
                    <div className={styles.contactEmail}>
                      {contact.get("emails")?.[0]?.email
                        ? contact.get("emails")?.[0]?.email
                        : ""}
                    </div>
                    <div className={styles.contactTel}>
                      {contact.get("telephones")?.[0]?.tel
                        ? contact.get("telephones")?.[0]?.tel
                        : ""}
                    </div>
                    <div className={styles.contactJobAndCompany}>
                      {contact.get("company")} {contact.get("jobTitle")}
                    </div>
                    <div className={styles.contactTags}>
                      {contact
                        .get("groups")
                        ?.filter((group) => {
                          return !!customGroupNamesMap[group.resourceName];
                        })
                        ?.map((group) => {
                          return (
                            <div key={group.id} className={styles.contactTag}>
                              {customGroupNamesMap[group.resourceName]}
                            </div>
                          );
                        })}
                    </div>
                    {renderOperations ? (
                      <div className={styles.operations}>
                        {renderOperations?.(contact)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}>No contacts found</div>
          )}
        </>
      )}

      <div
        style={{ display: hasMore && !loading ? "flex" : "none" }}
        ref={ref}
        className={styles.scrollLoading}
      >
        <Spin />
      </div>
    </div>
  );
}
