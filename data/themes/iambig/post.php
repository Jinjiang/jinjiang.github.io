<?php $this->need('header.php'); ?>

<div class="content">
    <h2><?php $this->title() ?></h2>
    <?php $this->content(); ?>
</div>

<?php $this->need('comments.php'); ?>

<?php $this->need('sidebar.php'); ?>
<?php $this->need('footer.php'); ?>
