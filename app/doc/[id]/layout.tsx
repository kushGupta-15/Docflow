import { auth } from "@clerk/nextjs/server";
import RoomProvider from "@/components/RoomProvider";

type Params = Promise<{id : string}>
async function DocLayout(
  {
    children,
    params,
  }: {
    children: React.ReactNode;
    params: Params;
  }
) {
  const {id} = await params;
  await auth.protect();
return <RoomProvider roomId={id}>{children}</RoomProvider>
}
export default DocLayout;