$(document).ready(function(){
    //top slider
    if($('div').is('#slider-container') && document.getElementsByClassName('slider-item').length>1) {
        $('#slider-container').mobilyslider({
            content: '.ws_images', // селектор для слайдера
            children: 'div', // селектор для дочерних элементов
            transition: 'horizontal', // переходы: horizontal, vertical, fade
            animationSpeed: 500, // скорость перехода в миллисекундах
            autoplay: true,
            autoplaySpeed: 5000, // время между переходами (миллисекунды)
            pauseOnHover: true, // останавливать навигацию при наведении на слайдер: false, true
            bullets: true, // генерировать навигацию (true/false, class: sliderBullets)
            arrows: true, // генерировать стрелки вперед и назад (true/false, class: sliderArrows)
            arrowsHide: true, // показывать стрелки только при наведении
            prev: 'ws_prev', // название класса для кнопки назад
            next: 'ws_next', // название класса для кнопки вперед
            animationStart: function () {
            }, // вызывать функцию при старте перехода
            animationComplete: function () {
                var index;
                setTimeout(function() {
                    index = $('.sliderBullets').find('.active').index();
                    $('.hero-slider-thumbs').find('.is-active').removeClass('is-active');
                    $('.hero-slider-thumb:eq('+(index)+')').addClass('is-active');
                }, 100);
            } // вызывать функцию когда переход завершен
        });
    }
    $('.hero-slider-thumb:eq(0)').addClass('is-active');

    $('.merchant-logo').click(function(e){
        e.preventDefault();
        var index = $(this).attr('data-num');
        $('.sliderBullets a:eq('+(index)+')').click();
    });


    //hide more-btn
    if(document.getElementsByClassName('promocode-item').length < 15){
        $('#more-btn').css('display', 'none');
    }

    //hide promocode
    $('#overlaymodal-bg').click(function(event){
        if(event.target.id == 'overlaymodal-bg' || event.target.id == 'close'){
            $('#overlaymodal-bg').css('display', 'none');
        };
    });

    //display promocode link
    $('#promocodes-cont').on('click', '.js-couponlink', function(){
        window.open($(this).attr('data-link'));
    });

    //more promocodes
    $('#more-btn').click(function(){
        var offset = document.getElementsByClassName('promocode-item').length;
        var category = window.location.pathname.match(/category=(\d+)/) ?
            window.location.pathname.match(/category=(\d+)/)[1]
            : 0;
        var shop = window.location.pathname.match(/shop=(\d+)/) ?
            window.location.pathname.match(/shop=(\d+)/)[1]
            : 0;
        var search = window.location.pathname.match(/search=([\s\S]*)/) ?
            window.location.pathname.match(/search=([\s\S]*)/)[1]
            : 0;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/more='+offset+'&category='+category+'&shop='+shop+'&search='+search, true);
        xhr.send();
        xhr.onload = function(){
            if (xhr.status != 200) {
                console.log('xhr status error: '+xhr.status + ': ' + xhr.statusText);
            } else {
                $('#promocodes-cont').append(xhr.responseText);

                //hidden more-btn
                if(document.getElementsByClassName('promocode-item').length - offset < 15 || !xhr.responseText){
                    $('#more-btn').css('display', 'none');
                }
            }
        };
    });

    //save top shops statistics
    var saveStat = function(id){
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/stat='+id, true);
        xhr.send();
    };
    $('#promocodes-cont').on('click', '.js-couponlink', function(){
        saveStat($(this).attr('data-shop'));
    });
    $('.shop-item').click(function(){
        saveStat($(this).attr('data-shop'));
    });

    //banner img name
    $('#banner-form').on('change', '.banner-img-field', function(){
        $(this).parent().find('.file-name').html($(this)[0].files[0].name);
    });

    //banners save
    if(document.getElementsByClassName('banner-item').length == 1){
        $('#save-banner').css('display', 'none');
    }
    $('#save-banner').click(function(){
        var formData = new FormData(document.forms.banners);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/bannerSave', true);
        xhr.send(formData);
        xhr.onload = function(){
            if (xhr.status != 200) {
                console.log('xhr status error: '+xhr.status + ': ' + xhr.statusText);
            } else {
                location.reload();
            }
        };
    });
    
    //banner remove
    $('#banner-form').on('click', '.delete-banner', function(){
        var id = $(this).parent().attr('data-id');
        var dir = $(this).parent().find('.old-img').val().split('/')[1];
        $(this).parent().remove();
        if(dir && dir !== 'new'){
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/bannerSave&id='+id+'&dir='+dir, true);
            xhr.send();
        }
    });

    //banner add
    $('#create-banner').click(function(){
        $('#save-banner').css('display', 'block');
        $('.banner-clone').clone().removeClass('banner-clone').addClass('banner-new').appendTo('#banner-form');
        $('.banner-new').find('label').attr('for', 'banner-img-'+(document.getElementsByClassName('banner-item').length-2));
        $('.banner-new').find('#banner-img-').attr('id', 'banner-img-'+(document.getElementsByClassName('banner-item').length-2));
        $('.banner-new').removeClass('banner-new');
    });

});