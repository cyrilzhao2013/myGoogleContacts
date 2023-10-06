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

/**
 * 联系人列表组件，支持以下功能：
 * - 展示联系人列表；
 * - 可选择多个联系人，并修改其所在的用户组；
 * - 滚动分页加载更多联系人数据；
 * - 自定义每个联系人右侧的操作栏；
 *
 * @param contacts              要展示的联系人列表
 * @param hasMore               是否还有下一页数据，若无则不再进行滚动加载
 * @param selectable            是否为可多选模式，可多选模式下每个联系人左侧会出现复选框
 * @param loading               是否为 loading 状态
 * @param fetchNext             加载下一页数据的回调函数，供滚动加载时使用
 * @param renderOperations      自定义每个联系人右侧的操作栏
 * @param onContactsUpdated     列表中的联系人被操作发生更新时通知父组件的回调函数，传入被更新联系人的 resourceName 列表，由父组件对联系人列表数据进行更新
 *
 */
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
  const dispatch = useDispatch();
  const customGroups = useSelector(selectCustomGroups);
  /**
   * 是否显示自定义用户组下拉菜单，该下拉菜单在每次点击其内部菜单项时都会收起
   */
  const [groupSelectorDropdownVisible, setGroupSelectorDropdownVisible] =
    useState<boolean>(false);
  /**
   * 被选择的联系人列表中，所有联系人同时都在的自定义用户组 resourceName 列表，用于提供给自定义用户组下拉菜单进行回显
   */
  const [selectedGroupResourceNames, setSelectedGroupResourceNames] = useState<
    string[]
  >([]);
  /**
   * 记录所有被选择联系人的 map
   */
  const [selectedContactsMap, updateSelectedContactsMap] = useImmer<{
    [resourceName: string]: Contact;
  }>({});
  /**
   * 用于提供给 IntersectionObserver 检测列表底部的 loading 组件是否进入 viewport
   */
  const loadingRef = useRef(null);

  /**
   * 是否展示列表顶部的操作栏，只有在有联系人被选中的情况下才展示
   */
  const operationHeaderVisible = useMemo(() => {
    return !!Object.keys(selectedContactsMap).length;
  }, [selectedContactsMap]);

  /**
   * 自定义用户组下拉菜单中的列表项
   */
  const groupOptions = useMemo(() => {
    return customGroups.map((group) => {
      return {
        label: group.get("name"),
        value: group.get("resourceName"),
      };
    });
  }, [customGroups]);

  /**
   * 自定义用户组下拉菜单中的列表项
   */
  const customGroupNamesMap = useMemo(() => {
    const map: {
      [resourceName: string]: string;
    } = {};

    customGroups?.forEach((group) => {
      map[group.get("resourceName")] = group.get("name");
    });

    return map;
  }, [customGroups]);

  /**
   * 从当前用户组中删除某个用户时，需要重新获取用户组列表数据以更新左侧导航栏中用户组内用户数的显示数量
   */
  const reloadCustomGroups = async () => {
    const { results: groups } = await Group.getCustomGroups();
    dispatch(setCustomGroups(groups));
  };

  /**
   * 清除所有联系人的被选中状态，使得列表顶部的操作栏隐藏；
   * 在选择自定义用户组下拉菜单中的某个菜单项之后触发
   */
  const clearSelectedContactsMap = () => {
    updateSelectedContactsMap((map) => {
      Object.keys(map).forEach((key) => {
        delete map[key];
      });
    });
  };

  /**
   * 自定义用户组下拉菜单中的某个用户组被点击时触发的回调函数
   * 用于对被选中的多个联系人批量新增/删除所在的某个自定义用户组
   *
   * @param groupResourceNames    被点击的自定义用户组 resourceName 列表
   */
  const handleCustomGroupSelect = async (groupResourceNames: string[]) => {
    setGroupSelectorDropdownVisible(false);

    const tasks: Promise<void>[] = [];

    const selectedContactResourceNames = Object.values(selectedContactsMap).map(
      (contact) => {
        return contact.get("resourceName");
      }
    );
    clearSelectedContactsMap();

    // 根据差集找出要新增的自定义用户组 resourceName 列表
    const addedGroupResourceNames: string[] = groupResourceNames
      .concat(selectedGroupResourceNames)
      .filter((resourceName) => {
        return !selectedGroupResourceNames.includes(resourceName);
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
                selectedContactResourceNames.length > 1 ? "contacts" : "contact"
              } added into group ${group.get("name")}`
            );
          })
          .catch(() => {})
      );
    });

    // 根据差集找出要删除的自定义用户组 resourceName 列表
    const deletedGroupResourceNames: string[] = groupResourceNames
      .concat(selectedGroupResourceNames)
      .filter((resourceName) => {
        return groupResourceNames.includes(resourceName);
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
                selectedContactResourceNames.length > 1 ? "contacts" : "contact"
              } removed from group ${group.get("name")}`
            );
          })
          .catch(() => {})
      );
    });

    await Promise.all(tasks).catch(() => {});

    // 执行完用户组相关操作后，更新页面数据
    await Promise.all([
      reloadCustomGroups().catch(() => {}),
      onContactsUpdated?.(selectedContactResourceNames).catch(() => {}),
    ]);

    setSelectedGroupResourceNames(groupResourceNames);
  };

  /**
   * 检测联系人列表底部的 loading 组件是否进入 viewport，进入 viewport 时尝试获取下一页数据
   */
  useEffect(() => {
    if (!loadingRef.current) {
      return;
    }

    const io = new IntersectionObserver((e) => {
      if (e?.[0]?.isIntersecting) {
        fetchNext();
      }
    });

    io.observe(loadingRef.current!);

    return () => {
      if (!loadingRef.current) {
        return;
      }

      io.unobserve(loadingRef.current!);
    };
  }, [fetchNext]);

  /**
   * 被选中的联系人列表发生变化时，要统计这些联系人所在的自定义用户组，找出所有人都在的自定义用户组 resourceName，用于给自定义用户组下拉菜单进行回显
   */
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
                onChange={handleCustomGroupSelect}
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
        ref={loadingRef}
        className={styles.scrollLoading}
      >
        <Spin />
      </div>
    </div>
  );
}
