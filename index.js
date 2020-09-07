const DispatchWrapper = require("./dispatch");
const dbg = require("./dbg");
let voice = null;
try {
	voice = require("./voice");
} catch (e){
	voice = null;
}
// Tank class ids(brawler + lancer)
const TANK_CLASS_IDS = [1, 10];
// Dps class ids(not counting warrior)
const DPS_CLASS_IDS = [2, 3, 4, 5, 8, 9, 11, 12];
// Healer class ids
const HEALER_CLASS_IDS = [6, 7];
// Warrior Defence stance abnormality ids
const WARRIOR_TANK_IDS = [100200, 100201];
// Zones is available in game for GUI or menus
const AVAILABLE_ZONE_IDS = [
	3020, // Sea of Honor
	3023, // Akalath Quarantine
	3026, // Corrupted Skynest
	3027, // Forbidden Arena [Hagufna]
	3034, // RK-9 Kennel (Hard)
	3102, // Draakon Arena
	3103, // Forbidden Arena [Undying Warlord]
	3126, // Corrupted Skynest (Hard)
	3201, // Gossamer Vault (Hard)
	3202, // Draakon Arena (Hard)
	3203, // Forbidden Arena [Nightmare Undying Warlord]
	9044, // Bahaar's Sanctum
	9735, // RK-9 Kennel
	9739, // Red Refuge
	9781, // Velik's Sanctuary
	9920, // Antaroth's Abyss (Hard)
	9982 // Grotto of Lost Souls (Hard)
];
// Zones with skillid range 1000-3000
const SP_ZONE_IDS = [
	3026, // Corrupted Skynest
	3126, // Corrupted Skynest (Hard)
	9050, // Rift's Edge (Hard)
	9054, // Bathysmal Rise (Hard)
	9044, // Bahaar's Sanctum
	9066, // Demon's Wheel
	9070, // Manglemire
	9750, // Rift's Edge
	9754, // Bathysmal Rise
	9781, // Velik's Sanctuary
	9916, // Sky Cruiser Endeavor (Hard)
	9920, // Antaroth's Abyss (Hard)
	9970, // Ruinous Manor (Hard)
	9981 // Velik's Sanctuary (Hard)
];
// Zones with skillid range 100-200-3000
const ES_ZONE_IDS = [
	3023, // Akalath Quarantine
	9000, // ???
	9759 // Forsaken Island (Hard)
];
// Supported languages by client
const languages = { 0: "en", 1: "kr", 3: "jp", 4: "de", 5: "fr", 7: "tw", 8: "ru" };
// Messages colors
const cr = '</font><font color="#ff0000">'; // red
const co = '</font><font color="#ff7700">'; // orange
const cy = '</font><font color="#ffff00">'; // yellow
const cg = '</font><font color="#00ff00">'; // green
const cdb = '</font><font color="#2727ff">'; // dark blue
const cb = '</font><font color="#0077ff">'; // blue
const cv = '</font><font color="#7700ff">'; // violet
const cp = '</font><font color="#ff00ff">'; // pink
const clp = '</font><font color="#ff77ff">'; // light pink
const clb = '</font><font color="#00ffff">'; // light blue
const cbl = '</font><font color="#000000">'; // black
const cgr = '</font><font color="#777777">'; // gray
const cw = '</font><font color="#ffffff">'; // white
// GUI colors
const gcr = '#fe6f5e'; // red
const gcg = '#4de19c'; // green
const gcy = '#c0b94d'; // yellow
const gcgr = '#778899'; // gray
// Dungeon messages types
const spt = 31; // text notice
const spg = 42; // green message
const spb = 43; // blue message
const spr = 44; // red message
const spi = 66; // blue info message
const spn = 49; // left side notice
// TTS rates
const rate1 = 1;
const rate2 = 2;
const rate3 = 3;
const rate4 = 4;
const rate5 = 5;
const rate6 = 6;
const rate7 = 7;
const rate8 = 8;
const rate9 = 9;
const rate10 = 10;

