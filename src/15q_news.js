// ================= Version number and the update log ("What's New" on the title screen) =================
const GAME_VER='2.6';
const NEWS=[
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
