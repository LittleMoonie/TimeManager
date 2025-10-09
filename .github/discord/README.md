# Discord Notification Pipelines

This folder documents the Discord notification workflows defined in `.github/workflows`.

## Webhook Secrets

Create the following repository secrets with the target webhook URLs for each Discord channel:

- `DISCORD_WEBHOOK_PUSH_URL` – receives notifications for `push` events.
- `DISCORD_WEBHOOK_PR_URL` – receives notifications for pull request activity (including reviews, comments, and thread resolutions).
- `DISCORD_WEBHOOK_MERGE_URL` – receives notifications when pull requests are merged.
- `DISCORD_WEBHOOK_BRANCHES_URL` – receives notifications for branch create/delete events.
- `DISCORD_WEBHOOK_ISSUES_URL` – receives notifications for issue activity and comments.

All workflows share consistent branding and timestamps for easier scanning inside Discord.
