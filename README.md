# Minecraft:realzanized

![Minecraft:realzanized](logo.png)

Minecraft:realzanized is a fan-made Minecraft you play in the browser: an endless survival world with six new biomes, new ores, a day and night cycle, shaders from a "Potato" mode for old computers up to **PEAK** shaders for fast ones, and multiplayer where everyone who types the same **Photon Realtime App ID** plays together. The Battle mini game (and Battle Royale) from the original project are still here under **Mini Games**. Single HTML file, WebGL, no install.

> Not affiliated with Mojang or Microsoft. All code and built-in art are original; Minecraft textures and sounds are only used if you load your own resource pack.

## What's in this version (stage 1: world + shaders)

**Play Game (Survival, endless world)**
- Worlds are generated as you walk, in 16x16 chunks, forever in every direction. Your changes are kept even when a chunk unloads, and each world is saved in the browser (every 30 seconds and when you leave). Pick a world from the list, or create one with a name and an optional seed.
- **Six new biomes**, plus ordinary Plains, Forest and Ocean between them:
  - **Sakura Forest**: pink sakura trees that glow softly, petals on the ground and falling through the air, sakura wood.
  - **Crystal Forest**: giant blue crystal spires, crystal clusters, cyan grass, and crystal caves underground lined with glowing crystals and crystal ore.
  - **Ancient Redwood**: massive 2x2 and 3x3 trees 25-40 blocks tall, thick fog, podzol and ferns, and old stone-brick ruins.
  - **Ashen Wasteland**: ash plains, volcanic mountains with lava craters, basalt and magma, burnt trees, and ash storms.
  - **Glowing Mushroom Fields**: giant glowing mushrooms, glowing plants and shrooms, glowing moss, floating spores.
  - **Frozen Forest**: frosted trees, snow, frozen lakes, ice spikes, and ice caves.
- **Caves** (long tunnels and big caverns, lava lakes near the bottom) and **ores**: coal, iron, gold, diamond and the new **Ruby** (more under Ashen Wasteland), **Sapphire** (Frozen Forest), **Cobalt**, **Mythril** (Crystal Forest, needs a diamond pickaxe) and **Amethyst Steel** (Mushroom Fields, needs a diamond pickaxe). Ores drop gems and raw metal. The ores' special abilities come with tools and crafting in the next stage.
- **Mining and building**: hold left click to mine (pickaxes for stone and ores, axes for wood; ores need a good enough pickaxe to drop anything), right click to place blocks. You start with stone tools, bread, torches and planks.
- **Day and night**: a 20-minute day with sunrise and sunset colours, a moon and stars. Torches, lava, crystals and glowing mushrooms light up the dark.
- Hunger, health, fall damage, drowning and lava as before. When you die you drop your items and can respawn at the world spawn.
- F3 shows coordinates, biome, light, time and chunk info.

**Graphics: Potato to PEAK** (Options > Video Settings > Graphics, or when creating a world)

| Preset | For | What you get |
| --- | --- | --- |
| Potato | old or slow computers, Chromebooks | half resolution, 3 chunks, flat lighting, fast leaves, no particles, 30 fps cap |
| Low | laptops | 75% resolution, 5 chunks, smooth lighting |
| High | most computers | full resolution, 8 chunks, waving leaves and plants, water waves with reflections and sun glints, sky with clouds, sunsets, stars |
| PEAK | fast computers | everything in High plus 12 chunks, real-time sun and moon shadows, bloom on glowing blocks, colour grading and vignette |

Render Distance can be changed separately (2-13 chunks). If the game runs slowly it suggests a lighter preset in chat. Biomes tint the fog and sky, and each has its own floating particles (petals, ash, snow, spores, sparkles).

