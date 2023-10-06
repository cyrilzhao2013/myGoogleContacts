"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { selectCustomGroups, setCustomGroups } from "@/store/group";
import styles from "./style.module.css";
import { TagFilled, UserOutlined, DeleteOutlined } from "@ant-design/icons";
import { selectAuthorized } from "@/store/auth";
import CreateGroupModal from "../createGroupModal";
import { Group } from "@/modules/Group";

export default function LeftNav() {
  const authorized = useSelector(selectAuthorized);
  const customGroups = useSelector(selectCustomGroups);
  const pathname = usePathname();
  const dispatch = useDispatch();

  return (
    <nav className={styles.leftNav}>
      <div className={styles.name}>My Google Contacts</div>
      <Link
        className={`${styles.link} ${
          pathname === "/contact" ? styles.linkActive : ""
        }`}
        href={`/contact`}
      >
        <UserOutlined className={styles.linkIcon} />
        <span>contacts</span>
      </Link>
      <div className={styles.linkWrapper}>
        <div className={styles.linkHeader}>
          <span>Tags</span>
          {authorized ? <CreateGroupModal /> : null}
        </div>
      </div>

      {customGroups.map((group) => {
        return (
          <Link
            key={group.get("resourceName")}
            className={`${styles.link} ${styles.groupLink}`}
            href={`/group/${encodeURIComponent(
              group.get("resourceName").split("/")[1]
            )}`}
          >
            <TagFilled className={styles.linkIcon} />
            <div className={styles.groupLinkContent}>
              <div>{group.get("name")}</div>
              <div className={styles.groupOperations}>
                <div
                  className={styles.groupOperationButton}
                  onClick={async (e) => {
                    e.preventDefault();

                    await group.deleteGroup();

                    const { results: groups } = await Group.getCustomGroups();
                    dispatch(setCustomGroups(groups));
                  }}
                >
                  <DeleteOutlined />
                </div>
              </div>
              <div className={styles.groupMemberCount}>
                {group.get("memberCount")}
              </div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
