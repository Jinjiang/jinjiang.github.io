<!DOCTYPE html>
<html>
<head>
<!-- proud for contributing Vue.js -->
<meta charset="utf-8">
<meta name="format-detection" content="telephone=no"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-touch-fullscreen" content="yes"/>

<link rel="shortcut icon" href="/faviconx.ico" type="image/x-icon" />
<link rel="icon" sizes="any" mask href="/faviconx.ico">

<title><?php $this->archiveTitle(' &raquo; ', '', ' - '); ?><?php $this->options->title(); ?></title>
<link rel="stylesheet" type="text/css" href="<?php $this->options->themeUrl('pure.css'); ?>" />
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
        <a href="/" title="<?php $this->options->title() ?>"><?php $this->options->title(); ?></a>
    </h1>
    <p class="description">
        <?php $this->options->description() ?>
    </p>
</div>
<div id="nav" class="pure-menu pure-menu-open pure-menu-horizontal">
    <ul>
        <!--li<?php if($this->is('index')): ?> class="pure-menu-selected"<?php endif; ?>>
            <a href="/">
                <?php _e('首页'); ?></a>
        </li-->
        <li><a href="//res.jiongks.name/" title="藏品">藏品</a></li>
        <?php $this->widget('Widget_Contents_Page_List')->to($pages); ?>
        <?php while($pages->next()): ?>
        <li<?php if($this->is('page', $pages->slug)): ?>  class="pure-menu-selected"<?php endif; ?>>
            <a href="<?php $pages->permalink(); ?>" title="<?php $pages->title(); ?>">
                <?php $pages->title(); ?></a>
        </li>
        <?php endwhile; ?>
    </ul>
</div>

<div id="main">
