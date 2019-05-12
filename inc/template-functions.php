<?php

if ( ! function_exists('print_post_image') ) :
	function print_post_image() {
      if ( has_post_thumbnail()) : // Check if Thumbnail exists ?>
          <div class="interactive featured-image">
              <?php the_post_thumbnail('fullwidth', array('class' => 'fit-image wp-post-image')); ?>
          </div>
      <?php endif;
	}
endif;

if ( ! function_exists( 'print_post_nav' ) ) :
	function print_post_nav() {
		$pagination = get_the_posts_pagination( array(
			'mid_size'  => 5,
			'prev_text' => "Back",
			'next_text' => "Next",
		) );

		return $pagination;
  }
endif;


if ( ! function_exists('print_comments') ) :
	function print_comments() {

		// If comments are open or we have at least one comment, load up the comment template.
		if ( comments_open() || get_comments_number() ) {
			comments_template();
		}

	}
endif;


if ( ! function_exists('print_tags') ) :
	function print_tags() {

		if( has_tag() ): ?>
			<div class="tags">
				<h4>Tag:</h4>
				<?php the_tags( '<li class="tag">', '</li><li class="tag">', '</li>');  ?>
			</div>
		<?php endif;

	}
endif;


if ( ! function_exists('print_footer_meta') ) :
	function print_footer_meta() {

		?>
    <div class="meta-wrapper">
      <a href="<?php echo get_author_posts_url( get_the_author_meta( 'ID' ), get_the_author_meta( 'user_nicename' ) ); ?>">
        <p>
          <i class="material-icons">person</i>
          <?php the_author_meta( 'display_name' ); ?>
        </p>
      </a>
      <a href="<?php echo get_day_link( get_the_time('Y'), get_the_time('m'), get_the_time('d') ); ?>">
        <p>
          <i class="material-icons">calendar_today</i>
          <time datetime="<?php the_time('Y-m-d'); ?> <?php the_time('H:i'); ?>">
            <?php the_date(); ?> <?php the_time(); ?>
          </time>
        </p>
      </a>
      <p>
        <i class="material-icons">comment</i>
        Commenti: <?php print_r(get_comment_count()['approved']); ?>
      </p>
    </div>
		<?php

	}
endif;