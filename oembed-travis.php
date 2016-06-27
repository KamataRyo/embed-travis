<?php
/*
Plugin Name: oEmbed Travis
Plugin URI: https://github.com/KamataRyo/oembed-travis
Description: Embed your build logs on Travis CI into WordPress easily. Discuss on your history:)
Author: KamataRyo
Version: 0.3.6
Author URI: http://biwako.io/
*/

$e_travis = new Travis();
$e_travis->register();


class Travis
{
    private $shotcode_tag = 'travis';
    private $regex = '/^https:\/\/travis-ci\.org\/([a-zA-Z-_0-9]+)\/([a-zA-Z-_0-9]+)\/((builds)|(jobs))\/[1-9][0-9]*(#L[1-9][0-9]*)?$/';
    const TRAVIS_URL_PREFIX = 'https://travis-ci.org';

    public function register()
    {
        add_action('plugins_loaded', [$this, 'plugins_loaded']);
    }

    public function plugins_loaded()
    {
        add_action('wp_enqueue_scripts', [$this, 'enquene_script']);
        add_action('wp_head', [$this, 'wp_head']);

        load_plugin_textdomain(
            'oembed-travis',
            false,
            plugins_url(implode(['languages'], DIRECTORY_SEPARATOR), __FILE__)
        );

        wp_embed_register_handler(
            'oembed-travis',
            $this->get_travis_url_regex(),
            [$this, 'handler']
        );

        add_shortcode($this->get_shortcode_tag(), [$this, 'shortcode']);
    }

    public function enquene_script()
    {
        wp_register_script(
            'oembed-travis-script',
            plugins_url(implode(['js', 'oembed-travis.js'], DIRECTORY_SEPARATOR), __FILE__),
            ['jquery'],
            '',
            true
        );
        wp_enqueue_script('jquery');
        wp_enqueue_script('oembed-travis-script');
    }

    public function wp_head()
    {
        ?>
	<style>
		.oembed-travis {
			margin: 1em .5em 2em;
		}
		.travis-log-body .travis-pre {
			height: 350px;
			border: none;
			margin: 0;
			padding: 1em 0;
			background-color: #222;
			font-family: Monaco, monospace;
			font-size: .75em !important;
			color: #f1f1f1;
			white-space: pre-wrap;
			overflow-y: scroll;
		}
		.travis-log-body div, .travis-log-body span {
			font-size: 1em;
		}
		.travis-log-body a {
			color: #666;
			display: inline-block;
			padding-right: .5em;
			width: 4.5em;
			text-align: right !important;
			margin-right: 0;
			margin-left: -4.5em;
			font-size: 1em;
			text-decoration: none !important;
			box-shadow:none;
		}
		.travis-log-body p {
			position: relative;
			padding: 0 1em 0 4.5em;
			margin: 0;
			font-size: 1em;
		}
		.travis-given-active-line {
			background-color: #888!important;
		}
		.travis-log-body p:hover, .travis-log-body .travis-active-line{
			background-color: #444!important;
		}
		.travis-log-body p:hover span[style*="background-color:#222"] {
				background-color: #444!important;
		}
		.travis-log-body p:hover .travis-info {
			opacity:0;
		}
		.travis-given-active-line.travis-active-line {
			background-color: #888!important;
		}
		.travis-log-body p.travis-fold-open a:before{
			content: "\25B6";
			color: #666;
			font-fize: .75em;
			position: absolute;
			left: .5em;
		}
		.travis-log-body p.travis-fold-open a, .travis-log-body p.travis-fold-close a {
			cursor: pointer;
		}
		.travis-log-body p.travis-fold-close a:before{
			content: "\25BC";
			color: #666;
			position: absolute;
			left: .5em;
		}
		.travis-info {
			position: absolute;
			display: block;
			top: 1px;
			padding: 2px 7px;
			line-height: 1em;
			background-color: #666;
			border-radius: 1em;
			color: #bbb;
			text-align: right;
		}
		.travis-fold-start {
			right: 5.5em;
		}
		.travis-time-start {
			right: 1em;
		}
		.travis-log-footer {
			padding: .25em 1em .25em;
			background-color: #444;
		}
		.travis-footer-text {
			font-family: "Source Sans Pro",Helvetica,sans-serif;
			font-weight: normal;
			font-size: 1em;
			text-align:right;
			color: #f1f1f1;
			margin: 0;
		}
		.travis-log-footer a.travis-link-text {
			color: #ffffb6;
			text-decoration: none;
		}

		.travis-label-on-MCE {
			display: none;
		}
	</style>
	<?php

    }

