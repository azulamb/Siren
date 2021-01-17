interface DropFile extends EventTarget
{
	addEventListener( type: 'dropfile', listener: ( event: DropFileEvent ) => any, options?: boolean | AddEventListenerOptions ): void;
}
interface DropFileEvent extends CustomEvent
{
	detail: { file: File; };
}

class Drop extends EventTarget implements DropFile
{
	constructor()
	{
		super();

		this.init( document.body );
	}

	private init( target: HTMLElement )
	{
		target.addEventListener( 'dragover', ( event ) =>
		{
			event.stopPropagation();
			event.preventDefault();
			if ( event.dataTransfer ) { event.dataTransfer.dropEffect = 'copy'; }
		} );

		target.addEventListener( 'drop', ( event ) =>
		{
			event.stopPropagation();
			event.preventDefault();
			const dataTransfer = event.dataTransfer;
			if ( !dataTransfer ) { return; }
			const files = dataTransfer.files;
			if ( files.length < 1 ) { return; }
			const file = files[ 0 ];
			this.onDrop( file );
		} );
	}

	private onDrop( file: File )
	{
		this.dispatchEvent( new CustomEvent( 'dropfile', { detail: { file: file } } ) );
	}
}