<?php
/**
 * Template part for displaying post archives and search results
 */

?>

<div class="article-container">
  <article id="post-<?php the_ID(); ?>" <?php post_class( array('main-width') ); ?>>

    <?php modul_r_post_image(); ?>

    <div class="article-wrapper<?php if( is_sticky() && is_home() && ! is_paged() ) {echo ' sticky';}  ?>">

      <header class="entry-header">
        <?php the_title( sprintf( '<h2 class="entry-title secondary-color"><a href="%s" rel="bookmark">', get_permalink() ), '</a></h2>' ); ?>
      </header><!-- /entry-header -->

      <div class="entry-content">
          <?php the_excerpt(); ?>
      </div><!-- /entry-content -->

      <footer class="entry-footer">
          <?php modul_r_meta(); ?>
      </footer>

    </div>
  </article>
</div>