interface USER_AREA_DATA { [ keys: string ]: { m: number[]; } }

class URLData
{
	constructor(){}

	static parse()
	{
		const data = new URLData();
		return data.decode();
	}

	public decode( p?: string )
	{
		const q = ( ( params ) =>
		{
			return params.get( 'q' ) || '';
		} )( new URLSearchParams( p || location.search ) );

		const params: USER_AREA_DATA = {};

		if ( !q || q.match( /[^\!\.0-9a-fA-F]/ ) ) { return params; }

		q.split( '!' ).forEach( ( area ) =>
		{
			const data = area.split( '.' );
			const key = data.shift();
			if ( !key ) { return; }
			params[ `sa${ parseInt( key, 16 ) }` ] = { m: data.map( ( i ) => { return parseInt( i, 16 ); } ) };
		} );

		return params;
	}

	public encode( userdata: UserData )
	{
		const data = userdata.export();
		return 'q=' + Object.keys( data ).map( ( key ) =>
		{
			const area = data[ key ];
			return Object.assign( { id: parseInt( key.replace( /[^0-9]/g, '' ) ) }, area );
		} ).filter( ( data ) =>
		{
			return data.m[ 0 ] + data.m[ 1 ] + data.m[ 2 ] + data.m[ 3 ] + data.m[ 4 ];
		} ).map( ( data ) =>
		{
			const list = [ ... data.m ];
			for ( let i = 4 ; 0 <= i ; --i )
			{
				if ( list[ i ] ) { break; }
				list.pop();
			}
			return `${ data.id.toString( 16 ) }.${ list.map( ( i ) => { return i.toString( 16 ); } ).join( '.' ) }`;
		} ).join( '!' );
	}
}