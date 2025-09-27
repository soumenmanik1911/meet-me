import { MeetingsView } from "@/modules/meetings/ui/meetings-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { HydrationBoundary,dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";

const page =() =>{
    const queryClient =getQueryClient();
    void queryClient.prefetchQuery(
        trpc.meetings.getMany.queryOptions({})

    );
    return(
        <div>
            <HydrationBoundary state ={dehydrate(queryClient)}>
                <Suspense >
         <MeetingsView/>
         </Suspense>
         </HydrationBoundary>
        </div>
    );
}
export default page;