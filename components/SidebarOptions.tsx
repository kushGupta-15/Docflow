'use client'
import React from "react";
import Link from "next/link";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc } from "firebase/firestore";
import { db } from "@/firebase";
import { usePathname } from "next/navigation";

function SidebarOptions({ href, id }: { href: string; id: string }) {
  const [data, loading, error] = useDocumentData(doc(db, "Documents", id));
  const pathname = usePathname();
  const isActive = href.includes(pathname) && pathname!=='/';

if(!data) return null

  return (
    
      <Link href={href} className={`border p-2 rounded-md ${isActive ? "bg-gray-300 font-bold border-black text-black" : "border-gray-400 text-bold text-black"}`}>
      <p className="truncate">{data.title}</p>
       </Link>
     
  );
}
export default SidebarOptions;