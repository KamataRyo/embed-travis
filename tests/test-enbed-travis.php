<?php

class EmbedTravis_Test extends WP_UnitTestCase
{
	/**
	 * Add post and post to be set current.
	 *
	 * @param  array $args A hash array of the post object.
	 * @return none
	 */
	public function setup_postdata( $args )
	{
		global $post;
		global $wp_query;

		$wp_query->is_singular = true;

		$post_id = $this->factory->post->create( $args );
		$post = get_post( $post_id );
		setup_postdata( $post );
	}

	/**
	 * @test
	 */
	public function shortcode_test()
	{
		$this->assertRegExp(
			'/^(<div id="builds-126275217" class="embed-travis" data-name="KamataRyo" data-repo="nationalpark-map" data-builds="126275217"><noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis name="KamataRyo" repo="nationalpark-map" builds="126275217"]' )
		);

		$this->assertRegExp(
			'/^(<div id="jobs-130318268" class="embed-travis" data-name="KamataRyo" data-repo="inherit-theme-mods" data-jobs="130318268"><noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis name="KamataRyo" repo="inherit-theme-mods" jobs="130318268"]' )
		);

		$this->assertRegExp(
			'/^(<div id="builds-126275217-L120" class="embed-travis" data-name="KamataRyo" data-repo="nationalpark-map" data-builds="126275217" data-line="120"><noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis name="KamataRyo" repo="nationalpark-map" builds="126275217" line="120"]' )
		);

		$this->assertRegExp(
			'/^(<div id="jobs-130318268-L145" class="embed-travis" data-name="KamataRyo" data-repo="inherit-theme-mods" data-jobs="130318268" data-line="145"><noscript>).*(<\/noscript><\/div>)$/',
			do_shortcode( '[travis name="KamataRyo" repo="inherit-theme-mods" jobs="130318268" line="145"]' )
		);

	}

	/**
	 * build with single job, without line
	 *
	 * @test
	 */
	public function the_content_01()
	{
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/builds/126275217';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="builds-126275217" class="embed-travis" data-name="KamataRyo" data-repo="nationalpark-map" data-builds="126275217"><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}

	/**
	 * build one of jobs, without line
	 *
	 * @test
	 */
	public function the_content_02()
	{
		$url = 'https://travis-ci.org/KamataRyo/inherit-theme-mods/jobs/130318268';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="jobs-130318268" class="embed-travis" data-name="KamataRyo" data-repo="inherit-theme-mods" data-jobs="130318268"><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}

	/**
	 * build with single job, with line
	 *
	 * @test
	 */
	public function the_content_03()
	{
		$url = 'https://travis-ci.org/KamataRyo/nationalpark-map/builds/126275217#L120';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="builds-126275217-L120" class="embed-travis" data-name="KamataRyo" data-repo="nationalpark-map" data-builds="126275217" data-line="120"><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}

	/**
	 * build one of jobs, with line
	 *
	 * @test
	 */
	public function the_content_04()
	{
		$url = 'https://travis-ci.org/KamataRyo/inherit-theme-mods/jobs/130318268#L145';
		$noscript = Travis::get_noscript( $url );

		$this->setup_postdata( array(
			'post_content' => $url,
		) );

		$this->expectOutputString('<div id="jobs-130318268-L145" class="embed-travis" data-name="KamataRyo" data-repo="inherit-theme-mods" data-jobs="130318268" data-line="145"><noscript>' . $noscript . '</noscript></div>'."\n");

		the_content();
	}


}
