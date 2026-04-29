# Telegram integration — setup guide

Send post-call summaries and extracted actions to a Telegram chat or group via your own bot. No domain or hosting required — just a free bot from @BotFather.

You will:

1. Create a bot with @BotFather and copy its token
2. Paste the token into the workspace Integrations page
3. Find the chat ID (DM, group, or channel) you want messages sent to
4. Configure a per-agent rule and test it

---

## 1. Create your bot

1. Open Telegram and start a chat with **@BotFather** (https://t.me/BotFather).
2. Send `/newbot`.
3. Pick a display name (e.g. *Doweit Voice Bot*).
4. Pick a username — must end in `bot` (e.g. `doweitvoice_bot`). Must be globally unique.
5. @BotFather replies with a **token** that looks like:
   ```
   123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
   ```
   **Treat this like a password.** Anyone with the token can post as your bot.

Optional polish (run inside @BotFather):

- `/setdescription` — what the bot does
- `/setuserpic` — upload a profile picture
- `/setcommands` — typically not needed for this integration
- `/setprivacy` → **Disable** if you want the bot to read all group messages (not required for our use; we only *send*).

## 2. Connect the bot in Doweit Voice

1. In the app: **Call Agents → Integrations** (workspace page) → click the **Telegram** card.
2. Paste the bot token. Click **Connect**.
3. We call Telegram's `getMe` to validate; on success the card flips to "Connected".

## 3. Find the chat ID

This is the trickiest step on Telegram (deliberately — privacy). Three approaches, pick whichever fits:

### a) Personal DM with the bot

1. Open Telegram, search for your bot's username, click **Start**. (You must initiate the chat — bots cannot DM you first.)
2. Send any message (e.g. "hi").
3. Open in a browser (replace `<TOKEN>` with your bot token):
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
4. You'll see JSON. Look for `chat.id` — it's a number like `123456789`. That's your chat ID.

### b) Group chat

1. Add the bot to the group as a member.
2. Send any message in the group that mentions the bot (e.g. `/start@your_bot_name`).
3. Visit `https://api.telegram.org/bot<TOKEN>/getUpdates` — find the message and copy the `chat.id`. For groups it's negative (e.g. `-1001234567890`).

### c) Easier: use @RawDataBot

1. Add **@RawDataBot** (and your own bot) to the group temporarily.
2. The bot dumps the group's chat ID immediately. Copy it. Remove @RawDataBot when done.

> **Channels:** Add the bot as an *administrator* (not just member), then use the same `getUpdates` trick to read the channel ID. It will start with `-100`.

## 4. Per-agent setup

Open any agent → **Integrations** in the sidebar. Click **Send to Telegram** to add a rule:

- **Rule name:** memorable, e.g. *"Sales team — group chat"*
- **Telegram chat ID:** paste the ID from step 3
- **Message body:** customise with the live preview. The default uses Telegram-flavoured MarkdownV2 — `*bold*`, `_italic_`, `` `code` ``, `[link](url)`. Special characters like `.` and `-` need backslash escapes (e.g. `\.`).
- **When to fire:** all calls, or only when specific actions present

Hit **Send a test message** (the play icon). The bot should DM/post immediately.

## Troubleshooting

| Error | Likely cause |
|---|---|
| `chat not found` (failed dispatch) | Wrong chat ID, OR the bot isn't a member of the group, OR the user never started a DM with the bot. |
| `bot was blocked by the user` | The user blocked your bot. Have them unblock and re-start the chat. |
| Telegram returns 401 on connect | Bot token is malformed, expired, or revoked. Re-issue with `/revoke` in @BotFather, paste the new one. |
| Markdown looks weird (literal `\.` showing) | You wrote unescaped Markdown special chars in the template. Either escape them (`\.`, `\-`) or remove formatting. |

## Tips

- **One bot, many chats.** You only need one bot for your whole workspace; per-agent rules just point to different chat IDs.
- **Test in a private group first** before pointing at a busy channel.
- **For threads:** Telegram doesn't support threads at the API level the same way Slack does. The bot just posts top-level messages.
