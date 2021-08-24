<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta http-equiv="content-type" content="<?php bloginfo('html_type') ?>; charset=<?php bloginfo('charset') ?>" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <?php wp_head(); ?>
  <?php if ( is_singular() && pings_open( get_queried_object() ) ) : ?>
    <link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
  <?php endif;
  ?>
</head>

<body <?php body_class(); ?>>

  <?php wp_body_open(); ?>

  <div id="page" class="site">

    <a class="skip-link screen-reader-text" href="#main">
      <?php esc_html_e( 'Skip to content', 'modul-r' ); ?>
    </a>

    <?php get_template_part( 'template-parts/header/header' ); ?>

      <?php if ( is_front_page() && !is_home() ) {
        modul_r_hero_image();
      } else if ( !( class_exists( 'WooCommerce' ) && is_product() ) && (is_single() || is_page()) ) {
          if ( has_post_thumbnail() ) {
            echo '<div class="hero" >';
            modul_r_post_image('parallax', true);
            echo '</div>';
          }
      } else if ( !( class_exists( 'WooCommerce' ) && is_product_category() ) && is_archive() ) {
          modul_r_archive_image('parallax', true);
      }?>

    <div id="content" class="site-content">