**Multiplayer (Photon Realtime, App ID only)**
1. Make a free account at [dashboard.photonengine.com](https://dashboard.photonengine.com), create a new application of type **Realtime**, and copy its **App ID**.
2. In the game: **Multiplayer**, paste the App ID, choose Survival or Battle, and press **Connect**.
3. Give the same App ID to your friends. Everyone who connects with it (same game and region) joins the same world: Connect joins an open game, or starts one if nobody is playing. There are no server names or room codes.

The first player in is the host: their world (saved on their computer as "Online World") is the one everyone plays in, and joiners download it when they connect. If the host leaves, the next player carries on as host. Block changes, players, dropped items and the time of day are shared. A game holds up to 16 players (Photon's free plan allows 20 players online at once per App ID). Multiplayer through Photon also works when the game is hosted on GitHub Pages: no server of your own is needed.

**Mini Games**: Battle, Battle Royale, Play Online (the original relay server) and Practice, unchanged.

### Controls

| Key | Action |
| --- | --- |
| WASD | Move |
| Space | Jump / swim up / climb |
| Shift | Sneak |
| Ctrl or double-tap W | Sprint |
| Left click | Attack; hold to mine (Survival and Battle Royale) |
| Right click | Place block, eat/drink/draw bow (hold), open chest, throw splash potion, block with sword, equip armour |
| 1-9 / wheel | Hotbar |
| E | Inventory (Survival: click a backpack slot to swap it into your selected hotbar slot) |
| Q | Drop item |
| F3 | Debug screen |
| Esc | Pause (Leave Game saves your world) |

## The Battle mini game


Open `index.html` in a browser, or host it with GitHub Pages (below).

- **Play Game**: Battle vs bots on Temple, Cavern, Cove, Crucible or Skyhold
- **Temple** (new): a ruined stone-brick temple deep in a jungle cave, after the Battle key art: centre chests inside the temple and in the shrine on top (ladder inside), a lily-pad moat you can cross by bridge, stepping stones or the lily pads themselves, a jungle floor with ruins and trees, and a gallery round the cave wall
- **Bots that play like players**: they keep a sensible inventory, loot, then go hunting (with route-finding over stairs, ladders and drops), shoot with bows at people they can't reach, and give up on anything they can't get to instead of standing still
- **Play Online** (in Mini Games): online rooms through the game's own server or relay (or "same browser, other tabs" for testing)
- **Enchanted items**: Sharpness, Knockback and Fire Aspect swords and axes; Power, Punch, Flame and Infinity bows; Protection armour. They show a purple glint, list their enchantments in the inventory tooltip, and turn up in chests (more often in the centre ones). Turn them off with **Enchanted Loot** in Game Rules.
- **Console look and feel** (matched to Xbox One Edition Battle footage): raised console HUD with the 8-slot player colour strip, a small animated model of you on the left, kill messages in the chat area, contextual button prompts, "Invulnerability wears off / has worn off! Fight!" messages, rounds that start behind a "Downloading terrain" loading screen with tips, block info panels when you look at a block, and an end-of-round scoreboard with kills, awards, favourite weapon, damage inflicted/received and round time. In-Game Tooltips and Animated Character can be turned off in Video Settings.
- **Practice**: lobby town with a movement playground (ice, slime, soul sand, cobwebs, ladders, slabs, stairs, water)
- **Help & Options**: name, skin, round length, hunger rate, item respawn, grace period, Showdown, Take Everything, central spawn, bots, maps, Battle Royale settings


## Host on GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repo: **Settings > Pages > Build and deployment**, set **Source** to *Deploy from a branch*, branch `main`, folder `/ (root)`.
3. After a minute the game is live at `https://<your-username>.github.io/<repo-name>/`.

### Online multiplayer for the Battle mini game (relay server)

The game has its own multiplayer system: a small room relay that every player in a room talks to. The first player in a room is the host and runs the bots, chests and round timer; if they leave, the next player takes over.

**Option A: run the game's own server (best).** `server/server.js` is one Node.js file with no packages to install. It serves the game *and* the multiplayer relay on the same address:

```
node server/server.js          # or: npm start   (needs Node.js 18+)
```

Open `http://localhost:8080` (or your PC's address, e.g. `http://192.168.1.20:8080`, for friends on the same Wi-Fi). Players who open the game from that address connect to it automatically. Free hosts that run Node apps (Render, Railway, Fly.io, Glitch, a Replit, your own PC with port forwarding) work too: point them at this repo with the start command `npm start`. Check `/health` on the server to see rooms and players.

**Finding games:** Play Online shows a list of open games on the same server (room, host, mode, map, lobby or in game, player count); click one to join. Untick "List my room here when I host" to keep a room private. On the game server, `/rooms` shows the same list as JSON.

**How multiplayer behaves:** if you're not the host, taking from chests, picking items up and dropping them happen instantly on your screen; the host checks each move and takes an item back only if someone else got it first. The host leaving doesn't end the round: the next player takes over, bots included. A dropped connection reconnects by itself (you have a few seconds before you count as gone), and after a round everyone goes back to the lobby.

**Option B: GitHub Pages with no server.** Mini Games → Play Online → Connect also works on GitHub Pages: if there's no game server, it falls back to free public relays (EMQX, HiveMQ, Mosquitto test broker). Anyone who knows the room code can join those, so pick an unusual code.

To use a game server from the GitHub Pages copy, type its address in **Game server (optional)** on the Play Online screen, or open the page with `?relay=wss://your-server/mqtt`.

### Resource packs

Players can load any Java Edition resource pack (`.zip`) or a client `.jar` they own from **Resource Packs**. Packs are kept in that browser only. Both 1.8 and modern file names are supported, including `sounds.json` sound events.

**Java keys:** F5 cycles first person / third person behind / in front, F1 hides the GUI, F3 shows the debug screen, T (or /) opens chat in multiplayer.

**Mouse:** some Mac browsers report mouse movement too big while a button is held, which made the camera turn faster whenever you clicked. Mac Click Fix (Controls, Auto = on for Macs) undoes it: it learns how much the browser inflates movement from how fast you move just before and after each click, and divides it back out. Controls > Raw Mouse Input picks between raw input (no OS acceleration) and normal input; Auto uses normal input on Macs.

**Connection:** the Tab lobby panel and the F3 screen show your ping to the game server and which server you are on, and you get a warning in chat if it stays above 250 ms. The game server itself relays 16 players at 20 updates a second in under 5 ms, so lag comes from distance: host it in a region close to your players, and avoid the free public relays.

**Options & mobile:** Help & Options opens Java-style Options screens (Video Settings, Music & Sounds, Controls, Game Rules, Maps). Mobile Controls (Auto/ON/OFF) adds a touch joystick, drag-to-look, tap-to-attack, hold-to-use and buttons for jump, sneak, sprint, inventory and drop. Settings are saved in the browser.

**Default packs:** `pack.zip` (Template Resource Pack 1.8) and `sounds.zip` (Enhanced Audio r7) sit beside `index.html` and load automatically when the page is hosted (GitHub Pages, or any local web server). Browsers block this when you double-click `index.html` from disk, so either host it or load the packs once from the Texture Packs menu.

**Dressing Room:** the player preview beside the title menu opens the Dressing Room, where you can set your name and import your own skin (64x64 or legacy 64x32 PNG). Imported skins are saved in your browser and sent to other players in online games.

**Title logo:** `logo.png` beside `index.html` is the Minecraft:realzanized title logo (loaded automatically when hosted; if the page is opened straight from disk a drawn version is used instead). Mini Games shows `logo_battle.png`. Replace `logo.png`, or pick an image under Texture Packs → Title logo image, to use your own.

## Editing the code

The game lives in `src/` (numbered JavaScript files plus `shell.html`); `vendor/photon-realtime.js` is the Photon Realtime JavaScript SDK (browser build). After editing, rebuild the single file:

```
python3 build.py
```

| File | What it does |
| --- | --- |
| `01_core.js` | Math, noise, zip reader |
| `02_blocks.js` | Blocks, shapes, procedural textures |
| `02b_biomeblocks.js` | New biome blocks and ores, and their textures |
| `03_items.js` | Items, 1.8 stats, loot tables, icons |
| `03b_survitems.js` | Gems and raw metals, mining speeds, what each block drops |
| `04_world.js` | Battle maps, lobby town, Battle Royale, lighting |
| `04b_maps.js` | Cove, Crucible and Temple |
| `04c_inf.js` | Endless world: chunk ring buffer, biomes, terrain, caves, ores, trees and structures, chunk lighting, streaming |
| `05_gl.js` | WebGL, compact chunk meshes, models, item meshes |
| `06_pack.js` | Resource pack loader |
| `07_game.js` | Entities, combat, hunger, effects, projectiles, drops |
| `07b_mcphys.js` | Java Edition movement physics (20 TPS) |
| `08_net.js` | Multiplayer core (host rules), room relay client and same-browser tabs |
| `08b_photon.js` | Photon Realtime transport (App ID matchmaking) |
| `09_flow.js` | Match flow, lobby, chests, MCBR timeline, net events |
| `10_bots.js` | Bot AI, including route-finding |
| `11_render.js` | Audio and rendering |
| `11b_gfx.js` | Graphics presets, world/sky/water shaders, shadows, bloom, day/night, ambient particles |
| `12_hud.js` | HUD |
| `13_ui.js` | Menus, input, local player |
| `14_main.js` | Main loop |
| `15_survival.js` | Survival: worlds and saving, loading, death and respawn, Photon menu |

## Coming next

Crafting and tools (with the new ores' special abilities), mobs (deer, crystal spiders, ice wolves, magma creatures, mushroom mobs), structures (Lost Civilization, Sky Castle, Overgrown Temple, Forgotten Village, mushroom villages), the bosses (Ancient Golem, Frost Dragon, Magma Titan) and the End overhaul with the Void King.

## Credits

- Battle Royale rules and the Easter-head structure follow the MinecraftBattleRoyale datapack by Zakru.
- Inspired by Minecraft: Legacy Console Edition Battle by 4J Studios / Mojang.
