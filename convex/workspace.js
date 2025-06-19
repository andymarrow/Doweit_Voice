import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateWorkspace = mutation({
    args: {
        messages: v.any(),
        user: v.string(), // this will be the uid
    },
    handler: async (ctx, args) => {
        // Find the user by UID in the 'users' table
        const user = await ctx.db.query('users')
            .filter(q => q.eq(q.field('uid'), args.user))
            .collect();

        // If user is found, use their _id for the workspace
        if (user.length > 0) {
            const userId = user[0]._id; // Get the _id of the user

            // Insert the workspace with the userId as the user field
            const workspaceId = await ctx.db.insert('workspace', {
                messages: args.messages,
                user: userId, // Store the _id from the users table to create a relation
            });

            return workspaceId;
        } else {
            throw new Error("User not found");
        }
    },
});


export const GetWorkspace = query({
    args: {
        workspaceId: v.id('workspace')
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.get(args.workspaceId);
        return result;
    }
})


export const UpdateMessages=mutation({
    args:{
        workspaceId:v.id('workspace'),
        messages:v.any()//its put to any because what it accepts is in a json format meaning alot of messages from bot ai and human based on role
    },
    handler:async(ctx,args)=>{
        const result=await ctx.db.patch(args.workspaceId,{
            messages:args.messages
        });
        return result
    }
})

export const UpdateFilesCode=mutation({
    args:{
        workspaceId:v.id('workspace'),
        files:v.optional(v.any())//its put to any because what it accepts is in a json format meaning alot of messages from bot ai and human based on role
    },
    handler:async(ctx,args)=>{
        const result=await ctx.db.patch(args.workspaceId,{
            fileData:args.files
        });
        return result
    }
})


export const GetAllWorkspace=query({
    args:{
        userId:v.id('users')
    },
    handler:async(ctx,args)=>{
        const result=await ctx.db.query('workspace')
        .filter(q=>q.eq(q.field('user'),args.userId))
        .collect();
        return result;
    }
})
