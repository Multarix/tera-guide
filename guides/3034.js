// RK-9 Kennel (Hard)
//
// made by michengs / HSDN

const { HIGHLIGHT_ITEM, SpawnItem, SpawnMarker, SpawnPoint, SpawnVector, SpawnCircle } = require("../lib");

let player, entity, library, effect;

let orb_notice = true;
let boss_seventy = false;
let msg_a = 3;
let msg_b = 3;
let mech_reverse = false;

const mech_messages = {
	0: { msgt: "Out", msg: "От него" },
	1: { msgt: "In", msg: "К нему" },
	2: { msgt: "Wave", msg: "Волна" },
	3: { msgt: "?", msg: "?" }
};

function skilld_event(skillid, handlers, event, ent, dispatch){
	// 2 BOSS
	if(orb_notice && skillid == 301){
		orb_notice = false;
		handlers['text']({ "sub_type": "message", "message": "Throwing Orb", "message_RU": "Бомба" });
		dispatch.setTimeout(() => orb_notice = true, 13000);
	}

	// 3 BOSS

	// Core mechanics
	if([3034302, 3034303, 3034304, 3034311, 3034312].includes(skillid)){
		switch(skillid){
			// DM
			case 3034302: // Out
				msg_a = 0;
				print_mech(true, false, handlers);
				break;
			case 3034303: // In
				msg_a = 1;
				print_mech(true, false, handlers);
				break;
			case 3034304: // Wave
				msg_a = 2;
				print_mech(true, false, handlers);
				break;
			// QB
			case 3034311: // STANDARD (1)
				mech_reverse = false;
				print_mech(true, true, handlers);
				break;
			case 3034312: // REVERSE (0)
				mech_reverse = true;
				print_mech(true, true, handlers);
				break;
		}
	}
	// QB
	// 0: Out  3034301
	// 1: In   3034302
	// 2: Wave 3034303
	if(skillid >= 0 && skillid < 3){
		msg_b = skillid;
		print_mech(false, false, handlers);
		msg_a = msg_b;
		msg_b = 3;
		dispatch.setTimeout(() => {
			print_mech(true, false, handlers);
		}, 7000);
	}

	// S-attacks
	// Safe: 116/119 [R] + 222-0 [R] > 222-1 [L] > 222-2 [R] > 326/327
	// Safe: 117/118 [L] + 223-0 [L] > 223-1 [R] > 223-2 [L] > 326/327
	const delay = boss_seventy ? 2000 : 0;
	let duration = boss_seventy ? 800 : 900;
	if([1160, 1190].includes(skillid)){
		handlers["text"]({ "sub_type": "message", "delay": delay, "message": "Right Safe", "message_RU": "Справа сейф" });
	}
	if([1170, 1180].includes(skillid)){
		handlers["text"]({ "sub_type": "message", "delay": delay, "message": "Left Safe", "message_RU": "Слева сейф" });
	}
	if([1160, 1170, 1180, 1190].includes(skillid) && boss_seventy){ // <70%
		if(mech_reverse){
			handlers["text"]({ "sub_type": "message", "message": "Triple-S | Out", "message_RU": "Трипл-эска | От него" });
			handlers["text"]({ "sub_type": "message", "delay": 5000, "message": "Out", "message_RU": "От него" });
		} else {
			handlers["text"]({ "sub_type": "message", "message": "Triple-S | In", "message_RU": "Трипл-эска | К нему" });
			handlers["text"]({ "sub_type": "message", "delay": 5000, "message": "In", "message_RU": "К нему" });
		}
		SpawnCircle(false, 445, 0, 0, 10, 300, 5000, 3000, handlers, event, ent, dispatch);
		duration = 2000;
	}
	if([1160, 1161, 1162, 1163, 1190, 1191, 1192, 1193, 2220, 2222, 2231].includes(skillid)){ // right safe
		SpawnMarker(false, 160, 300, 0, duration, true, null, handlers, event, ent, dispatch);
		SpawnMarker(false, 340, 300, 0, duration, true, null, handlers, event, ent, dispatch);
		SpawnPoint(202, 170, 200, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(202, 350, 200, 0, duration, handlers, event, ent, dispatch);
		SpawnVector(912, 170, 210, 180, 290, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 120, 250, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 130, 240, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 140, 230, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 150, 220, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 160, 210, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 300, 250, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 310, 240, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 320, 230, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 330, 220, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 340, 210, 0, duration, handlers, event, ent, dispatch);
		SpawnVector(912, 350, 210, 0, 290, 0, duration, handlers, event, ent, dispatch);
	}
	if([1170, 1171, 1172, 1173, 1180, 1181, 1182, 1183, 2230, 2232, 2221].includes(skillid)){ // left safe
		SpawnMarker(false, 20, 300, 0, duration, true, null, handlers, event, ent, dispatch);
		SpawnMarker(false, 200, 300, 0, duration, true, null, handlers, event, ent, dispatch);
		SpawnPoint(202, 10, 200, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(202, 190, 200, 0, duration, handlers, event, ent, dispatch);
		SpawnVector(912, 10, 210, 0, 290, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 20, 210, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 30, 220, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 40, 230, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 50, 240, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 60, 250, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 240, 250, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 230, 240, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 220, 230, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 210, 220, 0, duration, handlers, event, ent, dispatch);
		SpawnPoint(912, 200, 210, 0, duration, handlers, event, ent, dispatch);
		SpawnVector(912, 190, 210, 180, 290, 0, duration, handlers, event, ent, dispatch);
	}
}

function print_mech(next, code, handlers){
	let message = "",
		message_RU = "",
		sub_type = "message";

	if(next){
		message += "Next: ";
		message_RU += "Далее: ";
		sub_type = "notification";
	}
	if(mech_reverse){
		message += mech_messages[msg_b].msgt + " + " + mech_messages[msg_a].msgt;
		message_RU += mech_messages[msg_b].msg + " + " + mech_messages[msg_a].msg;
	} else {
		message += mech_messages[msg_a].msgt + " + " + mech_messages[msg_b].msgt;
		message_RU += mech_messages[msg_a].msg + " + " + mech_messages[msg_b].msg;
	}
	if(code){
		message += ", Code: " + (mech_reverse ? "0" : "1");
		message_RU += ", Код: " + (mech_reverse ? "0" : "1");
	}
	handlers["text"]({
		"sub_type": sub_type,
		"message_RU": message_RU,
		"message": message
	});
}

function thirdboss_start_event(){
	boss_seventy = false;
}

function thirdboss_seventy_event(handlers){
	boss_seventy = true;
}

module.exports = {
	load(dispatch){
		({ player, entity, library, effect } = dispatch.require.library);
	},

	// 1 BOSS
	"qb-3034-1000-3034101": [{ "type": "text", "sub_type": "message", "message": "Pizza", "message_RU": "Пицца" }],
	"qb-3034-1000-3034102": [{ "type": "text", "sub_type": "message", "message": "AOE! Jump", "message_RU": "AOE! Прыгай!!!" }],
	"s-3034-1000-104-0": [{ "type": "text", "sub_type": "message", "message": "Front Clip", "message_RU": "Передний зажим" }],
	"s-3034-1000-108-0": [{ "type": "text", "sub_type": "message", "message": "Get Out", "message_RU": "От него" }], // крутилка
	"s-3034-1000-111-0": [{ "type": "text", "sub_type": "message", "message": "Back + Front", "message_RU": "Удар назад + вперед" }],
	"s-3034-1000-112-0": [{ "type": "text", "sub_type": "message", "message": "Back", "message_RU": "Удар назад" }],
	"s-3034-1003-205-0": [{ "type": "text", "sub_type": "message", "message": "Wind (Kaia)", "message_RU": "Ветер (кайя)!" }],
	"s-3034-1000-304-0": [{ "type": "text", "sub_type": "message", "message": "Out", "message_RU": "От него" }],
	"s-3034-1000-305-0": [{ "type": "text", "sub_type": "message", "message": "In", "message_RU": "К нему" }],
	"s-3034-1000-306-0": [{ "type": "text", "sub_type": "message", "message": "Bombs", "message_RU": "Бомбы" }],
	"s-3034-1000-307-0": [{ "type": "text", "sub_type": "message", "message": "Pull", "message_RU": "Стяжка" }],
	"s-3034-1000-309-0": [
		{ "type": "text", "sub_type": "message", "message": "Four Missile", "message_RU": "Запуск 4 ракет" },
		{ "type": "text", "sub_type": "message", "delay": 6000, "message": "5", "message_RU": "5" },
		{ "type": "text", "sub_type": "message", "delay": 7000, "message": "4", "message_RU": "4" },
		{ "type": "text", "sub_type": "message", "delay": 8000, "message": "3", "message_RU": "3" },
		{ "type": "text", "sub_type": "message", "delay": 9000, "message": "2", "message_RU": "2" },
		{ "type": "text", "sub_type": "message", "delay": 10000, "message": "1", "message_RU": "1" },
		{ "type": "text", "sub_type": "message", "delay": 11000, "message": "Jump", "message_RU": "Прыгай!" }],
	"s-3034-1000-311-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe right front", "message_RU": "Справа спереди сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 67, 120, 100, 12000, true, null) }],
	"s-3034-1000-312-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe right back", "message_RU": "Справа сзади сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 112, 120, 100, 12000, true, null) }],
	"s-3034-1000-313-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe back left", "message_RU": "Сзади слева сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 202, 120, 100, 12000, true, null) }],
	"s-3034-1000-314-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe front left", "message_RU": "Спереди слева сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 337, 120, 100, 12000, true, null) }],
	"s-3034-1000-315-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe front right", "message_RU": "Спереди справа сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 22, 120, 100, 12000, true, null) }],
	"s-3034-1000-316-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe back right", "message_RU": "Сзади справа сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 157, 120, 100, 12000, true, null) }],
	"s-3034-1000-317-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe left back", "message_RU": "Слева сзади сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 247, 120, 100, 12000, true, null) }],
	"s-3034-1000-318-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe left front", "message_RU": "Слева спереди сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 292, 120, 100, 12000, true, null) }],
	"s-3034-1000-319-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe front right", "message_RU": "Спереди справа сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 22, 120, 100, 12000, true, null) }],
	"s-3034-1000-320-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe back right", "message_RU": "Сзади справа сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 157, 120, 100, 12000, true, null) }],
	"s-3034-1000-321-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe back left", "message_RU": "Сзади слева сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 202, 120, 100, 12000, true, null) }],
	"s-3034-1000-322-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe left front", "message_RU": "Слева спереди сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 292, 120, 100, 12000, true, null) }],
	"s-3034-1000-323-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe right front", "message_RU": "Справа спереди сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 67, 120, 100, 12000, true, null) }],
	"s-3034-1000-324-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe right back", "message_RU": "Справа сзади сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 112, 120, 100, 12000, true, null) }],
	"s-3034-1000-325-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe left back", "message_RU": "Слева сзади сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 247, 120, 100, 12000, true, null) }],
	"s-3034-1000-326-0": [
		{ "type": "text", "sub_type": "message", "message": "Safe front left", "message_RU": "Спереди слева сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 337, 120, 100, 12000, true, null) }],

	// 2 BOSS
	"h-3034-2000-99": [
		{ "type": "spawn", "id": 476, "sub_delay": 99999999, "pos": { x: -32904, y: 59440, z: 0 } },
		{ "type": "spawn", "id": 476, "sub_delay": 99999999, "pos": { x: -32900, y: 58824, z: 0 } },
		{ "type": "spawn", "id": 476, "sub_delay": 99999999, "pos": { x: -32372, y: 58520, z: 0 } },
		{ "type": "spawn", "id": 476, "sub_delay": 99999999, "pos": { x: -31842, y: 58833, z: 0 } },
		{ "type": "spawn", "id": 476, "sub_delay": 99999999, "pos": { x: -31846, y: 59444, z: 0 } },
		{ "type": "spawn", "id": 476, "sub_delay": 99999999, "pos": { x: -32379, y: 59750, z: 0 } }],
	"s-3034-2000-102-0": [
		{ "type": "text", "sub_type": "message", "message": "Pizza Cutter", "message_RU": "Пила" },
		{ "type": "func", "func": SpawnCircle.bind(null, true, 553, 0, 300, 12, 228, 0, 3000) }],
	"s-3034-2000-105-0": [
		{ "type": "text", "sub_type": "message", "message": "360", "message_RU": "Крутилка (откид)" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 278, 0, 5000) }],
	"s-3034-2000-108-0": [
		{ "type": "text", "sub_type": "message", "message": "Back Swipe", "message_RU": "Откид назад" },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 0, 0, 240, 380, 0, 2000) },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 0, 0, 120, 380, 0, 2000) }],
	"s-3034-2000-301-0": [{ "type": "func", "func": skilld_event.bind(null, 301) }],
	"s-3034-2000-304-0": [
		{ "type": "text", "sub_type": "message", "message": "Get Out", "message_RU": "От него" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 8, 400, 0, 4000) }],
	"s-3034-2000-305-0": [
		{ "type": "text", "sub_type": "message", "message": "In | Out", "message_RU": "К нему | От него" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 200, 0, 3000) }],
	// Safe: |||2|2||| > ||||1|||| > ||3|||3||
	"s-3034-2000-310-0": [{ "type": "text", "sub_type": "message", "message": "2 - 1 - 3" },
		// { "type": "func", "func": SpawnItem.bind(null, HIGHLIGHT_ITEM, 95, 310, 0, 5000) },
		// { "type": "func", "func": SpawnItem.bind(null, HIGHLIGHT_ITEM, 265, 310, 0, 5000) },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 40, 220, 0, 1500, true, null) }, // 2
		{ "type": "func", "func": SpawnMarker.bind(null, false, -40, 220, 0, 1500, true, null) }, // 2
		{ "type": "func", "func": SpawnMarker.bind(null, false, 0, 150, 1600, 1500, true, null) }, // 1
		{ "type": "func", "func": SpawnMarker.bind(null, false, 60, 300, 1600, 1500, true, null) }, // 3
		{ "type": "func", "func": SpawnMarker.bind(null, false, -60, 300, 3200, 1500, true, null) } // 3
	],
	// Safe: ||||1|||| > ||3|||3|| > |||2|2|||
	"s-3034-2000-311-0": [{ "type": "text", "sub_type": "message", "message": "1 - 3 - 2" },
		// { "type": "func", "func": SpawnItem.bind(null, HIGHLIGHT_ITEM, 95, 310, 0, 5000) },
		// { "type": "func", "func": SpawnItem.bind(null, HIGHLIGHT_ITEM, 265, 310, 0, 5000) },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 0, 150, 0, 1500, true, null) }, // 1
		{ "type": "func", "func": SpawnMarker.bind(null, false, 60, 300, 1600, 1500, true, null) }, // 3
		{ "type": "func", "func": SpawnMarker.bind(null, false, -60, 300, 1600, 1500, true, null) }, // 3
		{ "type": "func", "func": SpawnMarker.bind(null, false, 40, 220, 3200, 1500, true, null) }, // 2
		{ "type": "func", "func": SpawnMarker.bind(null, false, -40, 220, 3200, 1500, true, null) } // 2
	],
	"s-3034-2007-201-0": [
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 0, 500, 0, 8000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 90, 500, 0, 8000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 180, 500, 0, 8000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 270, 500, 0, 8000) }],
	"s-3034-2007-306-0": [
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 0, 500, 0, 4000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 90, 500, 0, 4000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 180, 500, 0, 4000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 270, 500, 0, 4000) }],
	"s-3034-2007-307-0": [
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 0, 500, 0, 12000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 90, 500, 0, 12000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 180, 500, 0, 12000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 270, 500, 0, 12000) }],

	// 3 BOSS
	"h-3034-3000-99": [{ "type": "func", "func": thirdboss_start_event }],
	"h-3034-3000-70": [
		{ "type": "text", "sub_type": "message", "message": "70%", "message_RU": "70%" },
		{ "type": "func", "func": thirdboss_seventy_event }],
	//
	"dm-0-0-3034311": [{ "type": "func", "func": skilld_event.bind(null, 3034311) }], // 1 std
	"dm-0-0-3034312": [{ "type": "func", "func": skilld_event.bind(null, 3034312) }], // 0 rev
	"dm-0-0-3034302": [{ "type": "func", "func": skilld_event.bind(null, 3034302) }], // out
	"dm-0-0-3034303": [{ "type": "func", "func": skilld_event.bind(null, 3034303) }], // in
	"dm-0-0-3034304": [{ "type": "func", "func": skilld_event.bind(null, 3034304) }], // wave
	"qb-3034-3000-3034301": [{ "type": "func", "func": skilld_event.bind(null, 0) }], // out
	"qb-3034-3000-3034302": [{ "type": "func", "func": skilld_event.bind(null, 1) }], // in
	"qb-3034-3000-3034303": [{ "type": "func", "func": skilld_event.bind(null, 2) }], // wave
	// right safe S
	"s-3034-3000-116-0": [{ "type": "func", "func": skilld_event.bind(null, 1160) }],
	"s-3034-3000-116-1": [{ "type": "func", "func": skilld_event.bind(null, 1161) }],
	"s-3034-3000-116-2": [{ "type": "func", "func": skilld_event.bind(null, 1162) }],
	"s-3034-3000-116-3": [{ "type": "func", "func": skilld_event.bind(null, 1163) }],
	"s-3034-3000-119-0": [{ "type": "func", "func": skilld_event.bind(null, 1190) }],
	"s-3034-3000-119-1": [{ "type": "func", "func": skilld_event.bind(null, 1191) }],
	"s-3034-3000-119-2": [{ "type": "func", "func": skilld_event.bind(null, 1192) }],
	"s-3034-3000-119-3": [{ "type": "func", "func": skilld_event.bind(null, 1193) }],
	"s-3034-3000-223-1": [{ "type": "func", "func": skilld_event.bind(null, 2231) }],
	"s-3034-3000-222-0": [{ "type": "func", "func": skilld_event.bind(null, 2220) }],
	"s-3034-3000-222-2": [{ "type": "func", "func": skilld_event.bind(null, 2222) }],
	// left safe S
	"s-3034-3000-117-0": [{ "type": "func", "func": skilld_event.bind(null, 1170) }],
	"s-3034-3000-117-1": [{ "type": "func", "func": skilld_event.bind(null, 1171) }],
	"s-3034-3000-117-2": [{ "type": "func", "func": skilld_event.bind(null, 1172) }],
	"s-3034-3000-117-3": [{ "type": "func", "func": skilld_event.bind(null, 1173) }],
	"s-3034-3000-118-0": [{ "type": "func", "func": skilld_event.bind(null, 1180) }],
	"s-3034-3000-118-1": [{ "type": "func", "func": skilld_event.bind(null, 1181) }],
	"s-3034-3000-118-2": [{ "type": "func", "func": skilld_event.bind(null, 1182) }],
	"s-3034-3000-118-3": [{ "type": "func", "func": skilld_event.bind(null, 1182) }],
	"s-3034-3000-222-1": [{ "type": "func", "func": skilld_event.bind(null, 2221) }],
	"s-3034-3000-223-0": [{ "type": "func", "func": skilld_event.bind(null, 2230) }],
	"s-3034-3000-223-2": [{ "type": "func", "func": skilld_event.bind(null, 2232) }],
	//
	"s-3034-3000-125-0": [{ "type": "text", "sub_type": "message", "message": "Front", "message_RU": "Удар вперед" }],
	"s-3034-3000-126-0": [{ "type": "text", "sub_type": "message", "message": "Front | Back", "message_RU": "Удар вперед | Удар назад" }],
	"s-3034-3000-127-0": [{ "type": "text", "sub_type": "message", "message": "Back", "message_RU": "Удар назад" }],
	"s-3034-3000-128-0": [
		{ "type": "text", "sub_type": "message", "message": "Combo | Back Wave", "message_RU": "Комба | Конус назад" },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 180, 40, 120, 1200, 2000, 3000) },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 180, 40, 240, 1200, 2000, 3000) }],
	"s-3034-3000-129-0": [{ "type": "text", "class_position":"tank", "sub_type": "message", "message": "Dodge", "message_RU": "Эвейд" }],
	"s-3034-3000-305-0": [{ "type": "func", "func": SpawnCircle.bind(null, false, 912, 0, 0, 10, 300, 0, 6000) }], // Проверка
	"s-3034-3000-321-0": [
		{ "type": "text", "sub_type": "message", "message": "Shield!", "message_RU": "Щит!" },
		{ "type": "text", "sub_type": "message", "delay": 105000, "message": "Shield in 10 seconds!", "message_RU": "Через 10 сек. Щит!" }],
	"s-3034-3001-308-0": [
		{ "type": "text", "sub_type": "message", "message": "Bait!", "message_RU": "Байт!" },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 0, 300, 0, 2000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 90, 300, 0, 2000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 180, 300, 0, 2000) },
		{ "type": "func", "func": SpawnVector.bind(null, 912, 0, 0, 270, 300, 0, 2000) }],
	// Radar
	"qb-3034-3000-3034312": [{ "type": "text", "sub_type": "message", "message": "!!! Radar !!!", "message_RU": "!!! Радар !!!" }],
	"s-3034-3000-324-0": [
		{ "type": "text", "sub_type": "message", "message": "OUT", "message_RU": "ОТ НЕГО" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 912, 0, 0, 10, 250, 0, 3000) },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 912, 0, 0, 12, 200, 0, 3000) },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 912, 0, 0, 14, 150, 0, 3000) },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 912, 0, 0, 18, 100, 0, 3000) },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 912, 0, 0, 50, 50, 0, 3000) }],
	"s-3034-3000-325-0": [
		{ "type": "text", "sub_type": "message", "message": "IN", "message_RU": "К НЕМУ" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 300, 0, 3000) }
	]
};
