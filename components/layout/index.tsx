import type { Metadata } from "next";
import { Inter } from "next/font/google";
import LeftNav from "@/components/leftnav";
import { useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Google Contacts",
  description: "Generated by create next app",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.info("cyril layout mounted");
  }, []);

  return (
    <div className={"container"}>
      <LeftNav />
      <main className={"main-content"}>{children}</main>
    </div>
  );
}