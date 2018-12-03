<div id="sidebar" class="pure-g-r">

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowOther', $this->options->sidebarBlock)): ?>
    <!--?php WufooForm_Plugin::output(); ?-->
    <?php endif; ?>

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowOther', $this->options->sidebarBlock)): ?>
    <!--div class="widget pure-u-1-3">
        <h3><?php _e('广告'); ?></h3>
        <p style="padding: 0 20px;">我发起的开源项目<br>
        <a href="http://jinjiang.github.com/h5slides/" target="_blank">H5Slides</a><br>
        <a href="http://zorro.io/" target="_blank">Zorro</a><br>
        欢迎了解</p>
    </div-->
    <?php endif; ?>

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowRecentPosts', $this->options->sidebarBlock)): ?>
    <div class="widget large pure-u-2-3">
		<h3><?php _e('最新文章'); ?></h3>
        <ul>
            <?php $this->widget('Widget_Contents_Post_Recent')
            ->parse('<li><a href="{permalink}">{title}</a></li>'); ?>
        </ul>
    </div>
    <?php endif; ?>

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowRecentComments', $this->options->sidebarBlock)): ?>
    <div class="widget large pure-u-2-3">
		<h3><?php _e('最近回复'); ?></h3>
        <ul>
        <?php $this->widget('Widget_Comments_Recent')->to($comments); ?>
        <?php while($comments->next()): ?>
            <li><a href="<?php $comments->permalink(); ?>"><?php $comments->author(false); ?></a>: <?php $comments->excerpt(50, '...'); ?></li>
        <?php endwhile; ?>
        </ul>
    </div>
    <?php endif; ?>

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowCategory', $this->options->sidebarBlock)): ?>
    <!--div class="widget pure-u-1-3">
		<h3><?php _e('分类'); ?></h3>
        <ul>
            <?php $this->widget('Widget_Metas_Category_List')
            ->parse('<li><a href="{permalink}">{name}</a> ({count})</li>'); ?>
        </ul>
	</div-->
    <?php endif; ?>

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowArchive', $this->options->sidebarBlock)): ?>
    <!--div class="widget pure-u-1-3">
		<h3><?php _e('归档'); ?></h3>
        <ul>
            <?php $this->widget('Widget_Contents_Post_Date', 'type=month&format=F Y')
            ->parse('<li><a href="{permalink}">{date}</a></li>'); ?>
        </ul>
	</div-->
    <?php endif; ?>

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowOther', $this->options->sidebarBlock)): ?>
    <!--div class="widget large pure-u-2-3">
        <h3><?php _e('链接'); ?></h3>
        <ul>
            <?php Links_Plugin::output(); ?>
        </ul>
    </div-->
    <?php endif; ?>

    <?php if (empty($this->options->sidebarBlock) || in_array('ShowOther', $this->options->sidebarBlock)): ?>
	<div class="widget pure-u-2-3">
		<h3><?php _e('其它'); ?></h3>
        <ul>
            <?php if($this->user->hasLogin()): ?>
				<li class="last"><a href="<?php $this->options->adminUrl(); ?>"><?php _e('进入后台'); ?> (<?php $this->user->screenName(); ?>)</a></li>
                <li><a href="<?php $this->options->logoutUrl(); ?>"><?php _e('退出'); ?></a></li>
            <?php else: ?>
                <li class="last"><a href="<?php $this->options->adminUrl('login.php'); ?>"><?php _e('登录'); ?></a></li>
            <?php endif; ?>
            <li><a href="http://validator.w3.org/check/referer">Valid XHTML</a></li>
            <li><a href="http://www.typecho.org">Typecho</a></li>
        </ul>
	</div>
    <?php endif; ?>


</div>
