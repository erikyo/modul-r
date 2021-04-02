// WooCommerce category accordion
jQuery(document).ready(function($) {

  if ($('.sidebar ul.product-categories').length > 0) {

    $('.sidebar .product-categories li.cat-parent > a').prepend('<span class="toggle"><i class="material-icons has-primary-color">arrow_forward</i></span>');
    $('.sidebar .product-categories .children').hide();
    $('.sidebar .product-categories li.current-cat-parent > .children, .product-categories li.current-cat > .children').show();
    $('.sidebar .product-categories li.current-cat, .product-categories li.current-cat-parent').addClass('active');

    $(function () {

      $('.sidebar .product-categories').find('a').on('click', function (e) {

        const catItem = $(this).parent('.cat-item');

        if ( ! catItem.hasClass('active')) {

          catItem.addClass('active');

          if ( catItem.hasClass('cat-parent') || catItem.hasClass('current-cat')) {
            e.preventDefault();
          }

          $(this).parents('li.cat-parent').siblings().removeClass('active');

          $(this).siblings('.children').stop(true, true).slideToggle()
            .parents('.cat-item').siblings().children('.children').stop(true, true).slideUp();

        }

      });

    });

  }

});