    public function handler($m, $attr, $url, $rattr)
    {
        $url = $m[0];
        $author = $m[1];
        $repo = $m[2];
        $type = $m[3];

        $url_parsed = parse_url($url);
        $path_parsed = explode('/', $url_parsed['path']);
        $id = $path_parsed[4];

        if (isset($url_parsed['fragment']) && $url_parsed['fragment']) {
            $fragment = $url_parsed['fragment'];
            $match = preg_match(
                '/^L[1-9][0-9]*$/',
                $fragment
            );
            if ($match > 0) {
                $line = substr($fragment, 1, strlen($fragment) - 1);
            } else {
                $line = 0;
            }
        } else {
            $line = null;
        }

        return $this->shortcode([
            'url'    => $url,
            'author' => $author,
            'repo'   => $repo,
            $type    => $id,
            'line'   => $line,
        ]);
    }

    public function shortcode($p)
    {

        // parse required attributes.
        // One of two are required
        if (isset($p['builds']) && $p['builds']) {
            $type = 'builds';
            $id = $p['builds'];
        } elseif (isset($p['jobs']) && $p['jobs']) {
            $type = 'jobs';
            $id = $p['jobs'];
        } else {
            return is_feed() ? '' : self::get_embed_failure();
        }

        if (!self::is_positive_int($id)) {
            return is_feed() ? '' : self::get_embed_failure();
        }
        $html_id = "$type-$id";

        // parse optional attributes
        $url = null;
        if (isset($p['url']) && $p['url']) {
            $url = $p['url'];
        }

        $author = null;
        if (isset($p['author']) && $p['author']) {
            $author = $p['author'];
        }

        $repo = null;
        if (isset($p['repo']) && $p['repo']) {
            $repo = $p['repo'];
        }

        $line = null;
        $line_hash = '';
        if (isset($p['line']) && $p['line']) {
            $line = $p['line'];
            if (!self::is_positive_int($line)) {
                return is_feed() ? '' : self::get_embed_failure();
            }
            $html_id .= "-L$line";
            $line_hash = "#L$line";
        }

        $noscript = self::get_noscript($url);
        $admin_label = self::get_editor_label();

        return is_feed() ? $noscript : self::create_tag(
            'div',
            [
                'id'          => $html_id,
                'class'       => 'oembed-travis',
                'data-url'    => $url,
                'data-author' => $author,
                'data-repo'   => $repo,
                "data-$type"  => $id,
                'data-line'   => $line,
            ],
            $admin_label.$noscript
        ); // xss ok
    }

    /**
     * create tag with attributes.
     */
    private static function create_tag($tagname, $attributes, $content)
    {
        $tagname = esc_html($tagname);
        $attribute_strings = [''];
        foreach ($attributes as $key => $value) {
            if (null !== $value) {
                $key = esc_attr($key);
                $value = esc_attr($value);
                if ('' === $value) {
                    array_push($attribute_strings, $key);
                } else {
                    array_push($attribute_strings, "$key=\"$value\"");
                }
            }
        }

        return "<$tagname".implode(' ', $attribute_strings).">$content</$tagname>";
    }

    public static function get_noscript($url)
    {
        return '<noscript><a href="'.esc_url($url).'">'.esc_url($url).'</noscript>';
    }

    public static function get_editor_label()
    {
        return is_admin() ?
            '<span class="travis-label-on-MCE">{{embeded build log}}</span>' :
            '';
    }

    private static function is_positive_int($arg)
    {
        if (!is_numeric($arg)) {
            return false;
        } elseif (0 !== $arg - (int) $arg) {
            return false;
        } elseif (1 > $arg) {
            return false;
        }
        {
            return true;
        }
    }

    public static function get_embed_failure()
    {
        return '<div class="oembed-travis-invalid"></div>';
    }

    public function get_travis_url_regex()
    {
        return $this->regex;
    }

    private function get_shortcode_tag()
    {
        return apply_filters('embed_travis_shortcode_tag', $this->shotcode_tag);
    }
}


// EOF
