// Red Refuge
//
// made by Multarix

const { SpawnPoint, SpawnVector, SpawnCircle } = require("../lib");

let player, entity, library, effect;
module.exports = {
	load(dispatch){
		({ player, entity, library, effect } = dispatch.require.library);
	},

	// Needs testing?

	// Kalavese (1st boss)
	"s-739-1000-105-0": [{ "type": "text", "sub_type": "message", "message": "Turn & Breath", "message_RU": "Поворот и дыхание" }],
	"s-739-1000-308-0": [{ "type": "text", "sub_type": "message", "message": "In then Out", "message_RU": "В то время в" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 300, 0, 7500) }],
	"s-739-1000-308-1": [{ "type": "text", "sub_type": "message", "message": "Out", "message_RU": "Вне" }],
	"s-739-1000-112-0": [{ "type": "text", "sub_type": "message", "message": "Back Spray", "message_RU": "Назад пердеть" }],
	"s-739-1000-107-0": [{ "type": "text", "sub_type": "message", "message": "Jump", "message_RU": "Прыгать" }],
	"s-739-1000-306-0": [{ "type": "text", "sub_type": "message", "message": "Out then In", "message_RU": "Из, затем В" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 300, 0, 7500) }],
	"s-739-1000-1306-1": [{ "type": "text", "sub_type": "message", "message": "In", "message_RU": "В" }],

	// Thormentum (2nd Boss)
	"s-739-2000-105-0": [{ "type": "text", "sub_type": "message", "message": "360", "message_RU": "360" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 300, 0, 2500) },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 510, 0, 2500) }],
	"s-739-2000-113-0": [{ "type": "text", "sub_type": "message", "message": "Stun", "message_RU": "Оглушить" }],
	"s-739-2000-108-0": [{ "type": "text", "sub_type": "message", "message": "Clense", "message_RU": "Очистить", "class_position": "heal" }],
	"s-739-2000-115-0": [{ "type": "text", "sub_type": "message", "message": "Whirlwind", "message_RU": "Вихрь" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 360, 0, 6500) }],
	"s-739-2000-119-0": [{ "type": "text", "sub_type": "message", "message": "Front", "message_RU": "Фронт" }],
	"s-739-2000-120-0": [{ "type": "text", "sub_type": "message", "message": "Back", "message_RU": "Назад" }],
	"s-739-2000-303-0": [{ "type": "text", "sub_type": "message", "message": "Whip", "message_RU": "Кнут" }],

	// Argog (3rd boss)
	"h-739-3001-30": [{ "type": "text", "sub_type": "message", "message": "Reveal Soon", "message_RU": "Скоро появится" }],
	"s-739-3000-201-0": [{ "type": "text", "sub_type": "message", "delay": 3650, "message": 'Dodge!', "message_RU": "Уклоняйся" }],
	"s-739-3000-107-0": [{ "type": "text", "sub_type": "message", "message": "Many Hits", "message_RU": "Кнут" }],
	"s-739-3000-115-0": [{ "type": "text", "sub_type": "message", "message": 'Incoming Stun', "message_RU": "Рёв (Эвейд)!!!" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 630, 0, 4000) },
		{ "type": "text", "sub_type": "message", "delay": 1800, "message": 'Dodge!', "message_RU": "Уклоняйся" }],
	"s-739-3000-118-0": [{ "type": "text", "sub_type": "message", "message": "Spin", "message_RU": "Кнут" }],
	// Revealed Argog
	"s-739-3000-167-0": [{ "type": "text", "sub_type": "message", "message": "Many Hits", "message_RU": "Кнут" }],
	"s-739-3000-175-0": [{ "type": "text", "sub_type": "message", "message": 'Incoming Stun', "message_RU": "Рёв (Эвейд)!!!" },
		{ "type": "func", "func": SpawnCircle.bind(null, false, 553, 0, 0, 10, 630, 0, 4000) },
		{ "type": "text", "sub_type": "message", "delay": 1800, "message": 'Dodge!', "message_RU": "Уклоняйся" }],
	"s-739-3000-178-0": [{ "type": "text", "sub_type": "message", "message": "Spin", "message_RU": "Кнут" }]
};
