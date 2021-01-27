/// <reference path="./type.d.ts" />
/// <reference path="./components.ts" />
/// <reference path="./userdata.ts" />
/// <reference path="./screenshot.ts" />
/// <reference path="./drop.ts" />
/// <reference path="./csv.ts" />

const user = new UserData();

Promise.all(
[
	user.load(),
	customElements.whenDefined( 'line-text' ),
	customElements.whenDefined( 'horizontal-area' ),
	customElements.whenDefined( 'horizontal-item' ),
	customElements.whenDefined( 'modal-dialog' ),
	customElements.whenDefined( 'five-star' ),
	customElements.whenDefined( 'mission-item' ),
	customElements.whenDefined( 'area-info' ),
	customElements.whenDefined( 'toggle-button' ),
] ).then( () =>
{
	return new Promise( ( resolve ) => { setTimeout( resolve, 50 ); } );
} ).then( () =>
{
	let importData = () => {};
	const importUserData = ( file: File ) =>
	{
		const tbody = <HTMLElement>document.getElementById( 'diff' );
		tbody.innerHTML = '';

		CSV.load( file ).then( ( csv ) =>
		{
			const data: { [ keys: string ]: { missions: { no: number, max: number, now: number }[] } & SEA_AREA_DATA } = JSON.parse( JSON.stringify( SEA_AREA ) );
			Object.keys( data ).forEach( ( key ) =>
			{
				data[ key ].missions = data[ key ].missions.map( ( mission ) =>
				{
					return Object.assign( { now: 0 }, mission );
				} );
			} );

			const newData = csv.parse<
			{
				no: number;
				max_1: number;
				max_2: number;
				max_3: number;
				max_4: number;
				max_5: number;
				missions_1: number;
				missions_2: number;
				missions_3: number;
				missions_4: number;
				missions_5: number;
			}>().filter( ( user ) => { return !!data[ `sa${ user.no }` ]; } ).map( ( user ) =>
			{
				const area = data[ `sa${ user.no }` ];
				for ( let i = 0 ; i < UserData.MISSION ; ++i )
				{
					const value: number = (<any>user)[ `missions_${ i + 1 }` ];
					if ( !value || typeof( value ) !== 'number' || value <= 0 ) { continue; }
					area.missions[ i ].now = Math.min( Math.floor( value ), area.missions[ i ].max );
				}
				return {
					no: user.no,
					missions: area.missions.map( ( data ) => { return data.now; } ),
				};
			} );

			const list = Object.keys( data ).map( ( key ) => { return data[ key ]; } );
			list.sort( ( a, b ) => { return a.no - b.no; } );

			tbody.innerHTML = '';
			list.forEach( ( data ) =>
			{
				const no = document.createElement( 'td' );
				no.textContent = data.no + '';

				const area = document.createElement( 'td' );
				area.textContent = data.title;

				const tr = document.createElement( 'tr' );
				tr.appendChild( no );
				tr.appendChild( area );

				data.missions.forEach( ( mission, index ) =>
				{
					const now = document.createElement( 'td' );
					now.textContent = user.getMission( data.no, index ) + '';

					const connect = document.createElement( 'td' );
					connect.classList.add( 'connect' );

					const value = document.createElement( 'td' );
					value.textContent = mission.now + '';

					tr.appendChild( now );
					tr.appendChild( connect );
					tr.appendChild( value );
				} );

				tbody.appendChild( tr );
			});

			importData = () =>
			{
				newData.forEach( ( data ) =>
				{
					for ( let i = 0 ; i < data.missions.length ; ++i )
					{
						user.setMission( data.no, i, data.missions[ i ] );
					}
				} );
				location.reload();
			};
			modal.dataset.type = 'import';
			modal.show();
		} ).catch( ( error ) => { console.error( error ); } );
	};

	(<HTMLInputElement>document.getElementById( 'importcsv' )).addEventListener( 'change', ( event ) =>
	{
		const files = (<HTMLInputElement>event.target).files;
		if ( !files || !files[ 0 ] ) { return; }
		importUserData( files[ 0 ] );
	} );

	const modal = ( ( modal ) =>
	{
		[ 'info', 'config' ].forEach( ( button ) =>
		{
			(<HTMLButtonElement>document.getElementById( button )).addEventListener( 'click', () =>
			{
				modal.dataset.type = button;
				modal.show();
			} );
		} );

		(<HTMLButtonElement>document.getElementById( 'import' )).addEventListener( 'click', () => { importData(); } );

		const drop = new Drop();
		drop.addEventListener( 'dropfile', ( event: DropFileEvent ) =>
		{
			importData = () => {};
			importUserData( event.detail.file )
		} );
		return modal;
	} )( <ModalDialogElement>document.getElementById( 'modal' ) );

	(<HTMLButtonElement>document.getElementById( 'ss' )).addEventListener( 'click', () =>
	{
		const date = new MyDate();
		const complete = CountComplete();
		Screenshot( date, complete, Object.keys( SEA_AREA ).length * 5 ).then( ( img ) =>
		{
			const canvas = document.createElement( 'canvas' );
			canvas.width = 800;
			canvas.height = 560;

			const context = <CanvasRenderingContext2D>canvas.getContext( '2d' );
			context.drawImage( img, 0, 0, canvas.width, canvas.height );

			const link = document.createElement( 'a' );
			link.download = `siren_${ date.formatNoSymbol() }.png`;
			link.href = canvas.toDataURL();
			link.click();
		} ).catch( ( error ) => { console.error( error ); } );
	} );

	(<HTMLElement>document.getElementById( 'totalstar' )).textContent = ( Object.keys( SEA_AREA ).length * 5 ) + '';

	const CountComplete = () =>
	{
		return ( ( items ) =>
		{
			let complete = 0;
			for ( let item of items ) { complete += item.complete; }
			return complete;
		} )( <NodeListOf<AreaInfoElement>>document.body.querySelectorAll( 'area-info' ) );
	};

	const UpdateComplete = ( ( target ) =>
	{
		let timer = 0;
		return () =>
		{
			if ( timer ) { clearTimeout( timer ); }
			timer = setTimeout( () =>
			{
				target.textContent = ( CountComplete() + '' ).padStart( 3, '0' );
				timer = 0;
			}, 500 );
		};
	} )( <HTMLElement>document.getElementById( 'getstar' ) );

	( ( funcs: { [ keys: string ]: () => any } ) =>
	{
		document.querySelectorAll( '.configitem' ).forEach( ( item ) =>
		{
			const button = item.children[ 0 ];
			if ( button.tagName !== 'BUTTON' || !item.id || !funcs[ item.id ] ) { return; }
			button.addEventListener( 'click', funcs[ item.id ] );
		} );
	} )(
	{
		downloaduser: () =>
		{
			const date = new MyDate();
			const csv = new CSV(
			[
				'no',
				'missions_1',
				'max_1',
				'missions_2',
				'max_2',
				'missions_3',
				'max_3',
				'missions_4',
				'max_4',
				'missions_5',
				'max_5',
			] );
			const list = Object.keys( SEA_AREA ).map( ( key ) =>
			{
				return  SEA_AREA[ key ];
			} );
			list.sort( ( a, b ) => { return a.no - b.no; } );
			list.forEach( ( data ) =>
			{
				const no = data.no;
				csv.add(
				[
					no,
					user.getMission( no, 0 ),
					data.missions[ 0 ].max,
					user.getMission( no, 1 ),
					data.missions[ 1 ].max,
					user.getMission( no, 2 ),
					data.missions[ 2 ].max,
					user.getMission( no, 3 ),
					data.missions[ 3 ].max,
					user.getMission( no, 4 ),
					data.missions[ 4 ].max,
				] );
			} );

			csv.downloadLink( `siren_user_${ date.formatNoSymbol() }` ).click();
		},
		deluserdata: () =>
		{
			if ( !confirm( 'データはこのブラウザにしかありません。本当にデータを削除しますか？' ) ) { return; }
			user.clear();
			location.reload();
		},
		downloadmap: () =>
		{
			const csv = new CSV(
			[
				'no',
				'title',
				'lv',
				'missions_1',
				'max_1',
				'missions_2',
				'max_2',
				'missions_3',
				'max_3',
				'missions_4',
				'max_4',
				'missions_5',
				'max_5',
			] );
			const list = Object.keys( SEA_AREA ).map( ( key ) =>
			{
				return SEA_AREA[ key ];
			} );
			list.sort( ( a, b ) => { return a.no - b.no; } );
			list.forEach( ( data ) =>
			{
				csv.add(
				[
					data.no,
					data.title,
					data.lv,
					MISSIONS[ data.missions[ 0 ].no ],
					data.missions[ 0 ].max,
					MISSIONS[ data.missions[ 1 ].no ],
					data.missions[ 1 ].max,
					MISSIONS[ data.missions[ 2 ].no ],
					data.missions[ 2 ].max,
					MISSIONS[ data.missions[ 3 ].no ],
					data.missions[ 3 ].max,
					MISSIONS[ data.missions[ 4 ].no ],
					data.missions[ 4 ].max,
				] );
			} );

			csv.downloadLink( 'siren_area' ).click();
		},
	} );

	(<HTMLElement>document.getElementById( 'loading' )).classList.add( 'hide' );

	const urlParams = ( ( params ) =>
	{
		const data = { area: 0 };

		const area = parseInt( params.get( 'area' ) || '' ) || 0;
		if ( area && 0 < area )
		{
			data.area = area;
		}

		return data;
	} )( new URLSearchParams( location.search ) );

	const svg: SVGSVGElement = <any>document.getElementById( 'siren' );
	const stars =<HTMLElement> document.getElementById( 'stars' );
	const parentRect = svg.getBoundingClientRect();
	setTimeout( () => { Anime( svg ); }, 1000 );

	const list = <HorizontalAreaElement>document.getElementById( 'list' );
	const areas = Object.keys( SEA_AREA ).map( ( key ) => { return SEA_AREA[ key ]; } );
	areas.sort( ( a, b ) => { return a.no - b.no; } );
	areas.forEach( ( info ) =>
	{
		const areaId = info.no;
		const path: SVGPathElement = <any>document.getElementById( `sa${ areaId }` );

		const star = new ( customElements.get( 'five-star' ) )();

		if ( path )
		{
			path.dataset.lv = info.lv + '';
			setTimeout( () => { path.classList.add( 'show' ) }, 3500 );

			const r = path.getBoundingClientRect();
			if ( path.dataset.y )
			{
				const y = parseFloat( path.dataset.y ) || 0;
				star.style.top = `${ Math.floor( ( r.top - parentRect.top + ( r.bottom - r.top ) * y ) / parentRect.height * 1000 ) / 10 }%`;
			} else
			{
				star.style.top = `${ Math.floor( ( r.top - parentRect.top + ( r.bottom - r.top ) / 2 ) / parentRect.height * 1000 ) / 10 }%`;
			}
			if ( path.dataset.x )
			{
				const x = parseFloat( path.dataset.x ) || 0;
				star.style.left = `${ Math.floor( ( r.left - parentRect.left + ( r.right - r.left ) * x ) / parentRect.width * 1000 ) / 10 }%`;
			} else
			{
				star.style.left = `${ Math.floor( ( r.left - parentRect.left + ( r.right - r.left ) / 2 ) / parentRect.width * 1000 ) / 10 }%`;
			}
			stars.appendChild( star );

			path.classList.add( 'f', ... info.missions.filter( ( item ) => { return 0 < item.no; } ).map( ( item ) => { return `m${ item.no }`; } ) );
		}

		const createMission = () => { return <MissionItemElement>new ( customElements.get( 'mission-item' ) )(); };
		const areaInfo = new ( customElements.get( 'area-info' ) )();
		areaInfo.no = areaId;
		areaInfo.title = info.title;
		info.missions.forEach( ( info, index ) =>
		{
			const mission = createMission();
			mission.addEventListener( 'change', ( event ) =>
			{
				user.setMission( areaId, index, event.detail.value );
				star[ mission.complete ? 'light' : 'unlight' ]( index );
				UpdateComplete();
			} );
			mission.title = MISSIONS[ info.no ] || '???';
			mission.max = info.max;
			mission.value = user.getMission( areaId, index );

			areaInfo.addMission( mission );
		} );

		const item = CreateHorizontalItem();
		item.appendChild( areaInfo );
		list.appendChild( item );

		const back: SVGPathElement = <any>document.getElementById( `sb${ info.no }` );
		if ( !back ) { return; }

		const selected = () =>
		{
			SelectArea( back, item );
			list.goTo( item );
		};
		back.addEventListener( 'click', selected );
		areaInfo.onselectd = selected;
		if ( areaId === urlParams.area ) { setTimeout( selected, 4000 ); }
	} );

	(<ToggleButtonElement>document.getElementById( 'showstar' )).addEventListener( 'change', ( event ) =>
	{
		const checked = (<ToggleButtonElement>event.target).checked;
		stars.classList[ checked ? 'remove' : 'add' ]( 'hidestar' );
	} );

	( ( select, svg ) =>
	{
		( ( list ) =>
		{
			const first = <string[]>[ list.shift(), list.shift() ];
			list.sort();
			list.unshift( ... first );
			list.forEach( ( mission ) =>
			{
				const index = MISSIONS.indexOf( mission );
				const option = document.createElement( 'option' );
				option.value = index + '';
				if ( index === 0 )
				{
					option.textContent = '-';
				} else
				{
					option.textContent = mission;
				}
				select.appendChild( option );
			} );
		} )( [ ... MISSIONS ] );

		select.addEventListener( 'change', ( event ) =>
		{
			const value = select.options[ select.selectedIndex ].value;
			if ( value === '0' )
			{
				delete svg.dataset.mission;
			} else
			{
				svg.dataset.mission = value;
			}
		} );
	} )(
		<HTMLSelectElement>document.getElementById( 'missions' ),
		<HTMLSelectElement>document.getElementById( 'siren' )
	);
} );
