<?php
/*
Plugin Name: Embed Travis
Plugin URI: https://github.com/KamataRyo/embed-travis
Description: Embed your build logs from Travis CI into WordPress easily.
Author: Kamata Ryo
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
		add_action( 'wp_head', array( $this, 'wp_head' ) );

		load_plugin_textdomain(
			'embed-travis',
			false,
			dirname( plugin_basename( __FILE__ ) ).'/languages'
		 );

		wp_embed_register_handler(
			'embed-travis',
			$this->get_travis_url_regex(),
			array( $this, 'handler' )
		 );

		add_shortcode( $this->get_shortcode_tag(), array( $this, 'shortcode' ) );

	}

	public function wp_head() {
		?>
		<style>
		.gist table {
			margin-bottom: 0 !important;
		}
		.gist .line-numbers
		{
			width: 4em !important;
		}
		.gist .line,
		.gist .line-number
		{
			font-size: 12px !important;
			height: 18px !important;
			line-height: 18px !important;
		}
		.gist .line
		{
			white-space: pre !important;
			width: auto !important;
			word-wrap: normal !important;
		}
		.gist .line span
		{
			word-wrap: normal !important;
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

		// required
		if ( isset( $p['name'] ) && $p['name'] ) {
			$name = $p['name'];
		} else {
			return is_feed() ? '' : self::get_embed_failure();
		}

		// required
		if ( isset( $p['repo'] ) && $p['repo'] ) {
			$repo = $p['repo'];
		} else {
			return is_feed() ? '' : self::get_embed_failure();
		}

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

		$url = implode(
			'/',
			array(
				self::TRAVIS_URL_PREFIX,
				$name,
				$repo,
				$type,
				$id
			)
		);

		$html_id = "$type-$id";

		// optional
		if ( isset( $p['line'] ) && $p['line'] ) {
			$line = $p['line'];
			$url .= '#L' . $line;
			$html_id .= "-L$line";
			$line_option =  " data-line=\"$line\"";
		} else {
			$line_option = '';
		}

		$noscript = Travis::get_noscript( $url );

		return is_feed() ? $noscript : "<div id=\"$html_id\" class=\"embed-travis\" data-name=\"$name\" data-repo=\"$repo\" data-$type=\"$id\"$line_option><noscript>$noscript</noscript></div>";
	}

	public static function get_noscript( $url ) {
		return sprintf(
			__( 'View the build log on <a href="%s">Travis CI</a>.', 'embed-travis' ),
			esc_url( $url )
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
