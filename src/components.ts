/// <reference path="./libs.ts" />

declare class ResizeObserver
{
	constructor( onresize: () => void );
	observe( target: HTMLElement ): void;
}

window.addEventListener('DOMContentLoaded', ( event ) =>
{
	customElements.define( 'line-text', class extends HTMLElement implements LineTextElement
	{
		private str: HTMLElement;
		private svg: SVGElement;
		private text: SVGTextElement;

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: block; --color: black; --size: 1em; }',
				':host > div { position: relative; overflow: hidden; display: flex; align-items: center; min-height: 100%; width: 100%; height: 100%; }',
				':host > div > svg { max-width: 100%; display: block; }',
				':host > div > span { visibility: hidden; position: absolute; white-space: nowrap; font-size: var( --size ); }',
			].join( '' );

			this.str = document.createElement( 'span' );
			this.str.appendChild( document.createElement( 'slot' ) );

			this.text = document.createElementNS( 'http://www.w3.org/2000/svg', 'text' );
			this.text.setAttribute( 'x', '0' );
			this.text.setAttribute('y', '50%');
			this.text.setAttribute('dominant-baseline', 'middle');
			this.text.setAttribute( 'fill', 'var( --color )' );
			this.text.setAttribute( 'font-size', 'var( --size )' );
			this.svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			this.svg.setAttributeNS( null, 'preserveAspectRatio', 'none' );
			this.svg.appendChild( this.text );

			const contents = document.createElement( 'div' );
			contents.appendChild( this.str );
			contents.appendChild( this.svg );

			shadow.appendChild( style );
			shadow.appendChild( contents );

			const observer = new MutationObserver( ( records ) => { this.update(); } );
			observer.observe( this, { characterData: true, childList: true } );

			this.update();
		}

		private update()
		{
			this.text.textContent = this.textContent;

			const width = this.str.offsetWidth;
			const height = this.str.offsetHeight;

			this.svg.setAttributeNS( null, 'width', width + 'px' );
			this.svg.setAttributeNS( null, 'height', height + 'px' );
			this.svg.setAttributeNS( null, 'viewBox', '0 0 ' + width + ' ' + height );
		}

		static get observedAttributes() { return [ 'style' ]; }

		public attributeChangedCallback( attrName: string, oldVal: any , newVal: any )
		{
			if ( oldVal === newVal ) { return; }
			this.update();
		}
	} );

	customElements.define( 'horizontal-area', class extends HTMLElement implements HorizontalAreaElement
	{
		private scrollbar: number;
		private wrapper: HTMLElement;
		private contents: HTMLElement;

		constructor()
		{
			super();

			// Get scrollbar size.
			this.scrollbar = ( () =>
			{
				const element = document.createElement('div');
				element.style.visibility = 'hidden';
				element.style.overflow = 'scroll';
				document.body.appendChild( element );
				const scrollbarWidth = element.offsetWidth - element.clientWidth;
				document.body.removeChild(element);
				return scrollbarWidth;
			} )();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement('style');
			style.innerHTML =
			[
				':host { --item-width: ""; --default-direction: ltr; --reverse-direction: rtl; display: block; }',
				':host > div { width: 100%; height: 100%; overflow: hidden; }',
				':host > div > div { overflow-y: scroll; overflow-x: hidden; scroll-behavior: smooth; transform: translateX( -100% ) rotate( -90deg ); transform-origin: right top; }',
				':host( :not( [ noscrollbar ] ) ) > div > div { direction: var( --reverse-direction ); }',
				'::slotted( * ) { direction: var( --default-direction ); }',
				':host( [ noscrollbar ] ) > div > div { -ms-overflow-style: none; scrollbar-width: none; }',
				':host( [ noscrollbar ] ) > div > div::-webkit-scrollbar { display:none; }',
			].join( '' );

			this.wrapper = document.createElement( 'div' );
			this.wrapper.appendChild( document.createElement( 'slot' ) );

			this.contents = document.createElement( 'div' );
			this.contents.appendChild( this.wrapper );

			shadow.appendChild( style );
			shadow.appendChild( this.contents );

			const resizeObserver = new ResizeObserver( () =>
			{
				this.update();
			} );
			resizeObserver.observe( this.contents );
		}

		private update()
		{
			this.wrapper.style.width = `${ Math.ceil( this.contents.clientHeight ) }px`;
			this.wrapper.style.height = `${ Math.ceil( this.contents.clientWidth ) }px`;
			const s = this.noscrollbar ? 0 : this.scrollbar;
			this.style.setProperty( '--item-height', `${ Math.ceil( this.contents.clientHeight - s ) }px` );
		}

		static get observedAttributes() { return [ 'noscrollbar' ]; }

		public attributeChangedCallback( name: string, oldValue: any, newValue: any )
		{
			if ( ( oldValue !== null ) === ( newValue !== null ) ) { return; }
			this.noscrollbar = newValue !== null;
		}

		get noscrollbar() { return this.hasAttribute( 'noscrollbar' ); }

		set noscrollbar( value )
		{
			value ? this.setAttribute( 'noscrollbar', 'noscrollbar' ) : this.removeAttribute( 'noscrollbar' );
			this.update();
		}

		private searchTarget( target: number | HTMLElement ): HTMLElement | null
		{
			if ( this.children.length < 1 ) { return null; }

			if ( typeof target !== 'number' )
			{
				let index = -1;
				for ( let i = this.children.length - 1 ; 0 <= i ; --i )
				{
					if ( this.children[ i ] === target ) { index = i; break; }
				}

				if ( index < 0 ) { return null; }

				return target;
			}

			if ( target < 0 ) { return <HTMLElement>this.children[ 0 ]; }

			if ( this.children.length <= target )
			{
				return <HTMLElement>this.children[ this.children.length - 1 ];
			}

			return <HTMLElement>this.children[ target ]; 
		}

		public goTo( target: number | HTMLElement )
		{
			const element = this.searchTarget( target );

			if ( !element ) { return; }

			for ( let i = this.children.length - 1 ; 0 <= i ; --i )
			{
				this.children[ i ].removeAttribute( 'selected' );
			}

			element.setAttribute( 'selected', 'selected' );
			//this.wrapper.scrollTo( { top: element.offsetTop, left: 0, behavior: 'smooth' } );
			element.scrollIntoView( { behavior: 'smooth', block: 'center' } );
		}
	} );

	customElements.define( 'horizontal-item', class extends HTMLElement implements HorizontaItemElement
	{
		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: block; width: 100%; --width: var( --item-height ); height: var( --item-width ); overflow: hidden; }',
				':host > div { height: var( --width ); transform: rotate( 90deg ); }',
			].join( '' );

			const contents = document.createElement( 'div' );
			contents.appendChild( document.createElement( 'slot' ) );

			shadow.appendChild( style );
			shadow.appendChild( contents );
		}
	} );

	customElements.define( 'modal-dialog', class extends HTMLElement implements ModalDialogElement
	{
		public onclose: () => boolean;
		private bodyOverflow = '';

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { --dialog-back: #e3e4f1; --close-symbol: "×"; --close-back: var( --dialog-back ); --button-size: 2em; --offset-button: calc( var( --button-size ) * -0.5 ); --max-width: 100%; --max-height: 100%; --padding: 2em; z-index: 10000; background:rgba( 0, 0, 0, 0.8 ); position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; opacity: 1; box-sizing: border-box; padding: var( --padding ); display: block; }',
				':host( :not( [ show ] ) ) { opacity: 0; pointer-events: none; }',
				':host > div { display: grid; justify-content: center; align-items: center; grid-template-columns: 100%; grid-template-rows: 100%; width: 100%; height: 100%; }',
				':host > div > div { max-width: var( --max-width ); max-height: var( --max-height ); position: relative; }',
				':host > div > div > div { border-radius: 0.2em; background: var( --dialog-back ); max-height: calc( 100vh - var( --padding ) * 2 ); padding: 0.5em; box-sizing: border-box; overflow: auto; }',
				':host button { position: absolute; display: block; right: var( --offset-button ); top: var( --offset-button ); border-radius: 50%; width: var( --button-size ); height: var( --button-size ); border: 0; outline: 0; box-sizing: border-box; text-align: center; padding: 0; cursor: pointer; font-weight: bold; font-family: monospace; }',
				':host button::before { content:var( --close-symbol ); display: inline; }',
				':host( [ nobutton ] ) > div > button { display: none; }',
			].join( '' );

			const dialogcontents = document.createElement( 'div' );
			dialogcontents.appendChild( document.createElement( 'slot' ) );

			const close = document.createElement( 'button' );

			const dialog = document.createElement( 'div' );
			dialog.appendChild( dialogcontents );
			dialog.appendChild( close );

			const contents = document.createElement( 'div' );
			contents.appendChild( dialog );

			shadow.appendChild( style );
			shadow.appendChild( contents );

			( ( stopevent ) =>
			{
				this.addEventListener( 'wheel', stopevent );
				this.addEventListener( 'contextmenu', stopevent );
			} )( ( event: MouseEvent ) => { event.stopPropagation(); event.preventDefault(); } );

			( ( stopevent ) =>
			{
				dialogcontents.addEventListener( 'wheel', stopevent );
				dialogcontents.addEventListener( 'contextmenu', stopevent );
				dialogcontents.addEventListener( 'click', stopevent );
			} )( ( event: MouseEvent ) => { event.stopPropagation(); } );

			( ( onClose ) =>
			{
				this.addEventListener( 'click', onClose );
				close.addEventListener( 'click', onClose );
			} ) ( ( event: MouseEvent ) =>
			{
				event.stopPropagation();
				if ( event.target === this && this.nobackclose ) { return; }
				if ( this.onclose && !this.onclose() ) { return; }
				this.close();
			} );

			this.bodyOverflow = document.body.style.overflowY;

			if ( this.hasAttribute( 'show' ) )
			{
				this.show();
			}
		}

		get nobackclose() { return this.hasAttribute( 'nobackclose' ); }
		set nobackclose( value )
		{
			value ? this.setAttribute( 'nobackclose', 'nobackclose' ) : this.removeAttribute( 'nobackclose' );
		}

		get noclosebutton() { return this.hasAttribute( 'noclosebutton' ); }
		set noclosebutton( value )
		{
			value ? this.setAttribute( 'noclosebutton', 'noclosebutton' ) : this.removeAttribute( 'nobackclose' );
		}

		public show()
		{
			this.setAttribute( 'show', '' );
			this.bodyOverflow = document.body.style.overflowY;
			document.body.style.overflowY = 'hidden';
			return this;
		}

		public close()
		{
			this.removeAttribute( 'show' );
			document.body.style.overflowY = this.bodyOverflow;
			return this;
		}
	} );

	customElements.define( 'five-star', class extends HTMLElement implements FiveStarElement
	{
		private piece: SVGPathElement[];
		private star: SVGSVGElement;

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { display: block; --size: 1rem; pointer-events: none;  }',
				':host > div { width: var( --size ); height: var( --size ); transform: translate(-50%, -50%); }',
				':host > div > svg { display: block; width: 100%; height: 100%; }',
				':host > div > svg > path { fill: transparent; }',
				':host > div > svg > path.b { fill: #222235; stroke: #222235; }',
				':host > div > svg > path.f { stroke: black; }',
				':host > div > svg > path.l { fill: #fddf34; }',
			].join( '' );

			const back = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
			back.classList.add( 'b' );
			back.setAttributeNS( null, 'd', 'm15 1.8 4.6554 6.7926 7.8987 2.3284-5.0217 6.5265 0.2264 8.2317-7.7589-2.759-7.7589 2.759 0.2264-8.2317-5.0217-6.5265 7.8987-2.3284z' );
			back.setAttributeNS( null, 'stroke-linecap', 'round' );
			back.setAttributeNS( null, 'stroke-linejoin', 'round' );
			back.setAttributeNS( null, 'stroke-width', '3' );

			this.piece = [];

			for ( let i = 0 ; i < 5 ; ++i )
			{
				this.piece.push( document.createElementNS( 'http://www.w3.org/2000/svg', 'path' ) );
				this.piece[ i ].classList.add( `p${ i }` );
			}

			this.piece[ 0 ].setAttributeNS( null, 'd', 'M 15,15 10.3446,8.5926 15,1.8 19.6554,8.5926 Z');
			this.piece[ 1 ].setAttributeNS( null, 'd', 'm15 15 4.6554-6.4074 7.8987 2.3284-5.0217 6.5265z');
			this.piece[ 2 ].setAttributeNS( null, 'd', 'm15 15 7.5324 2.4474 0.2264 8.2317-7.7589-2.759z');
			this.piece[ 3 ].setAttributeNS( null, 'd', 'm15 15v7.92l-7.7589 2.759 0.2264-8.2317z');
			this.piece[ 4 ].setAttributeNS( null, 'd', 'm15 15-7.5324 2.4474-5.0217-6.5265 7.8987-2.3284z');

			const front = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
			front.classList.add( 'f' );
			front.setAttributeNS( null, 'd', <string>back.getAttribute( 'd' ) );
			front.setAttributeNS( null, 'stroke-linecap', 'round' );
			front.setAttributeNS( null, 'stroke-linejoin', 'round' );
			front.setAttributeNS( null, 'stroke-width', '3' );

			this.star = ( () =>
			{
				const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
				svg.setAttributeNS( null, 'width', '30' );
				svg.setAttributeNS( null, 'height', '30' );
				svg.setAttributeNS( null, 'viewBox', '0 0 30 30' );

				svg.appendChild( back );
				svg.appendChild( this.piece[ 0 ] );
				svg.appendChild( this.piece[ 1 ] );
				svg.appendChild( this.piece[ 2 ] );
				svg.appendChild( this.piece[ 3 ] );
				svg.appendChild( this.piece[ 4 ] );
				svg.appendChild( front );
				return svg;
			} )();

			const contents = document.createElement( 'div' );
			contents.appendChild( this.star );

			shadow.appendChild( style );
			shadow.appendChild( contents );

			if ( this.hasAttribute( 'light' ) )
			{
				this.light( 0 );
				this.light( 1 );
				this.light( 2 );
				this.light( 3 );
				this.light( 4 );
			}
		}

		get svg()
		{
			const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
			svg.setAttributeNS( null, 'width', '30' );
			svg.setAttributeNS( null, 'height', '30' );
			svg.setAttributeNS( null, 'viewBox', '0 0 30 30' );
			svg.innerHTML = this.star.innerHTML;

			for ( let i = this.star.children.length - 1 ; 0 <= i ; --i )
			{
				const p = this.star.children[ i ];
				if ( p.tagName !== 'path' ) { continue; }
				const style = getComputedStyle( p, '' );
				const fill = style.getPropertyValue( 'fill' );
				if ( fill )
				{
					(<SVGPathElement>svg.children[ i ]).style.fill = fill;
				}
				const stroke = style.getPropertyValue( 'stroke' );
				if ( stroke )
				{
					(<SVGPathElement>svg.children[ i ]).style.stroke = stroke;
				}
			}

			return svg;
		}

		light( piece: number )
		{
			const p = this.piece[ piece ];
			if ( !p ) { return; }
			p.classList.add( 'l' );
		}

		unlight( piece: number )
		{
			const p = this.piece[ piece ];
			if ( !p ) { return; }
			p.classList.remove( 'l' );
		}
	} );

	customElements.define( 'mission-item', class extends HTMLElement implements MissionItemElement
	{
		private timer: number;
		private mission: LineTextElement;
		private current: HTMLInputElement;
		private total: HTMLElement;
		private star: HTMLElement;

		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { --front-color: var( --front ); --hilight: var( --front2 ); display: block; width: 100%; height: 1rem; line-height: 1rem; font-size: 0.8rem; }',
				':host > div { width: 100%; height: 100%; display: grid; grid-template-columns: 1fr 3em 2.5em 1em; grid-template-rows: 1fr; padding-left: 0.5em; position: relative; box-sizing: border-box; background: linear-gradient(90deg, #1c1c38, #32505f); }',
				':host > div::before { content: ""; display: block; position: absolute; left: 0; top: 0; bottom: 0; width: 0.2em; height: 80%; margin: auto; background: var( --hilight ); }',
				':host input { color: var( --front-color ); border: 0; outline: 0; background: transparent; text-align: right; font-size: 1em; direction: rtl; }',
				':host line-text { width: 100%; height: 100%; --color: var( --front-color ); }',
				':host( [ disable ] ) { pointer-events: none; opacity: 0.5; }',
				':host( [ max="0" ] ) > div { background: #32505f; }',
				':host div > svg { display: block; width: 100%; height: 100%; }',
				':host div > svg > path { fill: #222235; stroke: rgba( 65, 70, 93, 0.6 ); }',
				':host div.complete > svg > path { fill: #fddf34; stroke: rgba( 125, 79, 0, 0.6 ); }',
			].join( '' );

			this.mission = CreateLineText( this.title );

			this.current = document.createElement( 'input' );
			this.current.type = 'number';
			this.current.min = '0';
			this.current.max = '1';

			if ( this.hasAttribute( 'max' ) )
			{
				const max = parseInt( <string>this.getAttribute( 'max' ) ) || 0;
				if ( 1 < max )
				{
					this.current.max = max + '';
				}
			}

			this.current.value = '0';
			if ( this.hasAttribute( 'value' ) )
			{
				const value = parseInt( <string>this.getAttribute( 'value' ) ) || 0;
				if ( 0 < value && value <= parseInt( this.current.max ) )
				{
					this.current.value = value + '';
				}
			}
			this.current.addEventListener( 'change', ( event ) =>
			{
				this.setAttribute( 'value', this.current.value + '' );
				this.onUpdate();
			} );

			this.total = document.createElement( 'div' );
			this.total.textContent = '/' + this.current.max;

			this.star = document.createElement( 'div' );
			this.star.appendChild( ( () =>
			{
				const path = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );
				path.setAttributeNS( null, 'd', 'm500 60 155.18 226.42 263.29 77.613-167.39 217.55 7.5466 274.39-258.63-91.967-258.63 91.967 7.5466-274.39-167.39-217.55 263.29-77.613z');
				path.setAttributeNS( null, 'stroke-linecap', 'round' );
				path.setAttributeNS( null, 'stroke-linejoin', 'round' );
				path.setAttributeNS( null, 'stroke-width', '100' );

				const svg = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
				svg.setAttributeNS( null, 'width', '1000' );
				svg.setAttributeNS( null, 'height', '1000' );
				svg.setAttributeNS( null, 'viewBox', '0 0 1000 1000' );
				svg.appendChild( path );

				return svg;
			} )() );

			const contents = document.createElement( 'div' );
			contents.appendChild( this.mission );
			contents.appendChild( this.current );
			contents.appendChild( this.total );
			contents.appendChild( this.star );

			shadow.appendChild( style );
			shadow.appendChild( contents );
		}

		static get observedAttributes() { return [ 'title', 'max', 'value' ]; }

		attributeChangedCallback( name: string, oldValue: any, newValue: any )
		{
			if ( oldValue === newValue ) { return; }

			if ( name === 'title' )
			{
				this.title = newValue || '';
				return;
			}

			const value = parseInt( newValue );

			if ( name === 'value' )
			{
				if ( this.value === value ) { return; }
				if ( value < 0 )
				{
					this.value = 0;
				} else if ( this.max < value )
				{
					this.value = this.max;
				}
				this.value = value;
			} else if ( name === 'max' )
			{
				if ( this.max === value || value < 1 ) { return; }
				this.max = value;
				if ( value < this.value ) { this.value = value; }
			}
		}

		get title() { return this.getAttribute( 'title' ) || ''; }
		set title( value )
		{
			const setValue = value || '';
			this.setAttribute( 'title', setValue );
			this.mission.textContent = setValue;
		}

		get max() { return parseInt( this.current.max ); }
		set max( value )
		{
			if ( typeof( value ) !== 'number' || value < 0 ) { return; }
			const strValue = Math.floor( value ) + '';
			this.current.max = strValue;
			this.total.textContent = '/' + strValue;
			this.setAttribute( 'max', strValue );
		}

		get value() { return parseInt( this.current.value ); }
		set value( value )
		{
			if ( typeof( value ) !== 'number' ) { return; }
			const strValue = Math.floor( value ) + '';
			this.current.value = strValue;
			this.setAttribute( 'value', strValue );
			this.onUpdate();
		}

		get complete() { return 0 < this.max && this.max <= this.value; }

		onUpdate()
		{
			if ( this.timer ) { clearTimeout( this.timer ); }
			this.timer = setTimeout( () =>
			{
				this.star.classList[ this.complete ? 'add' : 'remove' ]( 'complete' );
				this.dispatchEvent( new CustomEvent( 'change', { detail: { value: this.value, max: this.max } } ) );
				this.timer = 0;
			}, 50 );
		}
	} );

	customElements.define( 'area-info', class extends HTMLElement implements AreaInfoElement
	{
		private noArea: LineTextElement;
		private titleText: LineTextElement;
		private missions: HTMLElement;
		public onselectd?: () => void;

		constructor()
		{
			super();

			const shadow = this.attachShadow({ mode: 'open' });
			const style = document.createElement('style');
			style.innerHTML =
			[
				':host { --front-color: var( --front ); --back-selected: var( --back2 ) display: block; width: var(--item-width); height: 100%; --header-height: 1.5rem; --selected-back: transparent; }',
				':host-context( [ data-area="selected" ] ) { --selected-back: var( --back-selected ); }',
				':host > div { color: var( --front-color ); overflow: hidden; width: 100%; height: 100%; display: grid; grid-template-columns: 1fr; grid-template-rows: var( --header-height ) 1fr; box-sizing: border-box; padding: 0 0.1rem; background: var( --selected-back ); }',
				':host > div > h3 { display: grid; grid-template-columns: 1.5rem 1fr; margin: 0; width: 100%; height: 100%; font-size: 1em; line-height: var( --header-height ); background: linear-gradient(90deg, #0c719c, #79b2ce); cursor: pointer; }',
				':host > div > h3 > line-text { --color: var( --front-color ); display: inline; }',
				':host > div > h3 > line-text:first-child { opacity: 0.5; }',
				':host > div > h3 > line-text:last-child { --size: 0.8em; }',
				':host > div > div > mission-item { margin-top: 0.3em; }',
				':host input{ color: var( --front-color ); }',
			].join('');

			this.noArea = CreateLineText( '0' );

			this.titleText = CreateLineText( '' );

			const title = document.createElement( 'h3' );
			title.appendChild( this.noArea );
			title.appendChild( this.titleText );
			title.addEventListener( 'click', () => { if ( this.onselectd ) { this.onselectd(); } } );

			this.missions = document.createElement( 'div' );

			const contents = document.createElement('div');
			contents.appendChild( title );
			contents.appendChild( this.missions );

			shadow.appendChild(style);
			shadow.appendChild(contents);
		}

		get no() { return parseInt( this.noArea.textContent || '' ) || 0; }
		set no( value )
		{
			this.noArea.textContent = value + '';
		}

		get title() { return this.titleText.textContent || ''; }
		set title( value )
		{
			this.titleText.textContent = value;
		}

		addMission( mission: MissionItemElement )
		{
			this.missions.appendChild( mission );
		}

		get complete()
		{
			let complete = 0;
			const items = <NodeListOf<MissionItemElement>>this.missions.querySelectorAll( 'mission-item' );
			for ( let item of items ) { if ( item.complete ) { ++complete; } }
			return complete;
		}
	} );

	customElements.define( 'toggle-button', class extends HTMLElement implements ToggleButtonElement
	{
		constructor()
		{
			super();

			const shadow = this.attachShadow( { mode: 'open' } );

			const style = document.createElement( 'style' );
			style.innerHTML =
			[
				':host { --height: 1.5rem; --border: calc( var( --height ) / 10 ); --back: #8a8a8a; --front: #8a8a8a; --unchecked: #eaeaea; --checked: #66ff95; --cursor: pointer; --duration: 0.2s; --timing-function: ease-in-out; --delay: 0s; display: inline-block; width: calc( var( --height ) * 1.6 ); }',
				':host > div { --radius: calc( var( --height ) / 2 ); width: 100%; height: var( --height ); position: relative; box-sizing: border-box; }',
				':host > div > div { background: var( --back ); width: 100%; height: 100%; position: absolute; top: 0; left: 0; border-radius: var( --radius ); display: flex; justify-content: center; align-items: center; cursor: var( --cursor ); }',
				':host > div > div::before { content: ""; display: block; background: var( --unchecked ); width: calc( 100% - var( --border ) * 2 ); height: calc( 100% - var( --border ) * 2 ); border-radius: calc( var( --radius ) * 0.8 ); transition: background var( --duration ) var( --timing-function ) var( --delay ); }',
				':host > div > div::after { content: ""; display: block; width: var( --height ); height: var( --height ); border-radius: 50%; background: var( --front ); position: absolute; left: 0; transition: left var( --duration ) var( --timing-function ) var( --delay ); }',
				':host( [ checked ] ) > div > div::before { background: var( --checked ); }',
				':host( [ checked ] ) > div > div::after { left: calc( 100% - var( --height ) ); }',
			].join( '' );

			const button = document.createElement( 'div' );
			button.addEventListener( 'click', () => { this.toggle(); } );

			const contents = document.createElement( 'div' );
			contents.appendChild( button );

			shadow.appendChild( style );
			shadow.appendChild( contents );
		}

		public toggle()
		{
			this.checked = !this.checked;
			return this;
		}

		get checked() { return this.hasAttribute( 'checked' ); }
		set checked( value )
		{
			const changed = !value === this.checked;
			if ( !changed ) { return; }
			value ? this.setAttribute( 'checked', 'checked' ) : this.removeAttribute( 'checked' );
			this.dispatchEvent( new CustomEvent( 'change' ) );
		}

		static get observedAttributes() { return [ 'checked' ]; }

		attributeChangedCallback( name: string, oldValue: any, newValue: any )
		{
			this.checked = newValue !== null;
		}
	} );
} );
