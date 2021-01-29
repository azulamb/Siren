/// <reference path="./urldata.ts" />

declare const MISSIONS: string[];
declare const SEA_AREA: { [ keys: string ]: SEA_AREA_DATA };

class UserData
{
	static MISSION: number = 5;
	private data: USER_AREA_DATA;
	private lock = false;

	constructor()
	{
		this.data =
		{
			/*
			sa[ID]:
			{
				m: number[];
			},
			*/
		};
	}

	private _get( key: string )
	{
		if ( this.lock ) { return ''; }
		return localStorage.getItem( key ) || '';
	}

	public getMission( id: number, mission: number )
	{
		if ( !this.data[ `sa${ id }` ] ) { return 0; }
		return this.data[ `sa${ id }` ].m[ mission ] || 0;
	}

	private async _set( key: string, value: string )
	{
		if ( this.lock ) { return; }
		localStorage.setItem( key, value );
	}

	public setMission( id: number, mission: number, value: number )
	{
		if ( !this.data[ `sa${ id }` ] || typeof this.data[ `sa${ id }` ].m[ mission ] !== 'number' ) { return; }
		this.data[ `sa${ id }` ].m[ mission ] = value;
		return this._set( `sa${ id }_m${ mission }`, value + '' );
	}

	public async load()
	{
		Object.keys( SEA_AREA ).map( ( key ) => { return SEA_AREA[ key ]; } ).forEach( ( info ) =>
		{
			const id = `sa${ info.no }`;
			if ( !this.data[ id ] ) { this.data[ id ] = { m: [ 0, 0, 0, 0, 0 ] }; }
			for ( let i = 0 ; i < UserData.MISSION ; ++i )
			{
				this.data[ id ].m[ i ] = parseInt( this._get( `${ id }_m${ i }` ) ) || 0;
			}
		} );
	}

	public async save()
	{
		Object.keys( SEA_AREA ).forEach( async ( key ) =>
		{
			if ( !this.data[ key ] ) { return; }
			const id = parseInt( key.replace( /[^0-9]/g, '' ) ) || 0;
			for ( let i = 0 ; i < UserData.MISSION ; ++i )
			{
				await this.setMission( id, i, this.data[ id ].m[ i ] );
			}
		} );
	}

	public async clear()
	{
		if ( this.lock ) { return; }
		localStorage.clear();
	}

	public import( data: USER_AREA_DATA, lock: boolean = false )
	{
		this.lock = true;
		Object.keys( this.data ).forEach( ( key ) =>
		{
			this.data[ key ] = { m: [] };
			for ( let i = 0 ; i < UserData.MISSION ; ++i )
			{
				this.data[ key ].m[ i ] = ( data[ key ] ? data[ key ].m[ i ] : 0 ) || 0;
			}
		} );
	}

	public export() { return <{ [ keys: string ]: { m: number[]; } }>JSON.parse( JSON.stringify( this.data ) ); }
}
