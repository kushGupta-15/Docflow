'use client';

import { db } from "@/firebase";
import { doc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDocumentData } from "react-firebase-hooks/firestore";

interface SideBarOptionProps {
  href: string;
  id: string;
}

function SideBarOption({ href, id }: SideBarOptionProps) {
  // Create the document reference inside the component
  const docRef = doc(db, 'documents', id);

  // Fetch the document data
  const [data, loading, error] = useDocumentData(docRef);

  // Get current path
  const pathName = usePathname();

  // Check if the link is active
  const isActive = href.includes(pathName) && pathName !== '/';

  // Handle loading state
  if (loading) return <p>Loading...</p>;

  // Handle error state
  if (error) return <p>Error loading document</p>;

  // Ensure data is available
  if (!data) return null;

  return (
    <Link
      href={href}
      className={`border p-2 rounded-md ${isActive ? 'text-gray-500 font-bold border-black text-sm' : 'border-gray-400 text-sm'}`}
    >
      <p className="truncate">
        {data.title}
      </p>
    </Link>
  );
}

export default SideBarOption;
