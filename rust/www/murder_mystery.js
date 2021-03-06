
export const murderMysteryRuleset = {
	"actors": [],
	"state": [],
	"rules": [
		{
			"name": "get_weapon",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "get weapon", "probability": 1, "predicates": [{ "signature": { "name": "has_weapon", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} acquired a weapon.", "sanity": -40, "fulfilment": 0, "social": 0, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": false }
			]
		},

		{
			"name": "lie_easy",
			"lhs": [
				{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false },
				{ "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false },
				{ "signature": { "name": "alive", "actors": [2] }, "keep": true, "permanent": false },
				{ "signature": { "name": "anger", "actors": [0, 1] }, "keep": true, "permanent": false },
				{ "signature": { "name": "disgust", "actors": [0, 1] }, "keep": true, "permanent": false },
				{ "signature": { "name": "trusting", "actors": [2] }, "keep": true, "permanent": false },
				{ "signature": { "name": "trusting", "actors": [2] }, "keep": true, "permanent": false },
				{ "signature": { "name": "trust", "actors": [2, 0] }, "keep": true, "permanent": false }],
			"rhs": [
				{
					"title": "success",
					"probability": 0.4,
					"predicates": [{ "signature": { "name": "disgust", "actors": [2, 1] }, "keep": false, "permanent": false }],
					"template": "{0} lied about {1} to {2}",
					"sanity": 0,
					"fulfilment": 0,
					"social": 30,
					"witness_probability": 0.5,
					"admit_probability": 0,
					"reset_rewards": false
				},

				{
					"title": "failure",
					"probability": 0.6,
					"predicates": [{ "signature": { "name": "disgust", "actors": [2, 0] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [2, 0] }, "keep": false, "permanent": false }],
					"template": "{0} failed to lie about {1} to {2}",
					"sanity": 0,
					"fulfilment": 0,
					"social": -40,
					"witness_probability": 0.5,
					"admit_probability": 0,
					"reset_rewards": false
				}]
		},

		{
			"name": "lie_difficult",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [2] }, "keep": true, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": true, "permanent": false }, { "signature": { "name": "disgust", "actors": [0, 1] }, "keep": true, "permanent": false }, { "signature": { "name": "suspicious", "actors": [2] }, "keep": true, "permanent": false }, { "signature": { "name": "suspicious", "actors": [2] }, "keep": true, "permanent": false }, { "signature": { "name": "trust", "actors": [2, 1] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "success", "probability": 0.2, "predicates": [{ "signature": { "name": "disgust", "actors": [2, 1] }, "keep": false, "permanent": false }], "template": "{0} lied about {1} to {2}", "sanity": 0, "fulfilment": 0, "social": 30, "witness_probability": 0.5, "admit_probability": 0, "reset_rewards": false },
				{ "title": "failure", "probability": 0.8, "predicates": [{ "signature": { "name": "disgust", "actors": [2, 0] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [2, 0] }, "keep": false, "permanent": false }], "template": "{0} failed to lie about {1} to {2}", "sanity": 0, "fulfilment": 0, "social": -40, "witness_probability": 0.5, "admit_probability": 0, "reset_rewards": false }
			]
		},

		{
			"name": "fight",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "fight", "probability": 1, "predicates": [{ "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }], "template": "{0} and {1} fought", "sanity": 0, "fulfilment": 0, "social": -11, "witness_probability": 0.5, "admit_probability": 0.5, "reset_rewards": false }
			]
		},

		{
			"name": "make_up",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }, { "signature": { "name": "trust", "actors": [0, 1] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "make up", "probability": 1, "predicates": [], "template": "{0} and {1} made up.", "sanity": 0, "fulfilment": 0, "social": 12, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": false }
			]
		},

		{
			"name": "seduce",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "attraction", "actors": [0, 1] }, "keep": true, "permanent": false }, { "signature": { "name": "attraction", "actors": [1, 0] }, "keep": true, "permanent": false }, { "signature": { "name": "not_related", "actors": [0, 1] }, "keep": true, "permanent": false }, { "signature": { "name": "not_related", "actors": [1, 0] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "seduce", "probability": 1, "predicates": [{ "signature": { "name": "lovers", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "lovers", "actors": [1, 0] }, "keep": false, "permanent": false }], "template": "{0} seduced {1}.", "sanity": 0, "fulfilment": 0, "social": 70, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": false }
			]
		},

		{
			"name": "get_married",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "trust", "actors": [0, 1] }, "keep": true, "permanent": false }, { "signature": { "name": "trust", "actors": [0, 1] }, "keep": true, "permanent": false }, { "signature": { "name": "trust", "actors": [1, 0] }, "keep": true, "permanent": false }, { "signature": { "name": "trust", "actors": [1, 0] }, "keep": true, "permanent": false }, { "signature": { "name": "single", "actors": [0] }, "keep": false, "permanent": false }, { "signature": { "name": "single", "actors": [1] }, "keep": false, "permanent": false }, { "signature": { "name": "not_related", "actors": [0, 1] }, "keep": true, "permanent": false }, { "signature": { "name": "not_related", "actors": [1, 0] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "success", "probability": 0.9, "predicates": [{ "signature": { "name": "married", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "married", "actors": [1, 0] }, "keep": false, "permanent": false }], "template": "{0} and {1} got married!", "sanity": 10, "fulfilment": 0, "social": 40, "witness_probability": 0.5, "admit_probability": 1.0, "reset_rewards": false },
				{ "title": "rejection", "probability": 0.1, "predicates": [{ "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }], "template": "{0} proposed to {1} but got rejected!", "sanity": -20, "fulfilment": 0, "social": -20, "witness_probability": 0.5, "admit_probability": 0.5, "reset_rewards": false }
			]
		},

		{
			"name": "get_divorced",
			"lhs": [
				{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false },
				{ "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false },
				{ "signature": { "name": "disgust", "actors": [1, 0] }, "keep": true, "permanent": false },
				{ "signature": { "name": "disgust", "actors": [1, 0] }, "keep": true, "permanent": false },
				{ "signature": { "name": "disgust", "actors": [1, 0] }, "keep": true, "permanent": false },
				{ "signature": { "name": "married", "actors": [0, 1] }, "keep": false, "permanent": false },
				{ "signature": { "name": "married", "actors": [1, 0] }, "keep": false, "permanent": false }],

			"rhs": [
				{ "title": "divorce", "probability": 1, "predicates": [{ "signature": { "name": "single", "actors": [0] }, "keep": false, "permanent": false }, { "signature": { "name": "single", "actors": [1] }, "keep": false, "permanent": false }], "template": "{0} and {1} got divorced.", "sanity": 40, "fulfilment": 0, "social": -20, "witness_probability": 0.5, "admit_probability": 1.0, "reset_rewards": false }
			]
		},

		{
			"name": "steal_N", "lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "neutral", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "spontaneous", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "confident", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "has_money", "actors": [1] }, "keep": false, "permanent": false }, { "signature": { "name": "disgust", "actors": [0, 1] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "caught", "probability": 0.3, "predicates": [{ "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }], "template": "{0} was caught stealing from {1}", "sanity": -10, "fulfilment": -60, "social": 0, "witness_probability": 0.5, "admit_probability": 0.25, "reset_rewards": false },
				{ "title": "success", "probability": 0.7, "predicates": [{ "signature": { "name": "has_money", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} stole from {1}", "sanity": -10, "fulfilment": 80, "social": 0, "witness_probability": 0.5, "admit_probability": 0.1, "reset_rewards": false }
			]
		},

		{
			"name": "steal_debt",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "has_money", "actors": [1] }, "keep": false, "permanent": false }, { "signature": { "name": "debt", "actors": [0] }, "keep": false, "permanent": false }],
			"rhs": [
				{ "title": "failure", "probability": 0.3, "predicates": [{ "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }], "template": "{0} was caught stealing from {1}", "sanity": -10, "fulfilment": -80, "social": 0, "witness_probability": 0.5, "admit_probability": 0.25, "reset_rewards": false },
				{ "title": "success", "probability": 0.7, "predicates": [{ "signature": { "name": "has_money", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} stole from {1}", "sanity": -10, "fulfilment": 120, "social": 0, "witness_probability": 0.5, "admit_probability": 0.1, "reset_rewards": false }
			]
		},

		{
			"name": "steal_E",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": true, "permanent": false }, { "signature": { "name": "evil", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "has_money", "actors": [1] }, "keep": false, "permanent": false }],
			"rhs": [
				{ "title": "failure", "probability": 0.3, "predicates": [{ "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [1, 0] }, "keep": false, "permanent": false }], "template": "{0} was caught stealing from {1}", "sanity": -5, "fulfilment": -20, "social": 0, "witness_probability": 0.5, "admit_probability": 0.25, "reset_rewards": false },
				{ "title": "success", "probability": 0.7, "predicates": [{ "signature": { "name": "has_money", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} stole from {1}", "sanity": -5, "fulfilment": 120, "social": 0, "witness_probability": 0.5, "admit_probability": 0.1, "reset_rewards": false }
			]
		},

		{
			"name": "murder_anger",
			"lhs": [{ "signature": { "name": "has_weapon", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": false, "permanent": false }],
			"rhs": [
				{ "title": "murder", "probability": 1, "predicates": [{ "signature": { "name": "dead", "actors": [1] }, "keep": false, "permanent": true }], "template": "In a fit of anger, {0} killed {1}.", "sanity": -80, "fulfilment": 300, "social": 0, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": false }
			]
		},

		{
			"name": "murder_very_anger",
			"lhs": [{ "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "anger", "actors": [0, 1] }, "keep": false, "permanent": false }, { "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": false, "permanent": false }],
			"rhs": [{ "title": "murder", "probability": 1, "predicates": [{ "signature": { "name": "dead", "actors": [1] }, "keep": false, "permanent": true }], "template": "{0} murdered {1} with bare hands", "sanity": -180, "fulfilment": 300, "social": 0, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": false }
			]
		},

		{
			"name": "murder_cheating",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [2] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": false, "permanent": false }, { "signature": { "name": "has_weapon", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "married", "actors": [0, 2] }, "keep": true, "permanent": false }, { "signature": { "name": "lovers", "actors": [1, 2] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "murder", "probability": 1, "predicates": [{ "signature": { "name": "dead", "actors": [1] }, "keep": false, "permanent": true }], "template": "{0} murdered {1}, the lover of [0:his|her] [2:husband|wife] {2}", "sanity": -120, "fulfilment": 300, "social": 0, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": false }
			]
		},

		{
			"name": "murder_money",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "alive", "actors": [1] }, "keep": false, "permanent": false }, { "signature": { "name": "has_weapon", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "spontaneous", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "confident", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "has_money", "actors": [1] }, "keep": false, "permanent": false }],
			"rhs": [
				{ "title": "murder", "probability": 1, "predicates": [{ "signature": { "name": "dead", "actors": [1] }, "keep": false, "permanent": true }, { "signature": { "name": "has_money", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} murdered {1} for their money", "sanity": -60, "fulfilment": 100, "social": 0, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": false }
			]
		},

//		{
//			"name": "suicide",
//			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": false, "permanent": false }, { "signature": { "name": "has_weapon", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "sadness", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "sadness", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "sadness", "actors": [0] }, "keep": true, "permanent": false }],
//			"rhs": [
//				{ "title": "commit suicide", "probability": 1, "predicates": [{ "signature": { "name": "dead", "actors": [0] }, "keep": false, "permanent": true }], "template": "{0} committed suicide", "sanity": 0, "fulfilment": 0, "social": 0, "witness_probability": 0.5, "admit_probability": 0.0, "reset_rewards": true }
//			]
//		},
//
		{
			"name": "grief",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "dead", "actors": [1] }, "keep": false, "permanent": false }, { "signature": { "name": "trust", "actors": [0, 1] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "grief", "probability": 1, "predicates": [{ "signature": { "name": "sadness", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} was sad about the loss of {1}.", "sanity": 20, "fulfilment": 0, "social": 0, "witness_probability": 0.5, "admit_probability": 1.0, "reset_rewards": false }
			]
		},

		{
			"name": "pay_debt",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }, { "signature": { "name": "has_money", "actors": [0] }, "keep": false, "permanent": false }, { "signature": { "name": "debt", "actors": [0] }, "keep": false, "permanent": false }],
			"rhs": [
				{ "title": "pay", "probability": 1, "predicates": [], "template": "{0} paid off [0:his|her] debt.", "sanity": 40, "fulfilment": 0, "social": 0, "witness_probability": 0.5, "admit_probability": 1.0, "reset_rewards": false }
			]
		},

		{
			"name": "gamble",
			"lhs": [{ "signature": { "name": "alive", "actors": [0] }, "keep": true, "permanent": false }],
			"rhs": [
				{ "title": "winning money", "probability": 0.1, "predicates": [{ "signature": { "name": "has_money", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} won big time in the casino!", "sanity": 0, "fulfilment": 100, "social": 0, "witness_probability": 0.5, "admit_probability": 0.95, "reset_rewards": false },
				{ "title": "losing money", "probability": 0.9, "predicates": [{ "signature": { "name": "debt", "actors": [0] }, "keep": false, "permanent": false }], "template": "{0} tried their luck in the casino, but to no avail", "sanity": 0, "fulfilment": -30, "social": 0, "witness_probability": 0.5, "admit_probability": 0.6, "reset_rewards": false }
			]
		}
	]
}
