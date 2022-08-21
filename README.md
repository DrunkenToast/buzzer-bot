# Discord buzzer bot

Please don't use, this is horribly deprecated.
This project was made with scraps and bits from other projects to quickly get
something together for friends.

Features:
- Buzzer
- Roll dice
- Coinflip

## Requirements
- [node](https://nodejs.org/en/)
- [yarn](https://yarnpkg.com/getting-started/install)

## Running

Create `.env` file in root with content:

```
DISCORD_TOKEN="<Discord bot token>"
```

```sh
docker compose --env-file .env up -d
```

## Dev

```sh
yarn serve
```
