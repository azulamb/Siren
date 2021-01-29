interface USER_AREA_DATA { [ keys: string ]: { m: number[]; } }

class URLData
{
	private table = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split( '' );
	constructor(){}

	static parse()
	{
		const data = new URLData();
		return data.decode();
	}

	private toNum( num: string )
	{
		return num.split( '' ).reverse().reduce( ( total, now, index ) =>
		{
			return total + this.table.indexOf( now ) * Math.pow( this.table.length, index );
		}, 0 )
	}

	private toStr( num: number )
	{
		const list = [];

		while ( 0 < num )
		{
			list.unshift( this.table[ num % this.table.length ] );
			num = Math.floor( num / this.table.length );
		}
		if ( list.length <= 0 ) { list.push( this.table[ 0 ] ); }

		return list.join( '' );
	}

	public decode( p?: string )
	{
		const q = ( ( params ) =>
		{
			return params.get( 'q' ) || '';
		} )( new URLSearchParams( p || location.search ) );

		const params: USER_AREA_DATA = {};

		if ( !q || q.match( /[^\!\.0-9a-zA-Z]/ ) ) { return params; }

		q.split( '!' ).forEach( ( area ) =>
		{
			const data = area.split( '.' );
			const key = data.shift();
			if ( !key ) { return; }
			params[ `sa${ this.toNum( key ) }` ] = { m: data.map( ( i ) => { return this.toNum( i ); } ) };
		} );

		return params;
	}

	public encode( userdata: UserData )
	{
		const data = userdata.export();
		return Object.keys( data ).map( ( key ) =>
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
			return `${ this.toStr( data.id ) }.${ list.map( ( i ) => { return this.toStr( i ); } ).join( '.' ) }`;
		} ).join( '!' );
	}
}