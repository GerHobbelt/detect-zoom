跨浏览器实现检测浏览器缩放
======
------

**基于 https://github.com/yonran/detect-zoom 修改**

主要修改一下几点。
1. 增加对 IE7 的支持
2. 增加支持检测字体缩放的
3. 修改 Webkit 在 Chrome 27+ 上面失效的问题
4. 增加 Demo 演示


Demo
------
http://alphatr.github.io/detect-zoom/

Usage
------
**Detect-zoom 提供了三个方法:**  
* `zoom()`   返回当前屏幕缩放比.  
* `device()`   返回在当前屏幕缩放比下的设备像素比 (Read [more about devicePixelRatio](http://www.quirksmode.org/blog/archives/2012/07/more_about_devi.html) at QuirksMode)
* 'zoomText()' 返回文字的缩放比

```html
<script src="detect-zoom.js"></script>
<script>
    var zoom = detectZoom.zoom();
    var device = detectZoom.device();
    console.log(zoom, device);
</script>
```

**AMD Usage**

```javascript
    require(['detect-zoom'], function(detectZoom){
        var zoom = detectZoom.zoom();
    });
```

Changelog
------
2013/11/16
* 增加对 IE7 的支持
* 增加支持检测字体缩放的
* 修改 Webkit 在 Chrome 27+ 上面失效的问题
* 增加 Demo 演示

2013/1/26 
* Repository moved here
* Refactored most of the code
* Removed support for older browsers
* Added support for AMD and CommonJS

2013/1/27
* Added a fix to Mozilla's (Broken - https://bugzilla.mozilla.org/show_bug.cgi?id=809788) 
implementation of window.devicePixel starting Firefox 18

2013/2/05
* Merged a pull request that fixed zoom on IE being returned X100 (thanks [@kreymerman](https://github.com/kreymerman))
* Refactored the code some more, changed some function names
* Browser dependent main function is created only on initialization (thanks [@jsmaker](https://github.com/jsmaker))
* _Open Issue: Firefox returns `zoom` and `devicePixelRatio` the same. Still looking for a solution here._
* Started versioning - this is version 1.0.0

Help Needed
------

***Detect-zoom is not complete, many parts of the code are 6 to 12 months old and I'm still reviewing them  
I need help testing different browsers, finding betrer ways to measure zoom on problematic browsers (ahm.. Firefox.. ahm)  
patches are more than welcome.***


License
------

Detect-zoom is dual-licensed under the [WTFPL](http://www.wtfpl.net/about/) and [MIT](http://opensource.org/licenses/MIT) license, at the recipient's choice.