class TeraGuide {
	constructor(dispatch){
		const fake_dispatch = new DispatchWrapper(dispatch);
		const { player, entity, library, effect } = dispatch.require.library;
		const command = dispatch.command;
		// An object of types and their corresponding function handlers
		const function_event_handlers = {
			"spawn": spawn_handler,
			"despawn": despawn_handler,
			"text": text_handler,
			"stop_timer": stop_timer_handler,
			"func": func_handler,
			"lib": require("./lib")
		};
		// GUI helpers
		const gui = {
			lang: {
				"en": {
					"settings": "Settings",
					"spawnObject": "Spawn Objects",
					"speaks": "Voice Messages",
					"lNotice": "Chat Messages",
					"stream": "Streamer Mode",
					"rate": "Speech rate",
					"dungeons": "Dungeon settings",
					"verbose": "Messages",
					"objects": "Objects"
				},
				"ru": {
					"settings": "Настройки",
					"spawnObject": "Спавн объектов",
					"speaks": "Голосовые сообщения",
					"lNotice": "Сообщения в чат",
					"stream": "Режим стримера",
					"rate": "Скорость речи",
					"dungeons": "Настройки данжей",
					"verbose": "Сообщения",
					"objects": "Объекты"
				}
			},
			parse(data_array, title){
				let body = '';
				for(const data of data_array){
					if(body.length >= 16000){
						body += 'GUI data limit exceeded, some values may be missing.';
						break;
					}
					if(data.command) body += `<a href="admincommand:/@${data.command}">${data.text}</a>`;
					else if(!data.command) body += `${data.text}`;
					else continue;
				}
				dispatch.toClient('S_ANNOUNCE_UPDATE_NOTIFICATION', 1, {
					id: 0,
					title,
					body
				});
			}
		};
		// export functionality for 3rd party modules
		this.handlers = function_event_handlers;
		// Detected language
		let language = languages[0];
		// A boolean for the debugging settings
		const debug = dbg["debug"];
		// A boolean indicating if a guide was found
		let guide_found = false;
		let spguide = false;
		let esguide = false;
		// let cc = cg;
		// The guide settings for the current zone
		let active_guide = {};
		// Hp values of mobs in the current zone
		let mobs_hp = {};
		// All of the timers, where the key is the id
		let random_timer_id = 0xFFFFFFFA; // Used if no id is specified
		let timers = {};
		// Entered zone guide data
		let entered_zone_data = {};
		// Trigger event flag
		let is_event = false;

		/** C_LOGIN_ARBITER **/

		dispatch.hook("C_LOGIN_ARBITER", 2, event => {
			// Set client language
			language = languages[event.language] || languages[0];
		});

		/** HELPER FUNCTIONS **/

		// GUI handler
		function gui_handler(page, title){
			const tmp_data = [];
			const lang = gui.lang[language] || gui.lang["en"];
			switch(page){
				default:
					tmp_data.push(
						{ text: `<font color="${gcy}" size="+20">${lang.settings}:</font>` }, { text: "&#09;&#09;&#09;" },
						{ text: `<font color="${dispatch.settings.spawnObject ? gcg : gcr}" size="+18">[${lang.spawnObject}]</font>`, command: "guide spawnObject;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.speaks ? gcg : gcr}" size="+18">[${lang.speaks}]</font>`, command: "guide voice;guide gui" },
						{ text: "<br>&#09;&#09;&#09;&#09;&#09;" },
						{ text: `<font color="${dispatch.settings.lNotice ? gcg : gcr}" size="+18">[${lang.lNotice}]</font>`, command: "guide lNotice;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.stream ? gcg : gcr}" size="+18">[${lang.stream}]</font>`, command: "guide stream;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<br><br>` },
						{ text: `<font color="${gcy}" size="+20">${lang.rate}:</font>` }, { text: "&#09;&#09;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 1 ? gcg : gcr}" size="+18">[1]</font>`, command: "guide 1;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 2 ? gcg : gcr}" size="+18">[2]</font>`, command: "guide 2;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 3 ? gcg : gcr}" size="+18">[3]</font>`, command: "guide 3;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 4 ? gcg : gcr}" size="+18">[4]</font>`, command: "guide 4;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 5 ? gcg : gcr}" size="+18">[5]</font>`, command: "guide 5;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 6 ? gcg : gcr}" size="+18">[6]</font>`, command: "guide 6;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 7 ? gcg : gcr}" size="+18">[7]</font>`, command: "guide 7;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 8 ? gcg : gcr}" size="+18">[8]</font>`, command: "guide 8;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 9 ? gcg : gcr}" size="+18">[9]</font>`, command: "guide 9;guide gui" }, { text: "&nbsp;&nbsp;" },
						{ text: `<font color="${dispatch.settings.rate[0] == 10 ? gcg : gcr}" size="+18">[10]</font>`, command: "guide 10;guide gui" },
						{ text: `<br><br>` },
						{ text: `<font color="${gcy}" size="+20">${lang.dungeons}:</font><br>` }
					);
					for(const dungeon of dispatch.settings.dungeons){
						if(AVAILABLE_ZONE_IDS.includes(dungeon.id)){
							tmp_data.push({ text: `<font color="${dungeon.spawnObject ? gcg : gcr}" size="+18">[${lang.objects}]</font>`, command: "guide spawnObject " + dungeon.id + ";guide gui" }, { text: "&nbsp;&nbsp;" });
							tmp_data.push({ text: `<font color="${dungeon.verbose ? gcg : gcr}" size="+18">[${lang.verbose}]</font>`, command: "guide verbose " + dungeon.id + ";guide gui" }, { text: "&nbsp;&#8212;&nbsp;" });
							tmp_data.push({ text: `<font color="${gcgr}" size="+20">` + (dungeon['name_' + language.toUpperCase()] || dungeon.name) + "</font>" });
							tmp_data.push({ text: "<br>" });
						}
					}
					gui.parse(tmp_data, `<font color="red">${title}</font>`);
					break;
			}
		}

		// Find index for dungeons settings param
		function find_dungeon_index(id){
			for(const i in dispatch.settings.dungeons){
				if(dispatch.settings.dungeons[i].id == id){
					return i;
				}
			}
			return false;
		}

		// Write generic debug message used when creating guides
		function debug_message(d, ...args){
			if(d){
				console.log(`[${Date.now() % 100000}][Guide]`, ...args);
				if(debug.chat) command.message(args.toString());
			}
		}

		// Makes sure the event passes the class position check
		function class_position_check(class_position){
			// if it's not defined we assume that it's for everyone
			if(!class_position) return true;
			// If it's an array
			if(Array.isArray(class_position)){
				// If one of the class_positions pass, we can accept it
				for(const ent of class_position){if(class_position_check(ent)) return true;}
				// All class_positions failed, so we return false
				return false;
			}
			switch(class_position){
				case "tank":{
					// if it's a warrior with dstance abnormality
					if(player.job === 0){
						// Loop thru tank abnormalities
						for(const id of WARRIOR_TANK_IDS){
							// if we have the tank abnormality return true
							if(effect.hasAbnormality(id)) return true;
						}
					}
					// if it's a tank return true
					if(TANK_CLASS_IDS.includes(player.job)) return true;
					break;
				}
				case "dps":{
					// If it's a warrior with dstance abnormality
					if(player.job === 0){
						// Loop thru tank abnormalities
						for(const id of WARRIOR_TANK_IDS){
							// if we have the tank abnormality return false
							if(effect.hasAbnormality(id)) return false;
						}
						// warrior didn't have tank abnormality
						return true;
					}
					// if it's a dps return true
					if(DPS_CLASS_IDS.includes(player.job)) return true;
					break;
				}
				case "heal":{
					// if it's a healer return true
					if(HEALER_CLASS_IDS.includes(player.job)) return true;
					break;
				}
				case "priest":{
					if(player.job === 6) return true; // For Priest specific actions (eg Arise)
					break;
				}
				case "mystic":{
					if(player.job === 7) return true; // For Mystic specific actions
					break;
				}
				case "lancer":{
					if(player.job === 1) return true; // For Lancer specific actions (eg Blue Shield)
					break;
				}
				default:{
					debug_message(true, "Failed to find class_position value:", class_position);
				}
			}
			return false;
		}

		// Handle events such as boss skill and abnormalities triggered
		function handle_event(ent, id, called_from_identifier, prefix_identifier, d, speed = 1.0, stage = false){
			const unique_id = `${prefix_identifier}-${ent["huntingZoneId"]}-${ent["templateId"]}`;
			const key = `${unique_id}-${id}`;
			const stage_string = (stage === false ? '' : `-${stage}`);
			debug_message(d, `${called_from_identifier}: ${id} | Started by: ${unique_id} | key: ${key + stage_string}`);
			if(stage !== false){
				const entry = active_guide[key + stage_string];
				if(entry) start_events(entry, ent, speed);
			}
			const entry = active_guide[key];
			if(entry) start_events(entry, ent, speed);
		}

		// This is where all the magic happens
		function start_events(events = [], ent, speed = 1.0){
			// Loop over the events
			for(const event of events){
				const func = function_event_handlers[event["type"]];
				// The function couldn"t be found, so it"s an invalid type
				if(!func) debug_message(true, "An event has invalid type:", event["type"]);
				// If the function is found and it passes the class position check, we start the event
				else if(class_position_check(event["class_position"])) func(event, ent, speed = 1.0);
			}
		}

		/** S_ACTION_STAGE **/

		// Boss skill action
		function s_action_stage(e){
			const skillid = e.skill.id % 1000;
			let eskillid;
			if(e.skill.id > 3000){
				eskillid = e.skill.id;
			} else {
				eskillid = e.skill.id % 1000;
			}
			// If the guide module is active and a guide for the current dungeon is found
			if(dispatch.settings.enabled && guide_found){
				const ent = entity["mobs"][e.gameId.toString()];
				// Due to a bug for some bizare reason(probably proxy fucking itself) we do this ugly hack
				e.loc.w = e.w;
				// We've confirmed it's a mob, so it's plausible we want to act on this
				if(spguide){
					if(ent) return handle_event(Object.assign({}, ent, e), e.skill.id, "Skill", "s", debug.debug || debug.skill || (ent["templateId"] % 1 === 0 ? debug.boss : false), e.speed, e.stage);
				} else if(esguide){
					if(ent) return handle_event(Object.assign({}, ent, e), eskillid, "Skill", "s", debug.debug || debug.skill || (ent["templateId"] % 1 === 0 ? debug.boss : false), e.speed, e.stage);
				} else if(ent){return handle_event(Object.assign({}, ent, e), skillid, "Skill", "s", debug.debug || debug.skill || (ent["templateId"] % 1 === 0 ? debug.boss : false), e.speed, e.stage);}
			}
		}
		dispatch.hook("S_ACTION_STAGE", 9, {
			order: 15
		}, s_action_stage);

		/** ABNORMALITY **/

		// Boss abnormality triggered
		function abnormality_triggered(e){
			// If the guide module is active and a guide for the current dungeon is found
			if(dispatch.settings.enabled && guide_found){
				// avoid errors ResidentSleeper (neede for abnormality refresh)
				if(!e.source) e.source = 0;
				// If the boss/mob get"s a abnormality applied to it
				const target_ent = entity["mobs"][e.target.toString()];
				// If the boss/mob is the cause for the abnormality
				const source_ent = entity["mobs"][e.source.toString()];
				// If the mob/boss applies an abnormality to me, it"s plausible we want to act on this
				if(source_ent && player.isMe(e.target)) handle_event(source_ent, e.id, "Abnormality", "am", debug.debug || debug.abnormal);
				// If "nothing"/server applies an abnormality to me, it"s plausible we want to act on this. (spam rip)
				if(player.isMe(e.target) && (e.source || 0) == 0){
					handle_event({
						huntingZoneId: 0,
						templateId: 0
					}, e.id, "Abnormality", "ae", debug.debug || debug.abnormal);
				}
				// If it"s a mob/boss getting an abnormality applied to itself, it"s plausible we want to act on it
				if(target_ent) handle_event(target_ent, e.id, "Abnormality", "ab", debug.debug || debug.abnormal);
			}
		}
		dispatch.hook("S_ABNORMALITY_BEGIN", 4, {
			order: 15
		}, abnormality_triggered);
		dispatch.hook("S_ABNORMALITY_REFRESH", 2, {
			order: 15
		}, abnormality_triggered);

		/** HEALTH **/

		// Boss health bar triggered
		dispatch.hook("S_BOSS_GAGE_INFO", 3, e => {
			// If the guide module is active and a guide for the current dungeon is found
			if(dispatch.settings.enabled && guide_found){
				const ent = entity["mobs"][e.id.toString()];
				const hp = Math.floor(Number(e.curHp) / Number(e.maxHp) * 100);
				// Check mob"s hp of existing value for single call the event
				if(ent && mobs_hp[e.id.toString()] != hp){
					mobs_hp[e.id.toString()] = hp;
					// We"ve confirmed it"s a mob, so it"s plausible we want to act on this
					return handle_event(ent, hp, "Health", "h", debug.debug || debug.hp);
				}
			}
		});

		/** S_DUNGEON_EVENT_MESSAGE **/

		dispatch.hook("S_DUNGEON_EVENT_MESSAGE", 2, e => {
			if(dispatch.settings.enabled && guide_found){
				const result = /@dungeon:(\d+)/g.exec(e.message);
				if(result){
					handle_event({
						huntingZoneId: 0,
						templateId: 0
					}, parseInt(result[1]), "Dungeon Message", "dm", debug.debug || debug.dm);
				}
			}
		});

		/** S_QUEST_BALLOON **/

		dispatch.hook("S_QUEST_BALLOON", 1, e => {
			if(dispatch.settings.enabled && guide_found){
				const source_ent = entity["mobs"][e.source.toString()];
				const result = /@monsterBehavior:(\d+)/g.exec(e.message);
				if(result && source_ent){
					handle_event(source_ent, parseInt(result[1]), "Quest Balloon", "qb", debug.debug || debug.qb);
				}
			}
		});

		/** S_LOAD_TOPO **/

		function entry_zone(zone){
			// Enable errors debug
			let debug_errors = true;
			// Disable trigger event flag
			is_event = false;
			// Clear current hp values for all zone mobs
			mobs_hp = {};
			// Clear out the timers
			fake_dispatch._clear_all_timers();
			for(const key in timers) dispatch.clearTimeout(timers[key]);
			timers = {};
			// Clear out previous hooks, that our previous guide module hooked
			fake_dispatch._remove_all_hooks();
			// Send debug message
			debug_message(debug.debug, "Entered zone:", zone);
			// Remove potential cached guide from require cache, so that we don"t need to relog to refresh guide
			try {
				delete require.cache[require.resolve("./guides/" + zone)];
			} catch (e){}
			// Try loading a guide
			try {
				// Find and load zone data from settings
				entered_zone_data = {};
				for(const i of dispatch.settings.dungeons){
					if(i.id == zone){
						entered_zone_data = i;
						break;
					}
				}
				if(zone == "test"){
					entered_zone_data = { "id": "test", "name": "Test Guide", "name_RU": "Test Guide", "verbose": true, "spawnObject": true };
				}
				if(!entered_zone_data.id){
					debug_errors = debug.debug;
					throw "Guide for zone " + zone + " not found in config";
				}
				active_guide = require("./guides/" + zone);
				if(SP_ZONE_IDS.includes(zone)){
					spguide = true; // skill 1000-3000
					esguide = false;
				} else if(ES_ZONE_IDS.includes(zone)){
					spguide = false; // skill 100-200-3000
					esguide = true;
				} else {
					spguide = false; // skill 100-200
					esguide = false;
				}
				guide_found = true;
				if(entered_zone_data.name){
					if(spguide){
						text_handler({
							"sub_type": "PRMSG",
							"message_RU": "Вы вошли в SP данж: " + cr + entered_zone_data.name_RU + cw + " [" + zone + "]",
							"message": "Enter SP Dungeon: " + cr + entered_zone_data.name + cw + " [" + zone + "]"
						});
					} else if(esguide){
						text_handler({
							"sub_type": "PRMSG",
							"message_RU": "Вы вошли в ES данж: " + cr + entered_zone_data.name_RU + cw + " [" + zone + "]",
							"message": "Enter ES Dungeon: " + cr + entered_zone_data.name + cw + " [" + zone + "]"
						});
					} else {
						text_handler({
							"sub_type": "PRMSG",
							"message_RU": "Вы вошли в данж: " + cr + entered_zone_data.name_RU + cw + " [" + zone + "]",
							"message": "Enter Dungeon: " + cr + entered_zone_data.name + cw + " [" + zone + "]"
						});
					}
					text_handler({
						"sub_type": "CGMSG",
						"message_RU": `Введите "guide help" для вывода справки\n` +
							`Режим стриммера: ${dispatch.settings.stream ? "Вкл" : "Выкл"}\n` +
							`Отправка сообщений членам группы: ${dispatch.settings.gNotice ? "Вкл" : "Выкл"}\n` +
							`Проигрывание голосовых сообщений: ${dispatch.settings.speaks ? "Вкл" : "Выкл"}`,
						"message": `Enter "guide help" for more information\n` +
							`Streamer mode is ${dispatch.settings.stream ? "on" : "off"}.\n` +
							`Send messages to party members is ${dispatch.settings.gNotice ? "on" : "off"}.\n` +
							`Playng the voice messages is ${dispatch.settings.speaks ? "on" : "off"}.`
					});
				}
			} catch (e){
				entered_zone_data = {};
				active_guide = {};
				guide_found = false;
				debug_message(debug_errors, e);
			}
			if(guide_found){
				// Try calling the "load" function
				try {
					active_guide.load(fake_dispatch);
				} catch (e){
					debug_message(debug_errors, e);
				}
			}
		}

		// Load guide and clear out timers
		dispatch.hook("S_LOAD_TOPO", 3, e => {
			entry_zone(e.zone);
		});

		/** MISC **/

		// Guide command
		command.add(["guide"], {
			// Toggle debug settings
			debug(arg1){
				if(!arg1){
					arg1 = "debug";
				} else if(arg1 === "status"){
					for(const [key, value] of Object.entries(debug)){
						command.message(`debug(${key}): ${value ? "enabled" : "disabled"}.`);
					}
					return;
				} else if(debug[arg1] === undefined){
					return command.message(`Invalid sub command for debug mode. ${arg1}`);
				}
				debug[arg1] = !debug[arg1];
				command.message(`Guide module debug(${arg1}) mode has been ${debug[arg1] ? "enabled" : "disabled"}.`);
			},
			// Testing events
			event(arg1, arg2){
				// Enable trigger event flag
				is_event = true;
				// Clear library cache
				try {
					delete require.cache[require.resolve("./lib")];
				} catch (e){}
				// If arg1 is "load", load guide from arg2 specified
				if(arg1 === "load"){
					if(!arg2) return command.message(`Invalid values for sub command "event" ${arg1}`);
					return entry_zone(arg2);
				}
				// If arg1 is "reload", reload current loaded guide
				if(arg1 === "reload"){
					if(!entered_zone_data.id) return command.message("Guide not loaded");
					return entry_zone(entered_zone_data.id);
				}
				// If we didn't get a second argument or the argument value isn't an event type, we return
				if(arg1 === "trigger" ? (!active_guide[arg2]) : (!arg1 || !function_event_handlers[arg1] || !arg2)) return command.message(`Invalid values for sub command "event" ${arg1} | ${arg2}`);
				// if arg2 is "trigger". It means we want to trigger a event
				if(arg1 === "trigger"){
					start_events(active_guide[arg2], player);
				} else {
					try {
						// Call a function handler with the event we got from arg2 with yourself as the entity
						function_event_handlers[arg1](JSON.parse(arg2), player);
					} catch (e){
						// Disable trigger event flag
						is_event = false;
						debug_message(true, e);
					}
				}
				// guide event text '{"sub_type":"message","message":"Сообщение"}'
				// guide event spawn '{"type":"item","id":"1","sub_delay":"999999"}'
			},
			voice(){
				dispatch.settings.speaks = !dispatch.settings.speaks;
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": `Голосовые сообщения: ${dispatch.settings.speaks ? "Вкл" : "Выкл"}.`,
					"message": `Voice messages has been ${dispatch.settings.speaks ? "on" : "off"}.`
				});
			},
			stream(){
				dispatch.settings.stream = !dispatch.settings.stream;
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": `Режим стримера, скрытие сообщений: ${dispatch.settings.stream ? "Вкл" : "Выкл"}.`,
					"message": `Stream mode has been ${dispatch.settings.stream ? "on" : "off"}.`
				});
			},
			spawnObject(arg1){
				let sd_id;
				if(arg1){
					sd_id = find_dungeon_index(arg1);
					if(sd_id){
						dispatch.settings.dungeons[sd_id].spawnObject = !dispatch.settings.dungeons[sd_id].spawnObject;
						text_handler({
							"sub_type": "PRMSG",
							"message_RU": `Спавн объектов для данжа ${dispatch.settings.dungeons[sd_id].name_RU} [${dispatch.settings.dungeons[sd_id].id}]: ${dispatch.settings.dungeons[sd_id].spawnObject ? "Вкл" : "Выкл"}.`,
							"message": `Spawning objects for dungeon ${dispatch.settings.dungeons[sd_id].name_RU} [${dispatch.settings.dungeons[sd_id].id}] has been ${dispatch.settings.dungeons[sd_id].spawnObject ? "on" : "off"}.`
						});
					} else {
						text_handler({
							"sub_type": "PRMSG",
							"message_RU": "Данж с таким id не найден.",
							"message": "Dungeon not found."
						});
					}
				} else {
					dispatch.settings.spawnObject = !dispatch.settings.spawnObject;
					text_handler({
						"sub_type": "PRMSG",
						"message_RU": `Спавн объектов: ${dispatch.settings.spawnObject ? "Вкл" : "Выкл"}.`,
						"message": `Spawn objects ${dispatch.settings.spawnObject ? "on" : "off"}.`
					});
				}
			},
			verbose(arg1){
				let sd_id;
				if(arg1){
					sd_id = find_dungeon_index(arg1);
					if(sd_id){
						dispatch.settings.dungeons[sd_id].verbose = !dispatch.settings.dungeons[sd_id].verbose;
						text_handler({
							"sub_type": "PRMSG",
							"message_RU": `Показ сообщений для данжа ${dispatch.settings.dungeons[sd_id].name_RU} [${dispatch.settings.dungeons[sd_id].id}]: ${dispatch.settings.dungeons[sd_id].verbose ? "Вкл" : "Выкл"}.`,
							"message": `Messaging for dungeon ${dispatch.settings.dungeons[sd_id].name_RU} [${dispatch.settings.dungeons[sd_id].id}] has been ${dispatch.settings.dungeons[sd_id].verbose ? "on" : "off"}.`
						});
					} else {
						text_handler({
							"sub_type": "PRMSG",
							"message_RU": `Данж с таким id не найден.`,
							"message": `Dungeon not found.`
						});
					}
				} else {
					text_handler({
						"sub_type": "PRMSG",
						"message_RU": `Не указан id данжа.`,
						"message": `Dungeon id not specified.`
					});
				}
			},
			lNotice(){
				dispatch.settings.lNotice = !dispatch.settings.lNotice;
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": `Сообщения в чат: ${dispatch.settings.lNotice ? "Вкл" : "Выкл"}.`,
					"message": `Chat notices has been ${dispatch.settings.lNotice ? "on" : "off"}.`
				});
			},
			gNotice(){
				dispatch.settings.gNotice = !dispatch.settings.gNotice;
				command.message(`system Notice ${dispatch.settings.gNotice ? "on" : "off"}.`);
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": `Сообщения в группе: ${dispatch.settings.gNotice ? "Вкл" : "Выкл"}.`,
					"message": `Party chat notices has been ${dispatch.settings.gNotice ? "on" : "off"}.`
				});
			},
			1(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 1",
					"message": "Voice speed 1"
				});
				dispatch.settings.rate.splice(0, 1, rate1);
			},
			2(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 2",
					"message": "Voice speed 2"
				});
				dispatch.settings.rate.splice(0, 1, rate2);
			},
			3(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 3",
					"message": "Voice speed 3"
				});
				dispatch.settings.rate.splice(0, 1, rate3);
			},
			4(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 4",
					"message": "Voice speed 4"
				});
				dispatch.settings.rate.splice(0, 1, rate4);
			},
			5(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 5",
					"message": "Voice speed 5"
				});
				dispatch.settings.rate.splice(0, 1, rate5);
			},
			6(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 6",
					"message": "Voice speed 6"
				});
				dispatch.settings.rate.splice(0, 1, rate6);
			},
			7(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 7",
					"message": "Voice speed 7"
				});
				dispatch.settings.rate.splice(0, 1, rate7);
			},
			8(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 8",
					"message": "Voice speed 8"
				});
				dispatch.settings.rate.splice(0, 1, rate8);
			},
			9(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 9",
					"message": "Voice speed 9"
				});
				dispatch.settings.rate.splice(0, 1, rate9);
			},
			10(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Скорость речи 10",
					"message": "Voice speed 10"
				});
				dispatch.settings.rate.splice(0, 1, rate10);
			},
			cr(){
				text_handler({
					"sub_type": "CRMSG",
					"message_RU": "Цвет системного сообщения: красный",
					"message": "system message notification color is red"
				});
				dispatch.settings.cc.splice(0, 1, cr);
			},
			cc(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "Текущий цвет системного сообщения",
					"message": "View the current system message notification color"
				});
			},
			co(){
				text_handler({
					"sub_type": "COMSG",
					"message_RU": "Цвет системного сообщения: оранжевый",
					"message": "system message notification color is  ORANGE"
				});
				dispatch.settings.cc.splice(0, 1, co);
			},
			cy(){
				text_handler({
					"sub_type": "CYMSG",
					"message_RU": "Цвет системного сообщения: желтый",
					"message": "system message notification color is YELLOW"
				});
				dispatch.settings.cc.splice(0, 1, cy);
			},
			cg(){
				text_handler({
					"sub_type": "CGMSG",
					"message_RU": "Цвет системного сообщения: зеленый",
					"message": "system message notification color is GREEN"
				});
				dispatch.settings.cc.splice(0, 1, cg);
			},
			cdb(){
				text_handler({
					"sub_type": "CDBMSG",
					"message_RU": "Цвет системного сообщения: темно-синий",
					"message": "system message notification color is DARK BLUE"
				});
				dispatch.settings.cc.splice(0, 1, cr);
			},
			cb(){
				text_handler({
					"sub_type": "CBMSG",
					"message_RU": "Цвет системного сообщения: синий",
					"message": "system message notification color is BLUE"
				});
				dispatch.settings.cc.splice(0, 1, cb);
			},
			cv(){
				text_handler({
					"sub_type": "CVMSG",
					"message_RU": "Цвет системного сообщения: фиолетовый",
					"message": "system message notification color is VIOLET"
				});
				dispatch.settings.cc.splice(0, 1, cv);
			},
			cp(){
				text_handler({
					"sub_type": "CPMSG",
					"message_RU": "Цвет системного сообщения: розовый",
					"message": "system message notification color is PINK"
				});
				dispatch.settings.cc.splice(0, 1, cp);
			},
			clp(){
				text_handler({
					"sub_type": "CLPMSG",
					"message_RU": "Цвет системного сообщения: светло-розовый",
					"message": "system message notification color is LIGHT PINK"
				});
				dispatch.settings.cc.splice(0, 1, clp);
			},
			clb(){
				text_handler({
					"sub_type": "CLBMSG",
					"message_RU": "Цвет системного сообщения: светло-синий",
					"message": "system message notification color is LIGHT BLUE"
				});
				dispatch.settings.cc.splice(0, 1, clb);
			},
			cbl(){
				text_handler({
					"sub_type": "CBLMSG",
					"message_RU": "Цвет системного сообщения: черный",
					"message": "system message notification color is  BLACK"
				});
				dispatch.settings.cc.splice(0, 1, cbl);
			},
			cgr(){
				text_handler({
					"sub_type": "CGRMSG",
					"message_RU": "Цвет системного сообщения: серый",
					"message": "system message notification color is  GRAY"
				});
				dispatch.settings.cc.splice(0, 1, cgr);
			},
			cw(){
				text_handler({
					"sub_type": "CWMSG",
					"message_RU": "Цвет системного сообщения: белый",
					"message": "system message notification color is  WHITE"
				});
				dispatch.settings.cc.splice(0, 1, cw);
			},
			dungeons(){
				for(const i of dispatch.settings.dungeons){
					if(AVAILABLE_ZONE_IDS.includes(i.id)){
						text_handler({
							"sub_type": "CWMSG",
							"message_RU": `${i.id} - ${i.name_RU}`,
							"message": `${i.id} - ${i.name}`
						});
					}
				}
			},
			help(){
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide, вкл./выкл. модуля",
					"message": "guide, module on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide gui, показать графический интерфейс",
					"message": "guide gui, show module GUI"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide voice, вкл./выкл. голосовые сообщения",
					"message": "guide voice, text-to-speech (TTS) notices on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide lNotice, вкл./выкл. отправки уведомлений в канал чата",
					"message": "guide lNotice, send notices to chat on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide gNotice, вкл./выкл. отправки уведомлений в чат группы",
					"message": "guide gNotice, send notices to party chat channel on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide 1~10, регулировка скорости чтения голосовых сообщений",
					"message": "guide 1~10, to settings TTS speech rate"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide spawnObject, вкл./выкл. спавна маркировочных объектов",
					"message": "guide spawnObject, spawn marker objects on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide stream, вкл./выкл. режима стрима (скрытие уведомлений и объектов)",
					"message": "guide stream, streamer mode on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide dungeons, список всех поддерживаемых данжей и их id",
					"message": "guide dungeons, list of all supported dungeons"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide verbose id, вкл./выкл. всех сообщений для данжа, где id - идентификатор данжа",
					"message": "verbose id, send notices for specified dungeon on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide spawnObject id, вкл./выкл. спавна объектов для данжа, где id - идентификатор данжа",
					"message": "guide spawnObject id, spawn marker objects for specified dungeon on/off"
				});
				text_handler({
					"sub_type": "PRMSG",
					"message_RU": "guide cc, отобразить текущий цвет системного сообщения",
					"message": "guide cc, view the current system message notification color"
				});
				text_handler({
					"sub_type": "CRMSG",
					"message_RU": "guide cr, установить цвет сообщения: красный",
					"message": "guide cr, message color is RED"
				});
				text_handler({
					"sub_type": "COMSG",
					"message_RU": "guide c, установить цвет сообщения: оранжевый",
					"message": "guide co, message color is ORANGE"
				});
				text_handler({
					"sub_type": "CYMSG",
					"message_RU": "guide cy, установить цвет сообщения: желтый",
					"message": "guide cy, message color is YELLOW"
				});
				text_handler({
					"sub_type": "CGMSG",
					"message_RU": "guide cg, установить цвет сообщения: зеленый",
					"message": "guide cg, message color is GREEN"
				});
				text_handler({
					"sub_type": "CDBMSG",
					"message_RU": "guide cdb, установить цвет сообщения: темно-синий",
					"message": "guide cdb, message color is DARK BLUE"
				});
				text_handler({
					"sub_type": "CBMSG",
					"message_RU": "guide cb, установить цвет сообщения: синий",
					"message": "guide cb, message color is BLUE"
				});
				text_handler({
					"sub_type": "CVMSG",
					"message_RU": "guide cv, установить цвет сообщения: фиолетовый",
					"message": "guide cv, message color is VIOLET"
				});
				text_handler({
					"sub_type": "CPMSG",
					"message_RU": "guide cp, установить цвет сообщения: розовый",
					"message": "guide cp, message color is PINK"
				});
				text_handler({
					"sub_type": "CLPMSG",
					"message_RU": "guide clp, установить цвет сообщения: светло-розовый",
					"message": "guide clp, message color is LIGHT PINK"
				});
				text_handler({
					"sub_type": "CLBMSG",
					"message_RU": "guide clb, установить цвет сообщения: светло-синий",
					"message": "guide clb, message color is LIGHT BLUE"
				});
				text_handler({
					"sub_type": "CBLMSG",
					"message_RU": "guide cbl, установить цвет сообщения: черный",
					"message": "guide cbl, message color is BLACK"
				});
				text_handler({
					"sub_type": "CGRMSG",
					"message_RU": "guide cgr, установить цвет сообщения: серый",
					"message": "guide cgr, message color is GRAY"
				});
				text_handler({
					"sub_type": "CWMSG",
					"message_RU": "guide cw, установить цвет сообщения: белый",
					"message": "guide cw, message color is WHITE"
				});
			},
			gui(){
				gui_handler("index", "TERA-Guide");
			},
			$default(arg1){
				if(arg1 === undefined){
					dispatch.settings.enabled = !dispatch.settings.enabled;
					text_handler({
						"sub_type": "PRMSG",
						"message_RU": `Модуль: ${dispatch.settings.enabled ? "Вкл" : "Выкл"}.`,
						"message": `guide ${dispatch.settings.enabled ? "on" : "off"}.`
					});
				} else {
					text_handler({
						"sub_type": "PRMSG",
						"message_RU": "Невереная команда, введите guide help",
						"message": 'Unknown command, type "guide help"'
					});
				}
			}
		});

		/** Function/event handlers for types **/

		// Spawn handler
		function spawn_handler(event, ent, speed = 1.0){
			// Ignore if streamer mode is enabled
			if(dispatch.settings.stream) return;
			// Ignore if spawnObject is disabled
			if(!dispatch.settings.spawnObject) return;
			if(!entered_zone_data.spawnObject && !is_event) return;
			// Make sure id is defined
			if(!event["id"]) return debug_message(true, "Spawn handler needs a id");
			// Make sure sub_delay is defined
			if(!event["sub_delay"]) return debug_message(true, "Spawn handler needs a sub_delay");
			// Make sure distance is defined
			// if(!event["distance"]) return debug_message(true, "Spawn handler needs a distance");
			// Set sub_type to be collection as default for backward compatibility
			const sub_type = event["sub_type"] || "collection";
			// The unique spawned id this item will be using.
			const item_unique_id = event["force_gameId"] || random_timer_id--;
			// The location of the item spawned
			let loc = ent["loc"].clone();
			// if pos is set, we use that
			if(event["pos"]) loc = event["pos"];
			loc.w = (ent["loc"].w || 0) + (event["offset"] || 0);
			library.applyDistance(loc, event["distance"] || 0, event["degrees"] || 0);
			const sending_event = {
				gameId: item_unique_id,
				loc: loc,
				w: loc.w
			};
			const despawn_event = {
				gameId: item_unique_id,
				unk: 0, // used in S_DESPAWN_BUILD_OBJECT
				collected: false // used in S_DESPAWN_COLLECTION
			};
			// Create the sending event
			switch(sub_type){
				// If it"s type collection, it"s S_SPAWN_COLLECTION
				case "collection":{
					Object.assign(sending_event, {
						id: event["id"],
						amount: 1,
						extractor: false,
						extractorDisabled: false,
						extractorDisabledTime: 0
					});
					break;
				}
				// If it"s type item, it"s S_SPAWN_DROPITEM
				case "item":{
					Object.assign(sending_event, {
						item: event["id"],
						amount: 1,
						expiry: 0,
						explode: false,
						masterwork: false,
						enchant: 0,
						debug: false,
						owners: []
					});
					break;
				}
				// If it's type build_object, it's S_SPAWN_BUILD_OBJECT
				case "build_object":{
					Object.assign(sending_event, {
						itemId: event["id"],
						unk: 0,
						ownerName: event["ownerName"] || "",
						message: event["message"] || ""
					});
					break;
				}
				// If we haven't implemented the sub_type the event asks for
				default:{
					return debug_message(true, "Invalid sub_type for spawn handler:", event['sub_type']);
				}
			}
			// Create the timer for spawning the item
			timers[item_unique_id] = dispatch.setTimeout(() => {
				switch(sub_type){
					case "collection":
						return dispatch.toClient("S_SPAWN_COLLECTION", 4, sending_event);
					case "item":
						return dispatch.toClient("S_SPAWN_DROPITEM", 8, sending_event);
					case "build_object":
						return dispatch.toClient("S_SPAWN_BUILD_OBJECT", 2, sending_event);
				}
			}, event["delay"] || 0 / speed);
			// Create the timer for despawning the item
			timers[random_timer_id--] = dispatch.setTimeout(() => {
				switch(sub_type){
					case "collection":
						return dispatch.toClient("S_DESPAWN_COLLECTION", 2, despawn_event);
					case "item":
						return dispatch.toClient("S_DESPAWN_DROPITEM", 4, despawn_event);
					case "build_object":
						return dispatch.toClient("S_DESPAWN_BUILD_OBJECT", 2, despawn_event);
				}
			}, event["sub_delay"] / speed);
		}

		// Despawn handler
		function despawn_handler(event){
			// Ignore if streamer mode is enabled
			if(dispatch.settings.stream) return;
			// Ignore if spawnObject is disabled
			if(!dispatch.settings.spawnObject) return;
			if(!entered_zone_data.spawnObject && !is_event) return;
			// Make sure id is defined
			if(!event['id']) return debug_message(true, "Spawn handler needs a id");
			// Set sub_type to be collection as default for backward compatibility
			const sub_type = event["sub_type"] || "collection";
			const despawn_event = {
				gameId: event["id"],
				unk: 0, // used in S_DESPAWN_BUILD_OBJECT
				collected: false // used in S_DESPAWN_COLLECTION
			};
			switch(sub_type){
				case "collection":
					return dispatch.toClient("S_DESPAWN_COLLECTION", 2, despawn_event);
				case "item":
					return dispatch.toClient("S_DESPAWN_DROPITEM", 4, despawn_event);
				case "build_object":
					return dispatch.toClient("S_DESPAWN_BUILD_OBJECT", 2, despawn_event);
				default:
					return debug_message(true, "Invalid sub_type for despawn handler:", event["sub_type"]);
			}
		}

		// Text handler
		function text_handler(event, ent, speed = 1.0){
			// Fetch the message
			const message = event[`message_${language}`] || event[`message_${language.toUpperCase()}`] || event["message"];
			// Make sure sub_type is defined
			if(!event["sub_type"]) return debug_message(true, "Text handler needs a sub_type");
			// Make sure message is defined
			if(!message) return debug_message(true, "Text handler needs a message");
			// Send guide messages or/and play the voice
			if(["message", "alert", "warning", "notification", "msgcp", "msgcg", "speech"].includes(event["sub_type"])){
				// Ignoring if verbose mode is disabled
				if(!entered_zone_data.verbose && !is_event) return;
				// Play the voice of text message
				if(voice && dispatch.settings.speaks){
					timers[event["id"] || random_timer_id--] = dispatch.setTimeout(() => {
						voice.speak(message, dispatch.settings.rate);
					}, (event["delay"] || 0) - 600 / speed);
				}
				// Ignoring sending a text message if "speech" sub_type specified
				if(event["sub_type"] == "speech") return;
				// Send a text message
				timers[event["id"] || random_timer_id--] = dispatch.setTimeout(() => {
					switch(event["sub_type"]){
						// Basic message
						case "message":
							sendMessage(message);
							break;
							// Alert message red
						case "alert":
							sendAlert(message, cr, spr);
							break;
							// Alert message blue
						case "warning":
							sendAlert(message, clb, spb);
							break;
							// Notification message
						case "notification":
							sendNotification(message);
							break;
							// Pink dungeon event message
						case "msgcp":
							sendDungeonEvent(message, cp, spg);
							break;
							// Green dungeon event message
						case "msgcg":
							sendDungeonEvent(message, cg, spg);
							break;
					}
				}, (event["delay"] || 0) / speed);
			// Other types of messages (eg proxy-channel message)
			} else {
				switch(event["sub_type"]){
					// Debug or test message to the proxy-channel and log console
					case "MSG":{
						timers[event["id"] || random_timer_id--] = dispatch.setTimeout(() => {
							command.message(cr + message);
							console.log(cr + message);
						}, (event["delay"] || 0) - 600 / speed);
						break;
					}
					// Color-specified proxy-channel messages
					case "COMSG":
						command.message(co + message);
						break;
					case "CYMSG":
						command.message(cy + message);
						break;
					case "CGMSG":
						command.message(cg + message);
						break;
					case "CDBMSG":
						command.message(cdb + message);
						break;
					case "CBMSG":
						command.message(cb + message);
						break;
					case "CVMSG":
						command.message(cv + message);
						break;
					case "CPMSG":
						command.message(cp + message);
						break;
					case "CLPMSG":
						command.message(clp + message);
						break;
					case "CLBMSG":
						command.message(clb + message);
						break;
					case "CBLMSG":
						command.message(cbl + message);
						break;
					case "CGRMSG":
						command.message(cgr + message);
						break;
					case "CWMSG":
						command.message(cw + message);
						break;
					case "CRMSG":
						command.message(cr + message);
						break;
					// Default color proxy-channel message
					case "PRMSG":
						command.message(dispatch.settings.cc + message);
						break;
					// Invalid sub_type value
					default:
						return debug_message(true, "Invalid sub_type for text handler:", event['sub_type']);
				}
			}
		}

		// Basic message
		function sendMessage(message){
			// If streamer mode is enabled send message to the proxy-channel
			if(dispatch.settings.stream){
				command.message(dispatch.settings.cc + message);
				return;
			}
			if(dispatch.settings.lNotice){
				// Send message as a Team leader notification
				dispatch.toClient("S_CHAT", 3, {
					channel: 21, // 21 = team leader, 25 = raid leader, 1 = party, 2 = guild
					message
				});
			} else {
				// Send message as a green colored Dungeon Event
				sendDungeonEvent(message, dispatch.settings.cc, spg);
			}
			// Send message to party if gNotice is enabled
			if(dispatch.settings.gNotice){
				dispatch.toClient("S_CHAT", 3, {
					channel: 1,
					message
				});
			}
		}

		// Notification message
		function sendNotification(message){
			// If streamer mode is enabled send message to the proxy-channel
			if(dispatch.settings.stream){
				command.message(clb + "[Notice] " + dispatch.settings.cc + message);
				return;
			}
			// Send message as a Raid leader notification
			dispatch.toClient("S_CHAT", 3, {
				channel: 25,
				authorName: "guide",
				message
			});
			// Send message to party if gNotice is enabled
			if(dispatch.settings.gNotice){
				dispatch.toClient("S_CHAT", 3, {
					channel: 1,
					message
				});
			}
		}

		// Alert message
		function sendAlert(message, cc, spc){
			// If streamer mode is enabled send message to the proxy-channel
			if(dispatch.settings.stream){
				command.message(cc + "[Alert] " + dispatch.settings.cc + message);
				return;
			}
			if(dispatch.settings.lNotice){
				// Send message as a Raid leader notification
				dispatch.toClient("S_CHAT", 3, {
					channel: 25,
					authorName: "guide",
					message
				});
			} else {
				// Send message as a color-specified Dungeon Event
				sendDungeonEvent(message, dispatch.settings.cc, spc);
			}
			// Send message to party if gNotice or gAlert is enabled
			if(dispatch.settings.gNotice/* || dispatch.settings.gAlert*/){
				dispatch.toClient("S_CHAT", 3, {
					channel: 1,
					message
				});
			}
		}

		// Dungeon Event message
		function sendDungeonEvent(message, spcc, type){
			// If streamer mode is enabled send message to the proxy-channel
			if(dispatch.settings.stream){
				command.message(dispatch.settings.cc + message);
				return;
			}
			// Send a color-specified Dungeon Event message
			dispatch.toClient("S_DUNGEON_EVENT_MESSAGE", 2, {
				type: type,
				chat: 0,
				channel: 27,
				message: (spcc + message)
			});
		}

		// Stop timer handler
		function stop_timer_handler(event, ent, speed = 1.0){
			// Make sure id is defined
			if(!event["id"]) return debug_message(true, "Stop timer handler needs a id");
			// Check if that entry exists, if it doesn't print out a debug message. This is because users can make mistakes
			if(!timers[event["id"]]) return debug_message(true, `There isn't a timer with tie id: ${event["id"]} active`);
			// clearout the timer
			dispatch.clearTimeout(timers[event["id"]]);
		}

		// Func handler
		function func_handler(event, ent, speed = 1.0){
			// Make sure func is defined
			if(!event["func"]) return debug_message(true, "Func handler needs a func");
			// Start the timer for the function call
			timers[event["id"] || random_timer_id--] = dispatch.setTimeout(event["func"], (event["delay"] || 0) / speed, function_event_handlers, event, ent, fake_dispatch);
		}
	}
}

module.exports = TeraGuide;
