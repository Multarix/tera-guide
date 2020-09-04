// Antaroth's Abyss
//
// made by Yuyuko
// updated by HSDN

const { SpawnMarker, SpawnVector, SpawnCircle } = require("../lib");

let player, entity, library, effect;

let counter = 0;
let timer;

function back_attack_NM(handlers, event, ent, dispatch){
	dispatch.clearTimeout(timer);
	counter++;
	if(counter >= 2){
		handlers['text']({
			"sub_type": "message",
			"message": "Back attack",
			"message_RU": "Задний"
		});
	}
	timer = dispatch.setTimeout(()=> {
		counter = 0;
	}, 3000);
}

module.exports = {
	load(dispatch){
		({ player, entity, library, effect } = dispatch.require.library);
	},

	// 1 BOSS
	"s-720-1000-117-0": [{ "type": "text", "sub_type": "message", "message": "Stay IN > Get OUT", "message_RU": "К нему > От него" }],
	"s-720-1000-116-0": [{ "type": "text", "sub_type": "message", "message": "Get OUT > Stay IN", "message_RU": "От него > К нему" }],
	"s-720-1000-109-0": [{ "type": "text", "sub_type": "message", "message": "Back attack", "message_RU": "Откид назад" }],
	"s-720-1000-300-0": [{ "type": "text", "sub_type": "message", "delay": 600, "message": "Dodge!", "message_RU": "Эвейд!" }],

	// 2 BOSS
	"s-720-2000-106-0": [{ "type": "text", "sub_type": "message", "message": "Spin attack", "message_RU": "Крутилка" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 320, 0, 3500) }],
	"s-720-2000-105-0": [{ "type": "text", "sub_type": "message", "message": "Back attack", "message_RU": "Удар назад" }],
	"s-720-2000-104-0": [{ "type": "text", "sub_type": "message", "message": "Random jump", "message_RU": "Прыжок (стан)" }],
	"s-720-2000-112-0": [{ "type": "text", "sub_type": "message", "message": "Right slash", "message_RU": "Правая полоса" }],
	"s-720-2000-111-0": [{ "type": "text", "sub_type": "message", "message": "Left slash", "message_RU": "Левая полоса" }],
	"s-720-2000-110-0": [{ "type": "text", "sub_type": "message", "message": "Stun attack", "message_RU": "Передний стан" }],
	"s-720-2000-119-0": [{ "type": "text", "sub_type": "message", "message": "Red: OUT safe", "message_RU": "Красный: Наружу сейф" }],
	"s-720-2000-220-0": [{ "type": "text", "sub_type": "message", "message": "Blue: IN safe", "message_RU": "Синий: Внутрь сейф" }],
	"s-720-2000-116-0": [{ "type": "text", "sub_type": "message", "message": "Circles", "message_RU": "Круги" }],

	// 3 BOSS
	"s-720-3000-315-0": [{ "type": "text", "sub_type": "message", "message": "Pushback", "message_RU": "Откид (кайа)" }],
	"s-720-3000-107-0": [{ "type": "text", "sub_type": "message", "message": "Random jump", "message_RU": "Прыжок (стан)" }],
	"s-720-3000-204-0": [{ "type": "text", "sub_type": "message", "message": "Energy beam", "message_RU": "Волна" }],
	// heart thrust+anticlockwise spin+right swipe
	"s-720-3000-109-0": [{ "type": "text", "class_position":"tank", "sub_type": "message", "message": "Right safe", "message_RU": "Вправо сейф >" },
		{ "type": "text", "class_position":"dps", "sub_type": "message", "message": "Left safe", "message_RU": "< Влево сейф" },
		{ "type": "text", "class_position":"heal", "sub_type": "message", "message": "Left safe", "message_RU": "< Влево сейф" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 90, -250, 0, 2500, true, null) },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 0, 0, 180, 500, 0, 2500) },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 0, 0, 0, 500, 0, 2500) }],
	// heart thrust+clockwise spin+left swipe
	"s-720-3000-111-0": [{ "type": "text", "class_position":"tank", "sub_type": "message", "message": "Left safe", "message_RU": "< Влево сейф" },
		{ "type": "text", "class_position":"dps", "sub_type": "message", "message": "Right safe", "message_RU": "Вправо сейф >" },
		{ "type": "text", "class_position":"heal", "sub_type": "message", "message": "Right safe", "message_RU": "Вправо сейф >" },
		{ "type": "func", "func": SpawnMarker.bind(null, false, 270, -250, 0, 2500, true, null) },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 0, 0, 180, 500, 0, 2500) },
		{ "type": "func", "func": SpawnVector.bind(null, 553, 0, 0, 0, 500, 0, 2500) }],
	"s-720-3000-113-0": [{ "type": "text", "sub_type": "message", "message": "Front | Back slam", "message_RU": "Передний | Задний" }],
	"s-720-3000-115-0": [{ "type": "text", "sub_type": "message", "message": "Spinning attack", "message_RU": "Круговая" }],
	"s-720-3000-104-0": [{ "type": "func", "func": back_attack_NM }],
	// "s-720-3000-202-0": [{"type": "text","sub_type": "message","message": "spin or front,back slam","message_RU": "Круговая | Задний"}],

	"s-720-3000-400-0": [{ "type": "text", "sub_type": "message", "message": "Clones: beam", "message_RU": "Копии: волны" }],
	"s-720-3000-401-0": [{ "type": "text", "sub_type": "message", "message": "Clones: spin", "message_RU": "Копии: круговые" }]
};
