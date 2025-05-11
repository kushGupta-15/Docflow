"use client";

import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";

function Breadcrums() {
  const path = usePathname();
  const segments = path.split("/");
  console.log("segemnts : ",segments)

  return (
   
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
        {segments.map((segment,index)=>{
            if(!segment) return null;

            const href = `/${segments.slice(0,index+1).join("/")}`
            const isLast = index === segments.length-1
            console.log("href : ",href);
                return (
                        <React.Fragment key={index}>
                        <BreadcrumbSeparator key={index}/>
                        <BreadcrumbItem>
                        {isLast? (
                            <BreadcrumbPage>{segment}</BreadcrumbPage>
                        ) : (
                            <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
                        )}
                        
                        </BreadcrumbItem>
                        </React.Fragment>
                )
        })}
        </BreadcrumbList>
      </Breadcrumb>
    
  );
}

export default Breadcrums;