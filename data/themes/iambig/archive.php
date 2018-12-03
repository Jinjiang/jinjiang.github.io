<?php $this->need('header.php'); ?>

<?php if ($this->have()): ?>
<?php while($this->next()): ?>
<div class="content">
    <h2><a href="<?php $this->permalink() ?>"><?php $this->title() ?></a></h2>
    <?php $this->content('阅读剩余部分...'); ?>
</div>
<?php endwhile; ?>
<?php else: ?>
<div class="content">
    <h2><?php _e('没有找到内容'); ?></h2>
</div>
<?php endif; ?>

<?php $this->pageNav(); ?>

<?php $this->need('sidebar.php'); ?>
<?php $this->need('footer.php'); ?>
