</div>

<div id="footer">
    <a href="<?php $this->options->siteurl(); ?>"><?php $this->options->title(); ?></a> <?php _e('is powered by'); ?> <a href="http://www.typecho.org">Typecho)))</a><br /><a href="<?php $this->options->feedUrl(); ?>"><?php _e('文章'); ?> RSS</a> and <a href="<?php $this->options->commentsFeedUrl(); ?>"><?php _e('评论'); ?> RSS</a>
    <?php $this->footer(); ?>
</div>

</div>

<script>
    if (document.querySelectorAll && [].forEach &&
            document.body.classList && document.body.getBoundingClientRect) {
        (function () {
            [].slice.apply(
                document.querySelectorAll('.page-navigator a')).
                    forEach(function (page) {
                        page.classList.add('button-3d')
                    })

            var timer,
                btns = [].slice.apply(document.querySelectorAll(
                    'button,' + 'input[type="button"],' +
                    'input[type="submit"], .button-3d'))

            function initBtns() {
                var halfWidth = window.innerWidth / 2;
                var halfHeight = window.innerHeight / 2;

                btns.forEach(function (btn) {
                    var clientRect = btn.getBoundingClientRect()

                    if (clientRect.left > halfWidth) {
                        btn.classList.add('alter-door')
                    }
                    else {
                        btn.classList.remove('alter-door')
                    }

                    if (clientRect.top > halfHeight) {
                        btn.classList.add('alter-floor')
                    }
                    else {
                        btn.classList.remove('alter-floor')
                    }
                })
            }

            function init() {
                clearTimeout(timer)
                timer = setTimeout(initBtns, 100)
            }

            window.onresize = init
            document.body.onscroll = init

            initBtns()
        })()
    }
</script>

</body>
</html>
