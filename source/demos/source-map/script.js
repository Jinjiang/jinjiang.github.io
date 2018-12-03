function formatUrl(url) {
    var regexp = /^(http|https)\:\/\//
    if (!url.match(regexp)) {
        url = 'http://' + url
    }
    return url
}
