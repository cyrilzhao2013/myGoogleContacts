"use client";
import { useAuth } from "@/hooks/useAuth";
import { Contact } from "@/modules/Contact";
import { Group } from "@/modules/Group";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useImmer } from "use-immer";

export default function GroupPage() {
  const searchParams = useSearchParams();
  const resourceName = searchParams.get("resourceName");

  const [contacts, setContacts] = useImmer<Contact[]>([]);
  const [group, setGroup] = useImmer<Group | null>(null);

  const fetchData = async () => {
    if (!resourceName) {
      return;
    }

    const group = await Group.getGroupDetails(resourceName);
    setGroup(group);

    const contacts = await Contact.getContactsByResourceNames(
      group.get("memberResourceNames")
    );
    setContacts(contacts);
  };

  useAuth({
    callback: async () => {
      await fetchData();
    },
  });

  useEffect(() => {
    console.info("cyril searchParams: ", searchParams);
    console.info("cyril resourceName: ", resourceName);
  }, []);

  return <div></div>;
}
