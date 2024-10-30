import './setting.scss';
import ReactNotification, { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css';

/**
 * WordPress dependencies
 */
const { __ } = wp.i18n;

const {
	Panel,
	PanelRow,
	Placeholder,
	Spinner,
} = wp.components;

const {
	Component,
	Fragment,
} = wp.element;

class Settings extends Component {

	constructor( props ) {
	
		super( props );

		this.state = {
			isAPILoaded: false,
			isAPISaving: false,
			select_option: '-1',
			belm_element_list: [],
			selected_element: [],
			search: '',
			notification: null,
			
		}

		this.belm_elements = [];
		this.search_element = [];

		this.changeStatus = this.changeStatus.bind( this );
		this.changeOptions = this.changeOptions.bind( this );
		this.selectCheckbox = this.selectCheckbox.bind( this );
		this.selectApply = this.selectApply.bind( this );
	}

	// Formatting to all the previous setting when the component is mounted.
	async componentDidMount() {

		// Making array of object.
		let { belm_element_list } = this.state

		Object.keys( belm_elements ).map( ( value,index ) => {

			belm_element_list[index] = {
				title: belm_elements[value],
				slug: value,
				status: true,
			};
		} );

		this.setState( { belm_element_list } );
		this.search_element = this.state.belm_element_list;

		// Getting data from setting model api.
		wp.api.loadPromise.then( () => {

			this.element = new wp.api.models.Settings();

			if( ! this.state.isAPILoaded ) {

				this.element.fetch().then( response => {

					let { belm_element_list } = this.state;

					Object.keys( this.state.belm_element_list ).map( ( index ) => {

						if ( response.belm_element.some( (val) => val === this.state.belm_element_list[index].slug ) ) {

							belm_element_list[index].status = ! this.state.belm_element_list[index].status
							this.belm_elements.push( this.state.belm_element_list[index].slug );
						}
					})
					this.setState( { belm_element_list } );
					this.setState( { isAPILoaded: true } );
				} )
			}
		} )
	}

	// Renders search result.
	searchResult( e ) {

		this.setState( { search: e.target.value } );
		let { belm_element_list } = this.state,i=0;

		if( '' != e.target.value ) {
			
			belm_element_list = [];

			Object.keys( this.search_element ).map( ( index ) => {
				if( this.search_element[index].title.toUpperCase().indexOf( e.target.value.toUpperCase() ) > -1 ) {

					belm_element_list.push( this.search_element[index] );
				}
			});
		} else {

			belm_element_list = this.search_element;
		}

		this.setState( { belm_element_list } );
	}

	// Selected elements pushed into new array.
	selectCheckbox( e, index ) {
		
		let { selected_element } = this.state;

		// Select those which are checked.
		if( e.target.checked ) {

			selected_element.push( this.state.belm_element_list[index].slug );
		} else {

			let itemIndex = this.state.selected_element.indexOf( this.state.belm_element_list[index].slug );
			selected_element.splice( itemIndex, 1 );
		}

		this.setState( { selected_element } );
		// console.log( this.state.selected_element );
	}

	// Selecting particular option from select.
	selectOption( e ) {

		this.setState( { select_option: e.target.value } );
	}

	// Selecting all the wigdets.
	selectAll( e ) {

		let { selected_element } = this.state;

		if( e.target.checked ) {

			Object.keys( this.state.belm_element_list ).map( ( index ) => {

				selected_element.push( this.state.belm_element_list[index].slug );
			});			

			this.setState( { selected_element } );

		} else {

			this.setState( { selected_element: [] } );
		}
	}

	// For saving the setting changes in the setting api.
	changeOptions( option, value ) {

		this.setState( { isAPISaving: true } );

		const model = new wp.api.models.Settings( {
			[option]: value
		} );

		model.save().then( ( response,status ) => {

			store.removeNotification( this.state.notification );
			// console.log( response );

			if ( 'success' == status ) {

				this.addNotification( __( 'Settings Saved', 'bricks-element-manager' ), 'success' );
				this.setState( { isAPISaving: false } );
			}
		} )
	}

	// Changes after clicking the apply button.
	selectApply() {

		if( '-1' != this.state.select_option ) {

			let { belm_element_list } = this.state;

			if( this.state.selected_element.length != 0 ) {

				if( 'activate' == this.state.select_option ) {

					Object.keys( this.state.belm_element_list ).map( ( index ) => {

						if ( this.state.selected_element.some( (val) => val === this.state.belm_element_list[index].slug ) && ! this.state.belm_element_list[index].status ) {
							belm_element_list[index].status = ! belm_element_list[index].status;

							let itemIndex = this.belm_elements.indexOf( this.state.belm_element_list[index].slug );
							this.belm_elements.splice( itemIndex, 1 );
						}
					})
					this.addNotification( __( 'Activating Element...', 'bricks-element-manager' ), 'info' );

				} else if( 'deactive' == this.state.select_option ) {

					Object.keys( this.state.belm_element_list ).map( ( index ) => {

						if ( this.state.selected_element.some( (val) => val === this.state.belm_element_list[index].slug ) && this.state.belm_element_list[index].status ) {
							belm_element_list[index].status = ! belm_element_list[index].status;

							this.belm_elements.push( this.state.belm_element_list[index].slug );
						}
					})
					this.addNotification( __( 'Deactivating Element...', 'bricks-element-manager' ), 'info' );
				}
	
				// To uncheck all the selection after applying the bulk action.
				this.setState( { selected_element: [] } );

				// To select the default option bulk action.
				this.setState( { select_option: '-1' } );

				// Again upadating the state.
				this.setState( { belm_element_list } );

				// Passing the updated blacklist element to settings api.
				this.changeOptions( 'belm_element', this.belm_elements);
			} else {

				// To select the default option bulk action.
				this.setState( { select_option: '-1' } );

				this.addNotification( __( 'Choose atleast One Option', 'bricks-element-manager' ), 'warning' );
			}
		} else {

			this.addNotification( __( 'Need to Choose Other Options', 'bricks-element-manager' ), 'warning' );
		}
	}

	// For changing the status from activate to deactivate and vice versa.
	changeStatus( index ) {

		let { belm_element_list } = this.state;
		belm_element_list[index].status = ! this.state.belm_element_list[index].status
		
		this.setState( { belm_element_list } );

		// If the status is false then push otherwise pop.
		if( ! this.state.belm_element_list[index].status ) {

			this.addNotification( __( 'Deactivating Element...', 'bricks-element-manager' ), 'info' );
			this.belm_elements.push( this.state.belm_element_list[index].slug ); 
		} else {

			this.addNotification( __( 'Activating Element...', 'bricks-element-manager' ), 'info' );
			let itemIndex = this.belm_elements.indexOf( this.state.belm_element_list[index].slug );
			this.belm_elements.splice( itemIndex, 1 );
		}

		this.changeOptions( 'belm_element', this.belm_elements);
	}

	// Handling the notification for state updating.
	addNotification( message, status ) {
		const notification = store.addNotification({
			message: message,
            type: status,                            // 'default', 'success', 'info', 'warning'
            container: 'bottom-left',                // where to position the notifications
            animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
            animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
            dismiss: {
			  duration: 2000,
			  showIcon: true,
			},
		})
		
		this.setState( { notification } );
	}

	render() {
		if( ! this.state.isAPILoaded ) {
			return (
				<Placeholder>
					<Spinner />
				</Placeholder>
			)
		}

		return(
			<Fragment>
				<ReactNotification />

				<header className="belm-setting-header">
					<div className="belm-setting-title">
						<h1>{ __( 'Bricks Element Manager', 'bricks-element-manager' ) }</h1>
						<p>by <a href="https://www.bloompixel.com" target="_blank">BloomPixel</a></p>
					</div>
				</header>

				<Panel className="belm-setting-container">
					<div className="belm-select-options-container">
						<div className="belm-select-options-container-checkbox">
							<input type='checkbox' className="belm-select-options-checkbox"  onChange={ ( e ) => this.selectAll( e ) } />
						</div>

						<div className="belm-select-options-container-select">
							<select value={ this.state.select_option } onChange={ ( e ) => this.selectOption( e ) }>
								<option value="-1">{ __( 'Bulk Actions', 'bricks-element-manager' ) }</option>
								<option value="activate">{ __( 'Activate', 'bricks-element-manager' ) }</option>
								<option value="deactive">{ __( 'Deactivate', 'bricks-element-manager' ) }</option>
							</select>	
						</div>

						<div className="belm-select-options-container-button">
							<button className="button" onClick={ this.selectApply }>{ __( 'Apply', 'bricks-element-manager' ) }</button>
						</div>

						<div className="belm-select-options-container-search">
							<input  
								type="text"
								disabled={ this.state.isAPISaving }
								className="belm-select-options-searchbox"
								value={ this.state.search }
								placeholder={ __( 'Search', 'bricks-element-manager' ) }
								onChange={ ( e ) => this.searchResult( e ) }
							/>
						</div>
					</div>

					<PanelRow>
						{
							this.state.belm_element_list != '' ?
								<ul className="belm-setting-list">
									{
										Object.keys( this.state.belm_element_list ).map( ( index ) => {
											return (
												<li className={ "belm-setting-list-item " + (this.state.belm_element_list[index].status? 'deactivate':'activate' ) } key={index}>
													<div className="belm-setting-list-item-container-checkbox">
														<input 
															type='checkbox'
															className="belm-setting-list-item-checkbox"
															onChange={ ( e ) => this.selectCheckbox( e, index ) }
															checked={ this.state.selected_element.some( (val) => val === this.state.belm_element_list[index].slug ) }
														/>
													</div>

													<div className="belm-setting-list-item-container-title">
														<h4>{ __( this.state.belm_element_list[index].title ) }</h4>
													</div>

													<div className="belm-setting-list-item-container-button">
														<button id={ 'item-' + index } onClick={ () => this.changeStatus( index ) } className="belm-setting-list-button">
															{ this.state.belm_element_list[index].status ? __( 'Deactivate', 'bricks-element-manager' ) : __( 'Activate', 'bricks-element-manager' ) }
														</button>
													</div>
												</li>
											)
										})
									}
								</ul>
							:	<div className="belm-empty-search"><p>{ __( 'Oops! Nothing Found', 'bricks-element-manager' ) }</p></div>
						}
					</PanelRow>
				</Panel>
			</Fragment>
		)
	}
}

export default Settings;