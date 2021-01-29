interface LineTextElement extends HTMLElement
{
}

interface HorizontalAreaElement extends HTMLElement
{
	noscrollbar: boolean;
	goTo( target: number | HTMLElement ): void;
}

interface HorizontaItemElement extends HTMLElement
{
}

interface ModalDialogElement extends HTMLElement
{
	nobackclose: boolean;
	noclosebutton: boolean;
	show(): void;
	close(): void;
}

interface FiveStarElement extends HTMLElement
{
	readonly svg: SVGElement;
	light( piece: number ): void;
	unlight( piece: number ): void;
}

interface MissionItemElement extends HTMLElement
{
	title: string;
	max: number;
	value: number;
	readonly complete: boolean;
	addEventListener( type: 'change', listener: ( event: ChangeMissionEvent ) => any, options?: boolean | AddEventListenerOptions ): void;
}

interface ChangeMissionEvent extends CustomEvent
{
	detail: { value: number; };
}

interface AreaInfoElement extends HTMLElement
{
	onselectd?: () => void;
	no: number;
	title: string;
	addMission( mission: MissionItemElement ) : void;
	readonly complete: number;
}

interface ToggleButtonElement extends HTMLElement
{
	toggle(): ToggleButtonElement;
	checked: boolean;
}

interface TweetButtonElement extends HTMLElement
{
	text: string;
	url: string;
	hashtags(): string[];
	hashtags( ... values: string[] ): void;
	via: string;
	in_reply_to: string;
	related(): string[];
	related( user: string ): void;
	related( user1: string, user2: string ): void;
	//original_referer: string; -> disable
	//lang: string; -> default
}

interface SEA_AREA_DATA
{
	no: number;
	lv: number;
	title: string;
	missions: { no: number, max: number }[];
}
