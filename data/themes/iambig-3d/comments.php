<div id="comments">
    <?php $this->comments()->to($comments); ?>
    <?php if ($comments->have()): ?>
	<h2><?php $this->commentsNum(_t('当前暂无评论'), _t('仅有一条评论'), _t('已有 %d 条评论')); ?> &raquo;</h2>
    
    <?php $comments->pageNav(); ?>
    
    <?php $comments->listComments(); ?>
    
    <?php endif; ?>

    <?php if($this->allow('comment')): ?>
    <div id="<?php $this->respondId(); ?>" class="respond">
    
    <div class="cancel-comment-reply">
    <?php $comments->cancelReply(); ?>
    </div>
    
	<h2 id="response"><?php _e('添加新评论'); ?> &raquo;</h2>
	<form method="post" action="<?php $this->commentUrl() ?>" id="comment_form">
        <?php if($this->user->hasLogin()): ?>
		<p>
            <a href="<?php $this->options->logoutUrl(); ?>" title="Logout" style="float: right;"><?php _e('退出'); ?> &raquo;</a>
            <a href="<?php $this->options->profileUrl(); ?>"><?php $this->user->screenName(); ?></a> 童鞋教导我们：
        </p>
        <?php else: ?>
		<p>
            <label for="author"><?php _e('称呼'); ?><span class="required">*</span></label>
			<input type="text" name="author" id="author" class="text" size="15" value="<?php $this->remember('author'); ?>" />
		</p>
		<p>
            <label for="mail"><?php _e('电子邮件'); ?><?php if ($this->options->commentsRequireMail): ?><span class="required">*</span><?php endif; ?></label>
			<input type="text" name="mail" id="mail" class="text" size="15" value="<?php $this->remember('mail'); ?>" />
		</p>
		<p>
            <label for="url"><?php _e('网站'); ?><?php if ($this->options->commentsRequireURL): ?><span class="required">*</span><?php endif; ?></label>
			<input type="text" name="url" id="url" class="text" size="15" value="<?php $this->remember('url'); ?>" />
		</p>
        <?php endif; ?>
		<p><textarea rows="5" cols="40" name="text" class="textarea"><?php $this->remember('text'); ?></textarea></p>
		<p><button><?php _e('提交评论'); ?></button> (请至少包含一个汉字，且汉字不能比日本字少)</p>
	</form>
    </div>
    <?php else: ?>
    <h2><?php _e('评论已关闭'); ?></h2>
    <?php endif; ?>
</div>
