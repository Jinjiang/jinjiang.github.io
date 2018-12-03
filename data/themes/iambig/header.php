<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="viewport" content="width=device-width">
<title><?php $this->archiveTitle(' &raquo; ', '', ' - '); ?><?php $this->options->title(); ?></title>
<link rel="stylesheet" type="text/css" href="<?php $this->options->themeUrl('style.css'); ?>" />
<!--[if IE 6]>
    <link rel="stylesheet" type="text/css" href="<?php $this->options->themeUrl('style-ie.css'); ?>" />
<![endif]-->
<!-- 通过自有函数输出HTML头部信息 -->
<?php $this->header(); ?>
</head>

<body>

<div id="wrapper">

<div id="header">
    <h1>
        <a href="<?php $this->options->siteUrl(); ?>" title="<?php $this->options->title() ?>"><?php $this->options->title(); ?></a>
        <sup>(Beta)</sup>
    </h1>
    <p class="description">
        <?php $this->options->description() ?>
    </p>
</div>

<form id="search" method="post" action="/">
    <input type="text" name="s" class="text" size="20" />
    <input type="submit" class="submit" value="<?php _e('搜索'); ?>" />
</form>

<div id="nav">
    <a href="<?php $this->options->siteUrl(); ?>"<?php if($this->is('index')): ?> class="current"<?php endif; ?>><?php _e('首页'); ?></a>
    <?php $this->widget('Widget_Contents_Page_List')->to($pages); ?>
    <?php while($pages->next()): ?>
    <a href="<?php $pages->permalink(); ?>" title="<?php $pages->title(); ?>"<?php if($this->is('page', $pages->slug)): ?> class="current"<?php endif; ?>><?php $pages->title(); ?></a>
    <?php endwhile; ?>
</div>

<div id="content">
