'use client';

import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocumentData } from "react-firebase-hooks/firestore";

import { useMemo } from "react";

interface SideBarOptionProps {
  href: string;
  id: string;
}

function SideBarOption({ href, id }: SideBarOptionProps) {
  // Memoize the document reference to prevent unnecessary hook re-subscriptions
  const docRef = useMemo(() => doc(db, 'documents', id), [id]);

  // Fetch the document data
  const [data, loading, error] = useDocumentData(docRef);

  // Get current path
  const pathName = usePathname();

  // Check if the link is active
  const isActive = href === pathName || (pathName !== '/' && href.endsWith(pathName));

  const title = data?.title || (loading ? "Loading..." : error ? "Document" : "Untitled Document");

  return (
    <Link
      href={href}
      className={`block border p-2 rounded-md transition-colors ${
        isActive
          ? 'text-gray-900 font-bold border-gray-900 bg-white shadow-xs text-sm'
          : 'border-gray-300 hover:border-gray-500 hover:bg-gray-100/60 text-gray-700 text-sm'
      }`}
    >
      <p className="truncate">
        {title}
      </p>
    </Link>
  );
}

export default SideBarOption;
