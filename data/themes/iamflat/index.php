<?php
/**
 * 立体的大字版皮肤
 * 
 * @package 我被拍平了
 * @author 勾三股四<zhaojinjiang@yahoo.com.cn>
 * @version 1.0.0
 * @link http://jiongks.name/
 */
 
 $this->need('header.php');
 ?>

<?php while($this->next()): ?>
<div class="content">
    <h2>
        <a href="<?php $this->permalink() ?>"><?php $this->title() ?></a>
    </h2>
    <?php $this->content('阅读剩余部分...'); ?>
</div>
<?php endwhile; ?>

<?php $this->pageNav(); ?>

<?php $this->need('sidebar.php'); ?>
<?php $this->need('footer.php'); ?>
