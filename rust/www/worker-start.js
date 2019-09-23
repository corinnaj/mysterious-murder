import * as wasm from "mysterious-murder";

export function onmessage(event) {
	if (event.data.run)
		wasm.run_simulation(JSON.stringify(event.data.run), event.data.seed)
}
