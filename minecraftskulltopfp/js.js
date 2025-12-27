/*
 * to create a mathematically correct (non-anti-aliased) minecraft skull to an image,
 * we need to perform a top-down orthographic projection of the skull:
 * 
 * some numbers to start with: 
 * 1. the base skull is 8x8, where each pixel is 8 units wide
 * 2. the layer textures are also 8x8, but pixels are 9 units wide
 * 3. the layer textures rendered 2 units away from the base layer                                                                  (this is just a fun fact tho... it doesnt matter because we are only rendering the x-z plane, and the y does not affect the rendering)
 * 
 * we need to figure out the dimension of the the resulting grid
 *  base pixel boundaries at 0, 8, 16, ... 72
 * layer pixel boundaries at 0, 9, 18, ... 72
 * (wow this is actually just finding the lcm...)
 * anyways that means the resulting grid can be any integer multiples of 72x72
 * 
 * now we can render the image: 
 * 1. render the back layer, starting from [0 0] to [71 71] 
 * 2. render the base, starting from [(72 - 64) / 2, (72 - 64) / 2] to [72 - (72 - 64) / 2, 72 - (72 - 64) / 2]
 * 3. render the front layer, starting from [0 0] to [71 71]
 *
 * this is naive but thats the idea
 * 
 * 
 * note: the sides, top and bottom layers have zero width / height so they do not get rendered!!
 */


// shud really use separate files but 
// today i dont feel like doing anythinggg~ 🎵

const SKIN_RESOLUTION = 64;
const RESULT_RESOLUTION = 72;
const TEXTURE_FACE_LENGTH = 8;

const TEXTURE_EXTRACT_OFFSETS = {
	LAYER_FRONT : [40, 8],
	LAYER_BACK  : [56, 8],
	BASE : [8, 8],
};

const TEXTURE_SCALE_FACTOR = {
	LAYER_FRONT : 9,
	LAYER_BACK  : 9,
	BASE : 8,
};

const TEXTURE_DRAW_OFFSETS = {
	LAYER_FRONT : [0, 0],
	LAYER_BACK  : [0, 0],
	BASE : [(72 - 64) / 2, (72 - 64) / 2],
};

const LAYERS = [
	"LAYER_BACK",
	"BASE",
	"LAYER_FRONT",
];


const img_input = document.querySelector("#img_input");
const canvas_result = document.querySelector("#canvas_result");

canvas_result.width  = RESULT_RESOLUTION;
canvas_result.height = RESULT_RESOLUTION;

{
	const ctx_result = canvas_result.getContext("2d");
	ctx_result.imageSmoothingEnabled = false;

	const draw_layer = (layer) => {
		const extract_offsets = TEXTURE_EXTRACT_OFFSETS[layer];
		const draw_offsets = TEXTURE_DRAW_OFFSETS[layer];
		const draw_size = TEXTURE_FACE_LENGTH * TEXTURE_SCALE_FACTOR[layer];

		ctx_result.drawImage(
			img_input,
			extract_offsets[0], extract_offsets[1],
			TEXTURE_FACE_LENGTH, TEXTURE_FACE_LENGTH,
			draw_offsets[0], draw_offsets[1],
			draw_size, draw_size,
		);
	};

	img_input.onload = () => {
		if (img_input.naturalWidth != SKIN_RESOLUTION || img_input.naturalHeight != SKIN_RESOLUTION)
			return alert("invalid resolution :(\nit should be 64x64");

		ctx_result.clearRect(0, 0, canvas_result.width, canvas_result.height);
		for (const l of LAYERS) draw_layer(l);
	};
}


let process_input; {
	const reader = new FileReader();
	process_input = (file) => reader.readAsDataURL(file);
	reader.onload = (e) => { img_input.src = e.target.result; };
};
































// index.html skript
document.querySelector("#heading_upload").addEventListener("click", () => {
	// i love the garbage collector 🎵
	const input = document.createElement("input");
	input.type = "file";
	input.accept = "image/*";
	input.addEventListener("change", (e) => {
		const file = e.target.files[0];
		file && process_input(file);
	});
	input.click();
});


document.querySelector("#heading_download").addEventListener("click", () => {
	Object.assign(document.createElement("a"), {
		download: "pfp.png",
		href: canvas_result.toDataURL()
	}).click();
});
