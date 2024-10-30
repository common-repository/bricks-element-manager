<?php
/**
 * Responsible for setting up constants, classes and templates.
 *
 * @author  BloomPixel
 * @package Bricks Element Manager/Loader
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * All function loads from this class Belm_Bricks_Element_Manager_Loader.
 */
class Belm_Bricks_Element_Manager_Loader {
	/**
	 * For automatically loading action and filters.
	 */
	public function __construct() {

		// Enqueue style and script.
		add_action( 'admin_enqueue_scripts', array( $this, 'register_script' ), 999 );

		// Action to register setting for get_option function.
		add_action( 'init', array( $this, 'register_plugin_settings' ) );

		// Adding element manager option to Bricks.
		add_action( 'admin_menu', array( $this, 'register_element_manager_menu' ), 700 );
	}

	/**
	 * For registering script and stylesheet.
	 *
	 * @param string $hook To check if the current page.
	 * @return void
	 */
	public function register_script( $hook ) {

		// Register setting for this page only.
		if ( 'bricks_page_element-manager' === $hook ) {
			wp_enqueue_style( 'belm-style', BELM_URL . 'build/admin.css', array( 'wp-components' ), BELM_VERSION, false );
			wp_enqueue_script( 'belm-script', BELM_URL . 'build/admin.js', array( 'wp-components', 'wp-element', 'wp-api', 'wp-i18n' ), BELM_VERSION, true );

			// Calling Bricks Element Manager class with its public variable.
			wp_localize_script( 'belm-script', 'belm_elements', Belm_Bricks_Element_Manager::instance()->get_registered_elements() );
		}
	}

	/**
	 * Registering element manager.
	 *
	 * @return void
	 */
	public function register_element_manager_menu() {
		// Adding sub-menu to Bricks.
		add_submenu_page(
			'bricks', // Parent slug.
			esc_html__( 'Element Manager', 'bricks-element-manager' ), // Page title.
			esc_html__( 'Element Manager', 'bricks-element-manager' ), // Menu title.
			'manage_options', // Capability.
			'element-manager', // Menu slug.
			array( $this, 'render_element_manager_page' ) // Callback function.
		);
	}

	/**
	 * Includes element manager page from react.
	 *
	 * @return void
	 */
	public function render_element_manager_page() {
		echo "<div id='belm-setting-root'></div>";
	}

	/**
	 * Registering element settings in rest-api.
	 *
	 * @return void
	 */
	public function register_plugin_settings() {
		register_setting(
			'belm-settings-group',
			'belm_element',
			array(
				'show_in_rest' => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type' => 'string',
						),
					),
				),
				'default'      => array(),
			)
		);
	}
}

$element_manager_loader = new Belm_Bricks_Element_Manager_Loader();
