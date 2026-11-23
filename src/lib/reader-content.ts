import type { Book } from "@/lib/types";

const PARAGRAPHS = [
	"The morning arrived quietly, the way important days often do. Light slipped through the curtains and settled on the floor in long, patient rectangles, as if it had all the time in the world.",
	"There are moments that divide a life into before and after. Most of them seem ordinary while they are happening. You only recognize them later, looking back, when the road behind you has already narrowed to a single line.",
	"She had learned to read the silences between people. A pause could be a question, a promise, or a door closing. Today, the silence felt like all three at once.",
	"Outside, the city carried on with its usual arithmetic of arrivals and departures. Trains sighed into stations. Strangers traded glances and small kindnesses. Somewhere a kettle whistled, and someone laughed without knowing why.",
	"He opened the notebook to the first clean page and wrote a single sentence. It was not a good sentence, but it was true, and truth, he had discovered, was a place to begin.",
	"Memory is a strange librarian. It shelves some things at eye level and hides others behind the heaviest volumes, waiting for a careless hand to pull them free.",
	"The wind changed direction just before dusk. It came off the water carrying salt and the smell of rain, and for a moment the whole town seemed to lean toward it, listening.",
	"You cannot hurry a story any more than you can hurry a season. Both require patience, attention, and the willingness to be surprised.",
	"Every choice closes a door and opens a window. The trick is not to grieve the door forever, but to notice the light coming through the glass.",
	"They walked without speaking, their footsteps finding a rhythm that felt older than either of them. There are friendships that begin in conversation and others that begin in shared quiet.",
	"It was the kind of afternoon that made you believe in second chances. Not because anything had changed, but because the light was generous and the air was soft and the world, for once, seemed willing to wait.",
	"By the time the stars appeared, the decision had made itself. It stood there in the open, plain as a doorway, and all that remained was the courage to walk through.",
	"A book, she thought, is a machine for borrowing someone else's eyes. You climb inside, look around, and come back changed in ways you cannot easily explain.",
	"The road curved along the ridge, and with every turn the valley revealed another version of itself. There was always more, if you kept going. That was either the terror of it or the promise.",
	"Some words are seeds. You plant them without knowing what they will become, and years later you find a tree where you expected only grass.",
	"He learned that patience was not the absence of desire but the refusal to let desire run the whole household. It was a discipline, like any other, and it could be practiced.",
];

export const chapterTitle = (page: number) => `Chapter ${Math.max(1, Math.ceil(page / 10))}`;

export function getPageContent(book: Book, page: number): string[] {
	const seed = page * 5 + book.title.length;
	const start = seed % PARAGRAPHS.length;

	const paragraphs = [
		PARAGRAPHS[start],
		PARAGRAPHS[(start + 4) % PARAGRAPHS.length],
		PARAGRAPHS[(start + 9) % PARAGRAPHS.length],
		PARAGRAPHS[(start + 13) % PARAGRAPHS.length],
	];

	if (page === 1) {
		return [book.description, ...paragraphs.slice(0, 3)];
	}

	return paragraphs;
}
