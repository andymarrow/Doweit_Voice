import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";


export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        picture: v.string(),
        uid: v.string(),
        token:v.optional(v.number())
    }),
    workspace: defineTable({
        messages: v.any(), //since we are storing messages we could have just said string but we want to store the json object value here so we will use any i guess because the messages are iterative and a user might send many messages
        fileData: v.optional(v.any()),//here we will be storing the generated code but at first obviously its empty so we will make it empty here
        user: v.id('users')
    })
})