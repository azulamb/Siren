class MyDate
{
	private date: Date;

	constructor()
	{
		this.date = new Date();
	}

	private format()
	{
		const num2fillstr = ( n: number ) => { return ( n + '' ).padStart( 2, '0' ); };

		return [
			this.date.getFullYear(),
			num2fillstr( this.date.getMonth() + 1 ),
			num2fillstr( this.date.getDate() ),
			num2fillstr( this.date.getHours() ),
			num2fillstr( this.date.getMinutes() ),
			num2fillstr( this.date.getSeconds() ),
		];
	}

	public formatNoSymbol() { return this.format().join( '' ); }

	public formatDate()
	{
		const d = this.format();
		return `${ d[ 0 ] }/${ d[ 1 ] }/${ d[ 2 ] } ${ d[ 3 ] }:${ d[ 4 ] }:${ d[ 5 ] }`;
	}
}

function Screenshot( date: MyDate, complete: number, max: number )
{
	const offsetStarSize = 30 / 2;

	const stars = <NodeListOf<FiveStarElement>>(<HTMLElement>document.getElementById( 'stars' )).querySelectorAll( 'five-star' );
	const img = document.createElement( 'img' );

	const svg = ( ( map ) =>
	{
		const parent = document.createElement( 'div' );
		parent.innerHTML = map.outerHTML;
		for ( let i = 1 ; i <= 4  ; ++i )
		{
			const seas = <NodeListOf<SVGPathElement>>parent.querySelectorAll( '.sea' + i );
			for ( let sea of seas )
			{
				(<HTMLElement>sea.parentElement).removeChild( sea );
			}
		}
		return parent.children[ 0 ];
	} )( <HTMLElement>document.getElementById( 'siren' ) );

	for ( let s of stars )
	{
		const g = document.createElementNS( 'http://www.w3.org/2000/svg','g' );
		g.innerHTML = s.svg.innerHTML;
		g.setAttributeNS( null, 'style', `transform:translate(calc(${ s.style.left } - ${ offsetStarSize }px),calc(${ s.style.top } - ${ offsetStarSize }px))` );
		svg.appendChild( g );
	}

	( ( s ) =>
	{
		if ( !s ) { return; }
		const g = document.createElementNS( 'http://www.w3.org/2000/svg','g' );
		g.innerHTML = s.svg.innerHTML;
		g.setAttributeNS( null, 'style', `transform:translate(860px,665px)` );
		svg.appendChild( g );
	} )( document.querySelector( 'five-star[ light ]' ) );

	[
		`${ ( complete + '' ).padStart( 3, '0' ) }/${ max }`,
		`${ date.formatDate() }`,
	].forEach( ( str, index ) =>
	{
		const text = document.createElementNS( 'http://www.w3.org/2000/svg','text' );
		text.setAttributeNS( null, 'x', `${ 980 - index * 140 }` );
		text.setAttributeNS( null, 'y', '690' );
		text.setAttributeNS( null, 'font-size', '20' );
		text.setAttributeNS( null, 'text-anchor', 'end' );
		text.textContent = str;
		svg.appendChild( text );
	} );

	return new Promise( ( resolve, reject ) =>
	{
		img.onload = resolve;
		img.onerror = reject;
		const svgimg = encodeURIComponent( svg.outerHTML.replace( /[\r\n]/g, '' ).replace( /\s{2,}/g, '' ) );
		img.src = `data:image/svg+xml,${ svgimg }`;
	} ).then( () => { return img; } );
}
