"use client";
import { useRouter } from "next/navigation";

export default function ContactsPage() {
  const router = useRouter();

  router.push("/contact");
}
