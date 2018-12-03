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
    
    <!-- <h2 id="response"><?php _e('添加新评论'); ?> &raquo;</h2> -->
    <h3 id="response"><?php _e('抱歉暂不支持添加新评论'); ?></h3>
    <!-- form method="post" action="<?php $this->commentUrl() ?>" id="comment_form" class="pure-form">
        <?php if($this->user->hasLogin()): ?>
        <fieldset>
            <a href="<?php $this->options->profileUrl(); ?>"><?php $this->user->screenName(); ?></a> 童鞋教导我们：
            <a class="pure-button" style="font-size: 70%; vertical-align: top; background: rgb(223, 117, 20); color: white;" href="<?php $this->options->logoutUrl(); ?>" title="Logout"><?php _e('退出'); ?></a>
        </fieldset>
        <?php else: ?>
        <fieldset class="pure-group">
            <input type="text" name="author" id="author" placeholder="<?php _e('称呼'); ?>" required value="<?php $this->remember('author'); ?>">
            <input type="email" name="mail" id="mail" placeholder="<?php _e('电子邮件'); ?>"<?php if ($this->options->commentsRequireMail): ?> required<?php endif; ?> value="<?php $this->remember('mail'); ?>">
            <input type="url" name="url" id="url" placeholder="<?php _e('网站'); ?>"<?php if ($this->options->commentsRequireURL): ?> required<?php endif; ?> value="<?php $this->remember('url'); ?>">
        </fieldset>
        <?php endif; ?>
        <fieldset>
            <textarea rows="5" name="text" class="textarea" style="max-width: 30em; width: 100%;"><?php $this->remember('text'); ?></textarea>
        </fieldset>
        <fieldset>
            <button class="pure-button pure-button-primary"><?php _e('提交评论'); ?></button> (请至少包含一个汉字)
        </fieldset>
    </form -->
    </div>
    <?php else: ?>
    <h2><?php _e('评论已关闭'); ?></h2>
    <?php endif; ?>
</div>
