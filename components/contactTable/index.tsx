"use client";
import { Contact } from "@/modules/Contact";
// import { useInViewport } from "ahooks";
import { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCustomGroups, selectCustomGroups } from "@/store/group";
import { Spin } from "antd";
import styles from "./style.module.css";

export interface IProps {
  contacts: Contact[];
  hasMore: boolean;
  fetchNext: () => Promise<void>;
}

export default function ContactTable(props: IProps) {
  const { contacts, hasMore, fetchNext } = props;
  const customGroups = useSelector(selectCustomGroups);
  const ref = useRef(null);
  // const [inViewport] = useInViewport(ref);

  useEffect(() => {
    const io = new IntersectionObserver((e) => {
      console.info("cyril IntersectionObserver e: ", e);

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

  const customGroupNamesMap = useMemo(() => {
    const map: {
      [resourceName: string]: string;
    } = {};

    customGroups?.forEach((group) => {
      map[group.get("resourceName")] = group.get("name");
    });

    return map;
  }, [customGroups]);

  // useEffect(() => {
  //   if (inViewport) {
  //     fetchNext();
  //   }
  // }, [inViewport]);

  return (
    <div className={styles.contactTable}>
      <div className={styles.contactTableHeader}>
        <div className={styles.contactName}>Name</div>
        <div className={styles.contactEmail}>Email</div>
        <div className={styles.contactTel}>Tel</div>
        <div className={styles.contactJobAndCompany}>Job And Company</div>
        <div className={styles.contactTags}>Tag</div>
      </div>
      <div className={styles.contacts}>
        {contacts.map((contact) => {
          return (
            <div className={styles.contact} key={contact.get("resourceName")}>
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
            </div>
          );
        })}
      </div>
      <div
        style={{ display: hasMore ? "flex" : "none" }}
        ref={ref}
        className={styles.scrollLoading}
      >
        <Spin />
      </div>
    </div>
  );
}
