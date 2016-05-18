<?php
/*
Plugin Name: Embed Travis
Plugin URI: https://github.com/KamataRyo/embed-travis
Description: Embed your build logs from Travis CI into WordPress easily.
Author: KamataRyo
Version: 0.0.0
Author URI: http://biwako.io/
*/

$e_travis = new Travis();
$e_travis->register();

class Travis {

	private $shotcode_tag = 'travis';
	private $regex = '/^https:\/\/travis-ci\.org\/([a-zA-Z-_0-9]+)\/([a-zA-Z-_0-9]+)\/((builds)|(jobs))\/[1-9][0-9]*(#L[1-9][0-9]*)?$/';
	const TRAVIS_URL_PREFIX = 'https://travis-ci.org';

	function register() {
		add_action( 'plugins_loaded', array( $this, 'plugins_loaded' ) );
	}

	public function plugins_loaded() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enquene_script' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enquene_script' ) );
		add_action( 'wp_head', array( $this, 'wp_head' ) );

		load_plugin_textdomain(
			'embed-travis',
			false,
			plugins_url( implode( array( 'languages' ), DIRECTORY_SEPARATOR ), __FILE__ )
		);

		wp_embed_register_handler(
			'embed-travis',
			$this->get_travis_url_regex(),
			array( $this, 'handler' )
		);

		add_shortcode( $this->get_shortcode_tag(), array( $this, 'shortcode' ) );
	}

	public function enquene_script() {
		wp_register_script(
			'embed-travis-script',
			plugins_url( implode( array( 'js', 'embed-travis.js' ), DIRECTORY_SEPARATOR ), __FILE__ ),
			array( 'jquery' ),
			'',
			true
		);
		wp_enqueue_script( 'jquery' );
		wp_enqueue_script( 'embed-travis-script' );
	}

	public function wp_head() {
		?>
		<style>
			.travis-log-body pre {

				margin-top: 0;
				padding: 15px 0;
				background-color: #222;
				border: 1px solid #888;
				font-family: Monaco,monospace;
				font-size: 12px;
				color: #f1f1f1;
				line-height: 19px;
				white-space: pre-wrap;
				width: 100%;
				height: 350px;
				overflow-y: scroll;
			}
			.travis-log-body p {
			    padding: 0 15px 0 55px;
			    margin: 0;
				position: relative;
			}
			.travis-log-body p:hover, .travis-log-body p.travis-active-line{
				background-color: #444!important;
			}
			.travis-log-body p.travis-fold-open a:before{
				content: "\25BC";
				color: #666;
				font-size: .75em;
				position: absolute;
				left: .5em;
			}
			.travis-log-body p.travis-fold-open a, .travis-log-body p.travis-fold-close a {
				cursor: pointer;
			}
			.travis-log-body p.travis-fold-close a:before{
				content: "\25B6";
				color: #666;
				font-size: .75em;
				position: absolute;
				left: .5em;
			}
			.travis-log-body a {
    			color: #666;
				display: inline-block;
				padding-right: 1em;
			    text-align: right;
			    width: 40px;
			    margin-left: -35px;
			    text-decoration: none;
				box-shadow:none;
			}
			.travis-info {
				position: absolute;
				display: block;
				top: 4px;
				padding: 2px 7px 2px;
				line-height: 10px;
				font-size: 10px;
				background-color: #666;
				border-radius: 6px;
				color: #bbb;
				text-align: right;
			}
			.travis-fold-start {
				right: 85px;
			}
			.travis-time-start {
				right: 12px;
			}

		</style>
		<?php
	}

	// replace here
	public function handler( $m, $attr, $url, $rattr ) {

		$name = $m[1];
		$repo = $m[2];
		$type = $m[3];

		$url_parsed = parse_url( $m[0] );

		$id = explode( '/', $url_parsed['path'] )[4];

		if ( isset( $url_parsed['fragment'] ) && $url_parsed['fragment'] ) {
			$fragment = $url_parsed['fragment'];
			$match = preg_match(
				'/^L[1-9][0-9]*$/',
				$fragment
			);
			if ( $match > 0 ) {
				$line = substr( $fragment, 1, strlen( $fragment ) - 1 );
			} else {
				$line = 0;
			}
		} else {
			$line = NULL;
		}

		return $this->shortcode( array(
			'name' => $name,
			'repo' => $repo,
			$type  => $id,
			'line' => $line,
		) );
	}

	public function shortcode( $p ) {

		// One of two are required
		if ( isset( $p['builds'] ) && $p['builds'] ) {
			$type = 'builds';
			$id = $p['builds'];
		} elseif ( isset( $p['jobs'] ) && $p['jobs'] ) {
			$type = 'jobs';
			$id = $p['jobs'];
		} else {
			return is_feed() ? '' : self::get_embed_failure();
		}
		if ( ! self::is_positive_int( $id ) ) {
			return is_feed() ? '' : self::get_embed_failure();
		}

		// optional
		if ( isset( $p['line'] ) && $p['line'] ) {
			$line = $p['line'];
			if ( ! self::is_positive_int( $line ) ) {
				return is_feed() ? '' : self::get_embed_failure();
			}
		} else {
			$line_option = '';
		}

		$html_id = "$type-$id";

		// optional
		if ( isset( $p['line'] ) && $p['line'] ) {
			$line = $p['line'];
			$html_id .= "-L$line";
			$line_hash = "#L$line";
			$line_option =  " data-line=\"$line\"";
		} else {
			$line_hash = '';
			$line_option = '';
		}

		$noscript = Travis::get_noscript( "$id$line_hash" );

		return is_feed() ? $noscript : "<div id=\"$html_id\" class=\"embed-travis\" data-$type=\"$id\"$line_option><noscript>$noscript</noscript></div>";
	}

	public static function get_noscript( $id ) {
		return sprintf(
			__( 'View the build log on <a href="https://travis-ci.org/">https://travis-ci.org/{username}/{reponame}%s</a>.', 'embed-travis' ),
			esc_url( $id )
		);
	}

	private static function is_positive_int( $arg ) {
		if (! is_numeric( $arg ) ) {
			return false;
		} elseif ( 0 !== $arg - (int)$arg ) {
			return false;
		} elseif ( 1 > $arg ) {
			return false;
		} {
			return true;
		}
	}

	public static function get_embed_failure() {
		return '<div class="embed-travis-invalid"></div>';
	}

	public function get_travis_url_regex() {
		return $this->regex;
	}

	private function get_shortcode_tag() {
		return apply_filters( 'embed_travis_shortcode_tag', $this->shotcode_tag );
	}

}

// EOF