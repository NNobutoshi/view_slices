/*!
* jQuery.view_slices
* version : 1.0.4
* link    : https://github.com/NNobutoshi/view_slices/
* License : MIT
*/

;(function($,window){
  'use strict';
  var
   pluginName     = 'view_slices'
  ,defaultOptions = {
     startComment : '<!-- component -->'
    ,endComment   : '<!-- /component -->'
    ,panelClass   : 'js-vs-panel'
    ,position     : 'fixed' // or 'absolute'
    ,heading      : true
    ,dummyText    : '$dummy'
    ,targetAttrs  : {
       href   : true
      ,src    : true
      ,width  : true
      ,height : true
      ,alt    : true
    }
  }
  ;
  $.fn[pluginName] = function(options){
    var
     $that    = this
    ,settings = $.extend(true,{},defaultOptions,options)
    ;

    for(var o in settings.targetAttrs){
      if(settings.targetAttrs[o]){
        settings.targetAttrs[o] = 'checked="checked"';
      }else{
        settings.targetAttrs[o] = '';
      }
    }

    $.ajax({
       url      : window.location.href
      ,type     : 'GET'
      ,dataType : 'text'
    })
      .done(function(data){
        var
         sources = []
        ;
        data = data.split(settings.startComment);
        for(var i = 1,len = data.length;i < len;i++){
          sources[sources.length] = data[i]
            .split(settings.endComment)[0]
            .replace(/^\r\n/,'')
            .replace(/\r\n$/,'')
            .replace(/^\n/,'')
            .replace(/\n$/,'')
          ;
        }
        $that.each(function(i){
            _init(this,settings,sources[i]);
        });
      })
      .fail(function(){
        alert('error!');
      })
    ;
    return this;
  };

  function _init(element,settings,src){
    var
     $element  = $(element)
    ,$viewbtn  = $('<a href="#" class="js-vs-open js-vs-btn">ソースを表示</a>')
    ,titleText = element.tagName.toLowerCase() + '.' + element.className.replace(' ','.')
    ;

    $element.data(pluginName,src);

    $viewbtn
      .insertAfter(element)
      .on('click',function(){
        _view(src,settings,titleText);
        return false;
      })
    ;
    if(settings.heading === true) {
      $element.before('<div class="js-vs-heading">'+ titleText +'</div>');
    }
  }

  function _view(src,settings,titleText){
    var
     $panel       = $('<div class="'+ settings.panelClass + '" />')
    ,$heading     = $('<p class="js-vs-title">'+ titleText +'</p>')
    ,$replaceBtn  = $('<a class="js-vs-replace js-vs-btn" href="#">テキストを置き換える</a>')
    ,$resetBtn    = $('<a class="js-vs-reset js-vs-btn" href="#">元に戻す</a>')
    ,$closeBtn    = $('<a class="js-vs-close js-vs-btn" href="#">閉じる</a>')
    ,$textArea    = $('<textarea class="js-vs-textarea" spellcheck="false">'+ src +'</textarea>')
    ,$input       = $('<input type="text" class="js-vs-input" value="' + settings.dummyText + '" />')
    ,$checkList   = $(
       '<ul class="js-vs-checkList">'
      +'<li><label><input type="checkbox"' + settings.targetAttrs.href   + '" class="js-vs-check-href"   />href</label></li>'
      +'<li><label><input type="checkbox"' + settings.targetAttrs.src    + '" class="js-vs-check-src"    />src</label></li>'
      +'<li><label><input type="checkbox"' + settings.targetAttrs.width  + '" class="js-vs-check-width"  />width</label></li>'
      +'<li><label><input type="checkbox"' + settings.targetAttrs.height + '" class="js-vs-check-height" />height</label></li>'
      +'<li><label><input type="checkbox"' + settings.targetAttrs.alt    + '" class="js-vs-check-alt"    />alt</label></li>'
      +'</ul>'
    )
    ;
    $panel
      .append($closeBtn)
      .append($heading)
      .append($textArea)
      .append($checkList)
      .append($input)
      .append($replaceBtn)
      .append($resetBtn)
      .on('mousedown',function(){
        _floatUp($panel,settings.panelClass);
      })
      .appendTo('body')
    ;
    if($.isFunction($panel.draggable)){
      $panel.draggable();
    }
    if($.isFunction($panel.resizable)){
      $panel.resizable();
    }
    $replaceBtn.on('click',function(){
      var
       targets   = {}
      ,$checkbox = $checkList.find('input')
      ,text      = $textArea.val()
      ,obj       = settings.targetAttrs
      ,i         = 0
      ,name
      ;
      for(name in obj){
        if(obj[name] !== '' && $checkbox.eq(i).is(':checked')){
          targets[name] = true;
        }
        i++;
      }
      $textArea.val(_replaceText(text,$input.val(),targets));
      return false;
    });
    $resetBtn.on('click',function(){
      $textArea.val(src);
      return false;
    });
    $closeBtn.on('click',function(){
      $replaceBtn.off('click');
      $resetBtn.off('click');
      $panel
       .off('mousedown')
       .remove()
      ;
      return false;
    });
    _setCenterPos($panel,settings.position);
    _floatUp($panel,settings.panelClass,1);
  }
  function _floatUp($element,cls,flag){
    var
     zIndexes = [0]
    ,len      = $('.'+cls).each(function(i){
      var
       $this  = $(this)
      ,zIndex = $this.css('zIndex')
      ;
      if(zIndex !== 'auto' ){
        zIndexes[zIndexes.length] = parseInt(zIndex);
      }
    }).length
    ;
    if(len > 1 && flag) {
      $element.css({
         'top'  : parseInt($element.css('top') ) + (len - 1) * 10 + 'px'
        ,'left' : parseInt($element.css('left')) + (len - 1) * 10 + 'px'
      });
    }
    $element.css('zIndex',Math.max.apply(null,zIndexes) + 1 + '');
  }
  function _setCenterPos($element,pos){
    var
     $w   = $(window)
    ,top  = (pos === 'absolute')?$w.scrollTop():0
    ,left = 0
    ;
    $element.css({
       'position' : pos
    });
    top  += ($w.height() - $element.outerHeight()) / 2;
    left += ($w.width()  - $element.width())       / 2;
    return $element.css({
       'top'  : top  + 'px'
      ,'left' : left + 'px'
    });
  }
  function _replaceText(str,substr,targets){
    var
     i         = 1
    ,newSubStr = substr
    ,ret       = str
      .replace(
         /(>[^<>\n\r]+<)|(>[^<>\n\r]+\n)|(href="[^"]*"|src="[^"]*"|width="[^"]*"|height="[^"]*"|alt="[^"]*")/g
        ,function(m){
          if(substr.indexOf('$') === 0){
            newSubStr = '${'
              + i
              + ':'
              + substr.split('$')[1]
              + '}'
            ;
          }
          if(m.indexOf('>') === 0){
            i++;
            if(m.lastIndexOf('<')) {
              return '>' + newSubStr + '<';
            }else{
              return '>' + newSubStr + '\n';
            }
          }else{
            var
             name = m.split('="')[0]
            ;
            if(targets[name]){
              i++;
              return name + '="' + newSubStr + '"';
            }else{
              return m;
            }
          }
        }
      )
    ;
    return ret;
  }
})(jQuery,this);