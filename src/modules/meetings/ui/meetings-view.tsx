"use client";
import {useQuery} from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const MeetingsView =() =>{
    const trpc = useTRPC();
    const {data} =useQuery(trpc.meetings.getMany.queryOptions({}));

    return(
        <div className="w-full p-4 bg-white rounded-lg shadow-md">
            <pre className="text-sm overflow-x-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
