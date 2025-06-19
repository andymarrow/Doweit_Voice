import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

//we added mutation here because we are tring to add a record
export const CreateUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    uid: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a user already exists with the provided `email` or `uid`
    const user = await ctx.db
      .query("users")
      .filter(
        (q) =>
          q.eq(q.field("email"), args.email) || q.eq(q.field("uid"), args.uid)
      ) // Check both email and uid
      .collect();
    console.log(user);
    //If Noy .then add new user
    if (user?.length == 0) {
      const result = await ctx.db.insert("users", {
        name: args.name,
        picture: args.picture,
        email: args.email,
        uid: args.uid,
        token: 50000, //the free token anybody would get on there first login
      });
      console.log(result);
    }
  },
});

//code to get the query from the table user just using the email or filtering the email that table
//not going to use this mostly because i already have clerk to authenticate the user but its nice practise to have it here i guess.

export const GetUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .collect();
    return user[0];
  },
});

export const UpdateToken = mutation({
  args: {
    token: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Ensure token cannot be less than 0 am doing this here because the modal saying you dont have enough tokens isnt being visible for a token less thatn 0
    const newToken = Math.max(0, args.token);

    const result = await ctx.db.patch(args.userId, {
      token: args.token,
    });
    return result;
  },
});
