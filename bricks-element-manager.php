<?php
/**
 * Plugin Name: Bricks Element Manager
 * Plugin URI: https://www.bloompixel.com/
 * Author: BloomPixel
 * Author URI: https://www.bloompixel.com
 * Version: 1.0.0
 * Description: A simple way to deactivate/activate Bricks elements.
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: bricks-element-manager
 *
 * @package WordPress
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BELM_PATH', plugin_dir_path( __FILE__ ) );
define( 'BELM_URL', plugin_dir_url( __FILE__ ) );
define( 'BELM_VERSION', '1.0.0' );

/**
 * Bricks Element Manager class.
 *
 * The main class that initiates and runs the plugin.
 *
 * @since 1.0.0
 */
final class Belm_Bricks_Element_Manager {

	/**
	 * Holds all registered elements of Bricks.
	 *
	 * @since 1.0.0
	 *
	 * @var array Getting all the Bricks elements for react.
	 */
	public $elements = array();

	/**
	 * Instance
	 *
	 * @since 1.0.0
	 *
	 * @access private
	 * @static
	 *
	 * @var Belm_Bricks_Element_Manager The single instance of the class.
	 */
	private static $instance = null;

	/**
	 * Instance
	 *
	 * Ensures only one instance of the class is loaded or can be loaded.
	 *
	 * @since 1.0.0
	 *
	 * @access public
	 * @static
	 *
	 * @return Belm_Bricks_Element_Manager An instance of the class.
	 */
	public static function instance() {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self(); // Self here denotes the class name.
		}

		return self::$instance;
	}

	/**
	 * Constructor
	 *
	 * @since 1.0.0
	 *
	 * @access public
	 */
	public function __construct() {
		add_action( 'init', array( $this, 'i18n' ) );
		add_action( 'init', array( $this, 'bricks_theme_check' ), 11 );
		add_action( 'plugins_loaded', array( $this, 'init' ) );
	}

	/**
	 * i18n.
	 *
	 * Load plugin localization files.
	 *
	 * Fired by 'init' action hook.
	 *
	 * @uses load_plugin_textdomain
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function i18n() {
		load_plugin_textdomain( 'bricks-element-manager' );
	}

	/**
	 * Check if Bricks is installed and activated.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function bricks_theme_check() {
		if ( ! defined( 'BRICKS_VERSION' ) ) {
			add_action( 'admin_notices', array( $this, 'admin_notice_missing_main_plugin' ) );
			return;
		}
	}

	/**
	 * Initialize the plugin.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function init() {

		$this->includes();

		add_filter( 'bricks/builder/elements', array( $this, 'unregister_elements' ) );
	}

	/**
	 * Includes.
	 *
	 * Include required files.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function includes() {
		require_once 'classes/class-bricks-element-manager-loader.php';
	}

	/**
	 * Admin Notice
	 *
	 * Warning when site doesn't have Bricks installed or activated.
	 *
	 * @since 1.0.0
	 *
	 * @access public
	 */
	public function admin_notice_missing_main_plugin() {
		if ( ! is_admin() ) {
			return;
		} elseif ( ! is_user_logged_in() ) {
			return;
		} elseif ( ! current_user_can( 'update_core' ) ) {
			return;
		}
	
		$message = sprintf(
			/* translators: 1: Bricks Element Manager 2: Bricks */
			esc_html__( '%1$s requires %2$s to be installed and activated.', 'bricks-element-manager' ),
			'<strong>Bricks Element Manager</strong>',
			'<strong>Bricks</strong>'
		);

		$html = sprintf( '<div class="notice notice-warning">%s</div>', wpautop( $message ) );

		echo wp_kses_post( $html );
	}

	/**
	 * Unregister Elements.
	 *
	 * Unregistering the selected elements.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function unregister_elements( $elements ) {
		$this->elements = $elements;

		if ( bricks_is_builder() ) {
			$selected_elements = get_option( 'belm_element' );

			if ( ! empty( $selected_elements ) ) {
				return array_diff( $elements, $selected_elements );
			}
		}

		return $elements;
	}

	/**
	 * Get registered elements.
	 *
	 * Get all registered elements of Bricks.
	 *
	 * @since 1.0.0
	 *
	 * @return array
	 */
	public function get_registered_elements() {
		$elements = array();

		foreach( $this->elements as $element_key => $element ) {
			switch ( $element ) {
				case 'container':
				case 'section':
				case 'block':
				case 'div':
					continue 2;
					break;
			}
			if ( ! empty( $element ) ) {
				$class_name = str_replace( '-', '_', $element );
				$class_name = ucwords( $class_name, '_' );
				$element_class_name = "Bricks\\Element_$class_name";

				if ( class_exists( $element_class_name ) ) {
					$element_instance = new $element_class_name();
					$element_name     = $element_instance->name;
					$element_label    = $element_instance->get_label();
				} else {
					$element_name = $element;

					if ( 'post-toc' == $element ) {
						$element_label = esc_html__( 'Table of contents', 'bricks-element-manager' );
					} else {
						$element_label = ucwords( str_replace( '-', ' ', $element ) );
					}
				}
			}

			$elements[ $element_name ] = $element_label;
		}

		asort( $elements );

		return $elements;
	}
}

Belm_Bricks_Element_Manager::instance();
