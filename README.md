# Garden of Grind AE2 OC Visualiser

Tracks the status of your AE2 system in real time.
- CPU crafting status
- Item/fluid history

[Credit to Niels for some of the AE2 related OC code](https://github.com/Niels1006/OC-AE2-integration)

[Credit to DylanTaylor1 for the setup script](https://github.com/DylanTaylor1/GTNH-Stocking)


## Readme Disclaimer

I haven't tested setting this up a second time, you will probably encounter issues following the setup, sorry

## OC Requirements:

- Tier 3 Computer Case
- Tier 3 Hard Disk Drive
- Tier 2 CPU (MINIMUM)
- Tier 2 Memory (Recommended 2x Tier 3.5 Memory)
- Tier 1 Graphics Card
- Tier 1 Screen (MINIMUM)
- Inventory Controller Upgrade
- Keyboard
- Internet Card
- TPS Card
- EEPROM (Lua BIOS)
- OpenOS Floppy Disk
- 2 Adapter (maybe 1 is enough)
- Chest (Compressed chest is best)

## AE Requirements:

All crafting CPUs must have a Crafting Monitor, or their craft information cannot be read.

## Dev Setup

### Supabase:
1. [Create a new project on Supabase](https://database.new)
2. Copy the contents of `postgres.sql` into the SQL editor
3. Note the env variables: url, public key, service worker key
4. Go to `Database > Extensions` and enable `pg_cron` for scheduling cleaning tasks
5. Go to Database SQL Editor and copy/execute the contents of `supabase/setup_clean_job.sql` into the editor. This will create cron jobs to clean out data according to a data retention policy (storing data older than one hour at less-frequent intervals).
6. Go to Project Settings > API and increase "Max Rows". Using the default data retention policy in `setup_clean_job.sql`, the default max of 1000 rows will only fetch about 14 hours of data. 5000 rows will fetch about one week of data. You can increase Max Rows or increase the data retention intervals, to increase how far back you can see.


### Web:
1. `npm install` or `yarn install` or `pnpm install` or `bun install`
2. `npm run dev` or `yarn dev` or `pnpm dev` or `bun dev`
3. Copy .env.example to .env.local and fill in the details
    - `NEXT_PUBLIC_SUPABASE_URL` is the url from the Supabase project
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the public key from the Supabase project
    - `SUPABASE_SERVICE_ROLE_KEY` is the service worker key from the Supabase project
    - `SECRET` is a secret that should be set on the server and the OC script (see below) to prevent unauthorized access
4. (optional) if OC is on a minecraft server (not your PC) then install `ngrok` and run `ngrok http 3000` to get a public url for testing

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### OC:

1. Build the computer with specs above
2. Run `wget https://raw.githubusercontent.com/nzbasic/GTNH-AE2-OC-GOG/main/oc/main/setup.lua && setup`
3. Copy `env.example.lua` to `env.lua` and fill in the details
    - `serverUrl` is the url of
    - `secret` is the secret from the web server
4. Place an adapter next to an ME Dual Interface on your AE2 network
5. Place a chest ontop of an `Adapter` block with an Inventory Controller Upgrade in it
    - Any item you put in here (fluid drops for fluids) will be tracked
6. Run `Run.lua` to start the program

## Deploying

### Web:

1. Go to [vercel.com](https://vercel.com)
2. Setup a new project with this repo (or your cloned one)
