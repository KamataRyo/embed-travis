<?php

class EmbedTravis_Test extends WP_UnitTestCase {
	/**
	 * Add post and post to be set current.
	 *
	 * @param  array $args A hash array of the post object.
	 * @return none
	 */
	public function setup_postdata( $args ) {
		global $post;
		global $wp_query;

		$wp_query->is_singular = true;

		$post_id = $this->factory->post->create( $args );
		$post = get_post( $post_id );
		setup_postdata( $post );
	}

	/**
	 * shortcode execution finished successfully.
	 *
	 * @test
	 */
	public function shortcode_test_success() {
		$this->assertRegExp(
			'/^(<div id="builds-126275217" class="oembed-travis" data-builds="126275217">).*(<noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis builds="126275217"]' )
		);

		$this->assertRegExp(
			'/^(<div id="jobs-130318268" class="oembed-travis" data-jobs="130318268">).*(<noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis jobs="130318268"]' )
		);

		$this->assertRegExp(
			'/^(<div id="builds-126275217-L120" class="oembed-travis" data-builds="126275217" data-line="120">).*(<noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis builds="126275217" line="120"]' )
		);

		$this->assertRegExp(
			'/^(<div id="jobs-130318268-L145" class="oembed-travis" data-jobs="130318268" data-line="145">).*(<noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis jobs="130318268" line="145"]' )
		);

	}
	/**
	 * shortcode execution fails.
	 *
	 * @test
	 */
	public function shortcode_test_failure() {

		// no id
		$this->assertSame(
			Travis::get_embed_failure(),
			do_shortcode( '[travis]' )
		);

		//invalid job or build values
		$values = array(
			'-12345',
			'34566.3',
			'string'
		);
		foreach ($values as $value) {
			$this->assertSame(
				Travis::get_embed_failure(),
				do_shortcode( '[travis builds="' . $value . '"]' )
			);

			$this->assertSame(
				Travis::get_embed_failure(),
				do_shortcode( '[travis jobs="' . $value . '"]' )
			);
		}

		// invalid line value
		$values = array(
			'-10',
			'4.5',
			'string'
		);
		foreach ($values as $value) {
			$this->assertSame(
				Travis::get_embed_failure(),
				do_shortcode( '[travis builds="126275217" line="' . $value . '"]' )
			);
		}
	}

	/**
	 * build with single job, without line
	 *
	 * @test
	 */
	public function the_content_01() {
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/builds/126275217';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="builds-126275217" class="oembed-travis" data-url="' . $url . '" data-author="KamataRyo" data-repo="nationalpark-map" data-builds="126275217"><span class="travis-label-on-MCE">{{embed Travis CI build log}}</span><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}

	/**
	 * build one of jobs, without line
	 *
	 * @test
	 */
	public function the_content_02() {
		$url = 'https://travis-ci.org/KamataRyo/inherit-theme-mods/jobs/130318268';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="jobs-130318268" class="oembed-travis" data-url="' . $url . '" data-author="KamataRyo" data-repo="inherit-theme-mods" data-jobs="130318268"><span class="travis-label-on-MCE">{{embed Travis CI build log}}</span><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}

	/**
	 * build with single job, with line
	 *
	 * @test
	 */
	public function the_content_03() {
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/builds/126275217#L120';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="builds-126275217-L120" class="oembed-travis" data-url="' . $url . '" data-author="KamataRyo" data-repo="nationalpark-map" data-builds="126275217" data-line="120"><span class="travis-label-on-MCE">{{embed Travis CI build log}}</span><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}

	/**
	 * build one of jobs, with line
	 *
	 * @test
	 */
	public function the_content_04() {
		$url = 'https://travis-ci.org/KamataRyo/inherit-theme-mods/jobs/130318268#L145';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="jobs-130318268-L145" class="oembed-travis" data-url="' . $url . '" data-author="KamataRyo" data-repo="inherit-theme-mods" data-jobs="130318268" data-line="145"><span class="travis-label-on-MCE">{{embed Travis CI build log}}</span><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}

	/**
	 * Not match Travis host
	 *
	 * @test
	 */
	public function the_content_failure_01() {
		$url = 'https://example.com/KamataRyo/nationalpark-map/builds/126275217';

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString( '<p>' . $url . '</p>' . "\n" );

		the_content();
	}

	/**
	 * URL lacks directory
	 *
	 * @test
	 */
	public function the_content_failure_02() {
		$url = 'https://travis-ci.org/nationalpark-map/builds/126275217';

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString( '<p>' . $url . '</p>' . "\n" );

		the_content();
	}

	/**
	 * No builds or jobs directories
	 *
	 * @test
	 */
	public function the_content_failure_03() {
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/unknown/126275217';

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString( '<p>' . $url . '</p>' . "\n" );

		the_content();
	}

	/**
	 * With invalid id value
	 *
	 * @test
	 */
	public function the_content_failure_04() {
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/builds/invalid_id_value';

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString( '<p>' . $url . '</p>' . "\n" );

		the_content();
	}

	/**
	 * With invalid hash id value(without 'L' prefix)
	 *
	 * @test
	 */
	public function the_content_failure_05() {
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/builds/126275217#120';

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString( '<p>' . $url . '</p>' . "\n" );

		the_content();
	}

	/**
	 * With invalid hash id value(string)
	 *
	 * @test
	 */
	public function the_content_failure_06() {
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/builds/126275217#string';

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString( '<p>' . $url . '</p>' . "\n" );

		the_content();
	}

}
