'use client'

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

function BreadCrumbs() {
  const path = usePathname();

  const segments = path.split('/').filter(segment => segment);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join('/')}`;

          return (
            <Fragment key={`${segment}-${index}`}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={href}>
                  {decodeURIComponent(segment)}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadCrumbs;
