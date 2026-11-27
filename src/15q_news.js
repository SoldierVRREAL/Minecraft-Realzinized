// ================= Version number and the update log ("What's New" on the title screen) =================
const GAME_VER='3.1';
const NEWS=[
 ['3.1','November 27, 2026',[
   'Every texture now looks like Minecraft. The 40 new items that had flat little drawings (foods, gadgets, the honeycomb, goat horn, nautilus shell, scutes, berries, chorus fruit and more) have new pixel art made the way the game\'s own items are: a dark outline, light from the top left and several shades for each material.',
   'The candy apple, pocket watch, depth meter, feather charm, smoke bomb and winged boots are now made from the resource pack\'s own apple, clock, compass, feather, firework star and golden boots.',
   'New pictures for the shield and all 16 banners.',
   'Pink petals and crystal clusters have new block textures.',
   'The furnace flame and the progress arrows in the furnace and crafting table now use the resource pack\'s own furnace screen.']],
 ['3.0','November 27, 2026',[
   '100 new items. From Minecraft: copper and netherite tools and armour, raw copper, nuggets, the turtle shell, honey, berries, beetroot, chorus fruit, amethyst and echo shards, the Heart of the Sea, goat horns and more.',
   'New foods: pizza, burgers, hot dogs, fries, sushi, donuts, chocolate, ice cream, pancakes, waffles, pies, juices, smoothies and more. Find them all in the Food tab of the crafting table.',
   'New gadgets: magnet, grappling hook, dynamite, smoke bomb, bandages and med kits, a pocket watch, a depth meter, a feather charm, a recall scroll, night vision goggles, a scuba mask and winged boots. Emerald tools too.',
   'Servers now check that everyone has the same version. Two versions build the world differently, so players on different versions saw different biomes. If yours is out of date you are told to reload, and a page left open a long time tells you when a new version is out.',
   'Signing in keeps your old name, so your progress on servers stays yours. Any name that worked before can sign in, and you are warned if you sign in under a different name.']],
 ['2.9','November 26, 2026',[
   'Accounts: sign in with a name and a password (Options > Profile > Sign In). Use the same name and password on any device.',
   'Servers remember your account the first time you join. After that, nobody can join that server with your name without your password, so they can\'t get your inventory, your items or your operator powers.',
   'You need to be signed in to join servers. Operators can type /account list to see the registered names, and /account reset <name> to free a name whose owner forgot the password.']],
 ['2.8.1','November 25, 2026',[
   'Servers no longer close after a while. A world\'s join data grows as it gets played, and once it passed Photon\'s limit (about 500 KB in a short time) Photon disconnected the host. Big messages are now compressed and sent in small parts.',
   'If the connection drops for a moment (Wi-Fi blip, phone screen off), the game reconnects to the same server instead of closing it. Players get up to 20 seconds to come back before they count as gone.',
   'A host whose tab is in the background keeps the server running: heartbeats keep going and the world keeps ticking.']],
 ['2.8','November 25, 2026',[
   'Point at any item in a menu (inventory, crafting, chests, furnaces, creative) to see its name. On phones and tablets, tap the item.',
   'Forests, birch forests and dark forests are now mystical: deeper green grass and leaves, green mist, drifting motes and weeping willows with long curtains of leaves and vines. The grass there has a new texture made from your pack\'s own grass, so it still looks like Minecraft.',
   'Hearts are blue.',
   'Every ruin has a chest buried under the chiseled stone in the middle of its floor. Most hold plain supplies, but 1 in 5 is a treasure chest with an Enchanted Golden Apple, diamonds and enchanted diamond gear.',
   'New: the Enchanted Golden Apple. It gives Regeneration II, Absorption IV, Resistance and Fire Resistance.',
   'Skinwalkers: go two days without sleeping and they come at night. One copies a player\'s skin and name and watches from a distance. When you look at it, it twists into its true shape and hunts you, with a boss bar. Daylight drives it away, and sleeping in a bed keeps them away.']],
 ['2.7','November 25, 2026',[
   'Redstone works: levers, buttons, pressure plates, redstone torches, daylight sensors and blocks of redstone give power. Dust carries it up to 15 blocks and gets dimmer as it goes. Repeaters delay and lock, comparators compare and subtract and read how full a chest is. Lamps light up, iron doors and trapdoors open only with power, TNT goes off and note blocks play.',
   'Pistons and sticky pistons push up to 12 blocks and move you too. Sticky pistons pull back the block in front, and slime blocks drag their neighbours along.',
   'Hoppers move items between chests, furnaces and other hoppers, and pick up items dropped on top. Dispensers fire arrows, potions, fire charges and fireworks, pour buckets, place TNT, boats and minecarts, and use bone meal. Droppers pass items on. Command blocks run chat commands when powered.',
   'Rails join up, curve and climb slopes. Ride minecarts (W to push, Sneak to get off). Golden rails boost or brake, detector rails give power when a cart passes and activator rails empty carts. Chest, hopper, furnace and TNT minecarts work too.',
   'Boats float. Steer them with the look direction and W. Crashing hard into land breaks them.',
   'Horses, donkeys and mules live on plains and savannas. Climb on to tame them, then add a saddle to ride: hold Jump to charge a leap. Horse armour protects them and donkeys and mules carry a chest. Saddled pigs can be ridden and steered with a carrot on a stick.',
   'Leads take animals with you or tie them to a fence. Name a name tag on an anvil and give a creature a name. Armour stands hold any armour you put on them.',
   'Banners in 16 colours stand or hang on walls. Add patterns with dyes in a 3x3 crafting grid; a cauldron washes off the last one. Paintings take the biggest picture that fits the wall.']],
 ['2.6','November 25, 2026',[
   'Turning blocks: logs, hay, bone blocks and quartz pillars lie along the side you click. Furnaces, pumpkins, dispensers and droppers face you. Stairs and slabs go upside down or to the top half when you click high on a side or under a block. Ladders and item frames hang on the wall you click. Rails, anvils and signs follow the way you look.',
   'Slabs stack: put a slab on a slab of the same kind to make a double slab.',
   'Farming: till grass or dirt with a hoe, then plant seeds, carrots, potatoes, and melon or pumpkin seeds. Crops grow over time (faster near water) and bone meal speeds them up. Stems grow melons and pumpkins. Nether wart grows on soul sand.',
   'Saplings drop from leaves and grow into trees: oak, spruce, birch, jungle, acacia and dark oak. Grass sometimes drops seeds. Cows and sheep follow you if you hold wheat, pigs follow carrots, chickens follow seeds.',
   'Doors (seven woods and iron) and trapdoors open and close. Cakes can be eaten a slice at a time. Levers click.',
   'Enchantment Table: hold a tool, weapon, bow or armour and right-click it. This costs experience levels and Lapis Lazuli.',
   'Anvil: repair tools with their material, or apply an Enchanted Book. Brewing Stand: turn Water Bottles into potions with an ingredient. Gunpowder makes splash potions. Cauldrons hold water.',
   'Fishing rods: cast into water and reel in when the float dips. You can catch fish, junk or treasure. You can cook cod and salmon.',
   'Spawn eggs for every creature. Bottles o\' Enchanting, fire charges and fireworks (they also boost you while gliding). Maps show the land around you. Music discs play in jukeboxes (each one is an original tune made for this game).',
   'New blocks: stained glass and glass panes (panes join up), stained terracotta in 16 colours, red sandstone, jungle planks, emerald, lapis and redstone ores, sponges, mushroom blocks, pistons, dispensers, droppers, command blocks, hoppers, daylight sensors, flower pots, rails, redstone torches, dust, repeaters and comparators, and more stairs and slabs.',
   'New items: hoes, seeds, wheat, sugar, paper, books, bowls and mushroom stew, bricks, clay, charcoal, emeralds, nether bricks, slimeballs, glass bottles, glistering melons, fermented spider eyes and more. Minecarts, boats, saddles, horse armour, leads and name tags are collectibles for now.',
   'Grass, poppies, dandelions, slime blocks, soul sand, cobwebs, ladders, stone slabs, cobblestone stairs, beacons and barriers now have items too.',
   'The resource pack loads several times faster.']],
 ['2.5','November 24, 2026',[
   'Beds: you now wake up next to your bed after dying (the Respawn button skipped it before). Placing a bed or using it sets your respawn point. If the bed is broken you go back to the world spawn.',
   'Mobile: the touch controls were covering the death screen, so tapping Respawn often did nothing. Any menu on top now hides the controls (death screen, crafting, world list, servers...).',
   'Mobile: the joystick stays in one place; only the knob moves.',
   'Mobile: new D-pad option (Options > Controls > Touch Movement). Slide between arrows, diagonals appear while walking forward, double-tap forward to sprint, the middle is sneak.',
   'Fire spreads like the real game: through wood, leaves, wool, grass and flowers (faster upward), burns blocks away, and lava can start it. Rain puts it out.',
   'Fire looks real: animated flames on every side, embers and smoke. The Nether portal swirl is animated too.',
   'This update log, and the version number on the title screen.']],
 ['2.4','November 24, 2026',[
   'Grass, sand and snow now mix together in patches where two biomes meet.',
   'You can break tall grass, flowers, ferns, mushrooms, sugar cane and fire. Placing a block on grass replaces it.',
   'Fixed: creatures could not hit you (endermen, zombies, spiders and others). They fight properly again.',
   'Hunger drains a little over twice as slowly in survival.']],
 ['2.3','November 24, 2026',[
   'New mobile controls in the pocket-edition style: square stick, pixel-art jump, sneak, use, sprint and attack buttons, plus drop, inventory, pause and chat.',
   'Touch settings: look speed, button size, button opacity and vibration.']],
 ['2.2','November 24, 2026',['Hearts are violet.']],
 ['2.1','November 23, 2026',[
   'The game can be beaten: Nether portals, the Nether with fortresses and blazes, endermen and ender pearls, eyes of ender, strongholds, the End, the Ender Dragon and the ending.',
   'New terrain for new worlds: mountain ranges with snow caps, rivers, oceans, and new biomes (birch forest, taiga, savanna, desert, dark forest, windswept hills).',
   'Flowing water and lava, obsidian, buckets, fire, beds, experience, rain, snow and thunderstorms, new ambient sounds.']],
 ['2.0','November 2026',['Java 1.9+ combat in the Battle mini games: attack cooldown, sweeping swords, critical hits, shields and the off hand.']],
 ['1.x','Earlier',['Infinite survival worlds with custom biomes, creatures and crafting; Battle, Battle Royale, Tumble and Glide mini games; online play.']]];
