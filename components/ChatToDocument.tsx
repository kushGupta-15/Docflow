// "use client";
// import React, { FormEvent, useTransition } from 'react'
// import {
//     Dialog,
//     DialogContent,
//     DialogDescription,
//     DialogHeader,
//     DialogTitle,
//     DialogTrigger,
  
//   } from "@/components/ui/dialog"
//   import { useState } from 'react';
//   import { Button } from './ui/button';
// import { toast } from "sonner";
// import { Input } from './ui/input';
// import * as Y from "yjs"
// import { BotIcon, MessageCircleCode } from 'lucide-react';
// import Markdown from 'react-markdown';
  

// function ChatToDocument({doc} : {doc : Y.Doc}) {
//        const [isOpen, setIsOpen] = useState(false);
//         const [isPending, startTransition] = useTransition();
//         const [language, setLanguage] = useState<string>("english");
//         const [summary,setSummary] = useState("");
//         const [question, setQuestion] = useState("");
//         const [input,setInput] = useState("");

//     const handleAskQuestion = async (e:FormEvent)=>{
//         e.preventDefault();
//         setQuestion(input);

//         startTransition(async ()=>{
//             const documentData = doc.get("document-store").toJSON();
//             console.log(documentData)
            
//             try{
//                 const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8787';
//                 // const baseUrl = 'http://127.0.0.1:8787';
//                 const res = await fetch(`${baseUrl}/chatToDocument`,{
//                     method : "POST",
//                     headers : {
//                         "Content-Type" : "application/json",
//                     },
//                     body : JSON.stringify({
//                         documentData,
//                         question : input,
//                     })
//                 });

//                 if(res.ok){
//                     const {message} = await res.json();

//                     setInput("");
//                     setSummary(message);

//                     toast.success("Question asked successfully");
//                 }

//             }catch(error){
//                 console.log("error in chat to document" , error);
//             }
//         })


        
    
//     }
//   return (
//     <Dialog open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant={"outline"} asChild>
//         {/*as child is used to wrap the button around the dialog trigger */}
//         <DialogTrigger> <MessageCircleCode className='mr-2'/> Chat to Document</DialogTrigger>
//       </Button>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Chat to Document</DialogTitle>
//           <DialogDescription>
//             Ask a question and chat to the document with AI.
//           </DialogDescription>

//           <hr className='mt-5'/>

//           {question &&  (
//             <p className='mt-5 text-gray-500'>Q: {question}</p>
//           )}
//         </DialogHeader>
//         {summary &&  (
//             <div className='flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100'>
//               <div className='flex'>
//                 <BotIcon className='w-10 flex-shrink-0'/>
//                 <p className='font-bold'>
//                   GPT {isPending ? "is thinking..." : "Says"}
//                 </p>
//               </div>
//               <div > {isPending ? "Thinking..." : <Markdown>{summary}</Markdown>}</div>
//             </div>
//           )}
//         <form onSubmit={handleAskQuestion} className="flex  gap-2">
//           <Input
//             type="text"
//             placeholder="i.e what is this about?"
//             onChange={(e) => setInput(e.target.value)}
//             value={input}
//             className="w-full"
//           />
//           <Button type="submit" disabled={!input || isPending}>
//             {isPending ? "Asking..." : "Ask"}
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default ChatToDocument

"use client";
import React, { FormEvent, useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  
  } from "@/components/ui/dialog"
  import { useState } from 'react';
  import { Button } from './ui/button';
import { toast } from "sonner";
import { Input } from './ui/input';
import * as Y from "yjs"
import { BotIcon, MessageCircleCode } from 'lucide-react';
import Markdown from 'react-markdown';
  

function ChatToDocument({doc} : {doc : Y.Doc}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [language, setLanguage] = useState<string>("english");
    const [summary, setSummary] = useState("");
    const [question, setQuestion] = useState("");
    const [input, setInput] = useState("");

    const handleAskQuestion = async (e:FormEvent) => {
        e.preventDefault();
        setQuestion(input);

        startTransition(async () => {
            const documentData = doc.get("document-store").toJSON();
            console.log(documentData)
            
            try {
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:8787';
                // const baseUrl = 'http://127.0.0.1:8787';
                const res = await fetch(`${baseUrl}/chatToDocument`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        documentData,
                        question: input,
                    })
                });

                if (res.ok) {
                    const {message} = await res.json();

                    setInput("");
                    setSummary(message);

                    toast.success("Question asked successfully");
                } else {
                    const errorData = await res.json();
                    console.error("Error response:", errorData);
                    toast.error("Failed to get an answer: " + (errorData.message || "Unknown error"));
                }

            } catch (error) {
                console.error("Error in chat to document", error);
                toast.error("Failed to communicate with the AI service");
            }
        });    
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button variant={"outline"} asChild>
                {/*as child is used to wrap the button around the dialog trigger */}
                <DialogTrigger> <MessageCircleCode className='mr-2'/> Chat to Document</DialogTrigger>
            </Button>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Chat to Document</DialogTitle>
                    <DialogDescription>
                        Ask a question and chat to the document with AI.
                    </DialogDescription>

                    <hr className='mt-5'/>

                    {question && (
                        <p className='mt-5 text-gray-500'>Q: {question}</p>
                    )}
                </DialogHeader>
                {summary && (
                    <div className='flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100'>
                        <div className='flex'>
                            <BotIcon className='w-10 flex-shrink-0'/>
                            <p className='font-bold'>
                                AI {isPending ? "is thinking..." : "Says"}
                            </p>
                        </div>
                        <div> {isPending ? "Thinking..." : <Markdown>{summary}</Markdown>}</div>
                    </div>
                )}
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="i.e what is this about?"
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                        className="w-full"
                    />
                    <Button type="submit" disabled={!input || isPending}>
                        {isPending ? "Asking..." : "Ask"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default ChatToDocument