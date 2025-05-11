
import React, { useState } from 'react'
import Document from '@/components/Document'


type Params = Promise<{id : string}>

async function page({params} : {params : Params}) {
  const {id} = await params; // params now id of type Promise it returns a promise speacially in the dynamic routes

  return (
    <div className='flex flex-col flex-1 min-h-screen'>
    <Document id={id}/> 
    </div>
  )
}

export default page