function renderNews(){const el=$('newsBody');el.textContent='';for(const [v,date,items] of NEWS){const h=document.createElement('h3');h.textContent='Version '+v+' ';const sm=document.createElement('small');sm.textContent=date;h.appendChild(sm);
    const ul=document.createElement('ul');for(const t of items){const li=document.createElement('li');li.textContent=t;ul.appendChild(li);}el.append(h,ul);}
  setPrompts('newsPrompts',[['B','Back',closeNews]]);}
function openNews(){sfx('click');hide('menu');show('newsPanel');renderNews();$('newsBody').scrollTop=0;try{localStorage.setItem('mcr_seenVer',GAME_VER);}catch(e){}}
function closeNews(){sfx('click');hide('newsPanel');show('menu');}
$('newsBtn').addEventListener('click',openNews);
addEventListener('keydown',e=>{if(!$('newsPanel').classList.contains('hidden')&&(e.code==='Escape'||e.code==='Backspace'||e.code==='Enter')){e.preventDefault();closeNews();}});
// the version on the title screen
{const v=$('verL');v.dataset.t='Minecraft:realzanized v'+GAME_VER;v.textContent=v.dataset.t;if(typeof refreshLCE==='function')setTimeout(refreshLCE,0);}
// show the log once after an update
setTimeout(()=>{let seen=null;try{seen=localStorage.getItem('mcr_seenVer');}catch(e){}if(seen!==GAME_VER&&!$('menu').classList.contains('hidden')&&MATCH.state!=='play')openNews();},1500);
