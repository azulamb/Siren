class CSV
{
	private header: string;
	private lines: string[];

	constructor( header: string | string[] )
	{
		this.header = Array.isArray( header ) ? header.map( ( data ) => { return `"${ data }"`; } ).join( ',' ) : header.replace( /\,+$/, '' );
		this.lines = [];
	}

	public add( data: string | (number|string)[] )
	{
		this.lines.push( typeof( data ) === 'string' ? data : data.map( ( data ) =>
		{
			return typeof data === 'number' ? data : `"${ data }"`;
		} ).join( ',' ) );
		return this;
	}

	public toString()
	{
		return this.header + ',\n' + this.lines.join( ',\n' );
	}

	public toDataURL()
	{
		return `data:text/csv;charset=UTF-8,${ encodeURIComponent( this.toString() ) }`;
	}

	public downloadLink( filename: string )
	{
		const link = document.createElement( 'a' );
		link.setAttribute( 'download', `${ filename }.csv` );
		link.setAttribute( 'href', this.toDataURL() );
		return link;
	}

	private parseLine( line: string )
	{
		return line.split( ',' ).map( ( data ) =>
		{
			const value = data.replace( /^\"(.*)\"$/, '$1' );

			if ( !value ) { return ''; }

			if ( !value.match( /[^0-9]/ ) ) { return parseInt( value ); }

			const float = parseFloat( value );
			if ( isFinite( float ) ) { return float; }

			return value;
		} );
	}

	public get max() { return this.lines.length; }

	public read( line: number )
	{
		return this.lines[ line ] || '';
	}

	public load( line: number )
	{
		return this.parseLine( this.read( line ) );
	}

	public parse<T extends { [ key: string ]: string | number } >(): T[]
	{
		const header = this.header.split( ',' ).map( ( data ) => { return data.replace( /^\"(.*)\"$/, '$1' ); } );
		return this.lines.map( ( line ) =>
		{
			const data: { [ key: string ]: string | number } = {};

			this.parseLine( line ).forEach( ( value, index ) =>
			{
				const key = header[ index ];
				if ( !key ) { return key; }
				data[ key ] = value;
			} );

			return <T>data;
		} );
	}

	public static async load( file: File )
	{
		return new Promise<string>( ( resolve, reject ) =>
		{
			const reader = new FileReader();
			reader.onerror = reject;
			reader.onabort = reject;
			reader.onload = ( event ) => { resolve( <string>reader.result ); };
			reader.readAsText( file );
		} ).then( ( buf ) =>
		{
			const lines = buf.split( /\r\n|\r|\n/ );

			const csv = new CSV( lines.shift() || '' );

			lines.forEach( ( line ) => { csv.add( line ); } );

			return csv;
		} );
	}
}
