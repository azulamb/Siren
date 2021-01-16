/// <reference path="./type.d.ts" />
/// <reference path="./components.ts" />
/// <reference path="./userdata.ts" />
/// <reference path="./screenshot.ts" />

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
	( ( modal ) =>
	{
		[ 'info', 'config' ].forEach( ( button ) =>
		{
			(<HTMLButtonElement>document.getElementById( button )).addEventListener( 'click', () =>
			{
				modal.dataset.type = button;
				modal.show();
			} );
		} );
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
			const csv = Object.keys( SEA_AREA ).map( ( key ) =>
			{
				const data = SEA_AREA[ key ];
				const no = data.no;
				return [
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
					'',
				];
			} );
			csv.sort( ( a, b ) => { return <number>a[ 0 ] - <number>b[ 0 ]; } );

			const lines = csv.map( ( data ) => { return data.join( ',' ); } );
			lines.unshift(
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
				'',
			].join( ',' ) );

			const link = document.createElement( 'a' );
			link.setAttribute( 'download', `siren_user_${ date.formatNoSymbol() }.csv` );
			link.setAttribute( 'href', `data:text/csv;charset=UTF-8,${ lines.join( '\n' ) }` );
			link.click();
		},
		deluserdata: () =>
		{
			if ( !confirm( 'データはこのブラウザにしかありません。本当にデータを削除しますか？' ) ) { return; }
			user.clear();
			location.reload();
		},
		downloadmap: () =>
		{
			const csv = Object.keys( SEA_AREA ).map( ( key ) =>
			{
				const data = SEA_AREA[ key ];
				return [
					data.no,
					`"${ data.title }"`,
					data.lv,
					`"${ MISSIONS[ data.missions[ 0 ].no ] }"`,
					data.missions[ 0 ].max,
					`"${ MISSIONS[ data.missions[ 1 ].no ] }"`,
					data.missions[ 1 ].max,
					`"${ MISSIONS[ data.missions[ 2 ].no ] }"`,
					data.missions[ 2 ].max,
					`"${ MISSIONS[ data.missions[ 3 ].no ] }"`,
					data.missions[ 3 ].max,
					`"${ MISSIONS[ data.missions[ 4 ].no ] }"`,
					data.missions[ 4 ].max,
					'',
				];
			} );
			csv.sort( ( a, b ) => { return <number>a[ 0 ] - <number>b[ 0 ]; } );

			const lines = csv.map( ( data ) => { return data.join( ',' ); } );
			lines.unshift(
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
				'',
			].join( ',' ) );

			const link = document.createElement( 'a' );
			link.setAttribute( 'download', 'siren_area.csv' );
			link.setAttribute( 'href', `data:text/csv;charset=UTF-8,${ lines.join( '\n' ) }` );
			link.click();
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
			star.style.top = `${ Math.floor( ( r.top - parentRect.top + ( r.bottom - r.top ) / 2 ) / parentRect.height * 1000 ) / 10 }%`;
			star.style.left = `${ Math.floor( ( r.left - parentRect.left + ( r.right - r.left ) / 2 ) / parentRect.width * 1000 ) / 10 }%`;
			stars.appendChild( star );
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
} );
