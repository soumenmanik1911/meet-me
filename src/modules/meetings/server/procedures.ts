import { createTRPCRouter,  protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { meetings } from "@/db/schema";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { z } from "zod";
import { and, eq, ilike, count } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema, meetingsUpdateSchema } from "../schema";

export const meetingsRouter = createTRPCRouter({

//   .input(agentUpdateSchema)
//   .mutation(async ({ input, ctx }) => {
//     const [updatedAgent] = await db
//     .update(meetings)
//     .set(input)
//      .where(
//           and(
//             eq(meetings.id, input.id),
//             eq(meetings.userId, ctx.auth.user.id)
//           ),
//         )
//             .returning();

//         if(!updatedAgent){
//           throw new TRPCError({
//             code: 'NOT_FOUND',
//             message: 'Agent not found',
//           })
//         }
//         return updatedAgent;

//       }),


//   remove:protectedProcedure
//     .input(z.object({ id: z.string() }))
//     .mutation(async ({ input, ctx }) => {
//       const [removedAgent] = await db
//         .delete(meetings)
//         .where(
//           and(
//             eq(meetings.id, input.id),
//             eq(meetings.userId, ctx.auth.user.id)
//           ),
//         )
//         .returning();

//         if(!removedAgent){
//           throw new TRPCError({
//             code: 'NOT_FOUND',
//             message: 'Agent not found',
//           })
//         }
//         return removedAgent;
//     }),
   update: protectedProcedure
    .input(meetingsUpdateSchema)
    .mutation(async ({ input, ctx }) => {
      const [updatedMeeting] = await db
      .update(meetings)
      .set(input)
        .where(
            and(
              eq(meetings.id, input.id),
              eq(meetings.userId, ctx.auth.user.id)
            ),
          )
              .returning();
  
          if(!updatedMeeting){
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Meeting not found',
            })
          }
          return updatedMeeting;
  
        }),
  create: protectedProcedure
    .input(meetingsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      const [createdMeeting] = await db
        .insert(meetings)
        .values({
          ...input,
          userId: ctx.auth.user.id,
        })
        .returning();
      return createdMeeting;
    }),

getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input ,ctx}) => {
      const [existingmeetings] = await db
        .select()
       .from(meetings)
      .where(
        and(
          eq(meetings.id, input.id),
          eq(meetings.userId, ctx.auth.user.id)
        )
      );

    if (!existingmeetings) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Meeting not found',
      });
    }

    return existingmeetings;
  }),

  getMany: protectedProcedure
    .input(
      z
        .object({
          limit: z
            .number()
            .min(MIN_PAGE_SIZE)
            .max(MAX_PAGE_SIZE)
            .default(DEFAULT_PAGE_SIZE),
          offset: z.number().min(0).default(0),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? DEFAULT_PAGE_SIZE;
      const offset = input?.offset ?? 0;
      const search = input?.search?.trim();

      const where = and(
        eq(meetings.userId, ctx.auth.user.id),
        search ? ilike(meetings.name, `%${search}%`) : undefined,
      );

      const data = await db
        .select()
        .from(meetings)
        .where(where)
        .limit(limit)
        .offset(offset);

      const [totalRow] = await db
        .select({ count: count() })
        .from(meetings)
        .where(where);

      const totalPages = Math.ceil((totalRow?.count ?? 0) / limit);

      return { items: data, total: totalRow?.count ?? 0, totalPages };
    }),


});
