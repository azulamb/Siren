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

interface SEA_AREA_DATA
{
	no: number;
	lv: number;
	title: string;
	missions: { no: number, max: number }[];
}
