const Anime = ( ( getLists ) =>
{
	return ( svg: SVGSVGElement ) =>
	{
		const list = new Array(
			... getLists( svg, '.sea1' ),
			... getLists( svg, '.sea2' ),
			... getLists( svg, '.sea3' ),
			... getLists( svg, '.sea4' ),
		);
	
		list.forEach( ( path: SVGPathElement ) =>
		{
			setTimeout( () =>
			{
				path.classList.add( 'show' );
			}, Math.random() * 500 );
			setTimeout( () =>
			{
				path.classList.remove( 'show' );
			}, Math.random() * 500 + 1000 );
		} );
	};
} )( ( svg: SVGSVGElement, selector: string ) =>
{
	const elements = svg.querySelectorAll( selector );
	const list = [];

	for ( let i = 0 ; i < elements.length ; ++i )
	{
		list.push( elements[ i ] );
	}

	return list;
} );

function CreateLineText( text: string ): LineTextElement { const line = new ( customElements.get( 'line-text' ) )(); line.textContent = text;  return line; }

function CreateHorizontalItem(): HorizontaItemElement { return new ( customElements.get( 'horizontal-item' ) )(); }

function SelectArea( path: SVGPathElement, item: HorizontaItemElement )
{
	const list = <NodeListOf<HTMLElement>>document.querySelectorAll( '[ data-area="selected" ]' );
	const selected = path.dataset.area === 'selected';

	for ( let i = list.length - 1 ; 0 <= i ; --i ) { delete list[ i ].dataset.area; }
	if ( selected )
	{
		history.replaceState( null, '', './' );
		return;
	}

	path.dataset.area = 'selected';
	item.dataset.area = 'selected';
	setTimeout( () =>
	{
		history.replaceState( null, '', `./?area=${ path.id.replace( /[^0-9]/g, '' ) }` );
	}, 0);
}
