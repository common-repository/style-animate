(function(css3kfa, $, undefined) {
  function Editor_cl() {
    this.stylepane = null;
    this.isWaiting = false;
    var editor = this;
    $(window).resize({x:editor}, function(e) {
      var timeline = css3kfa.timeline;
      if (timeline !== undefined && timeline !== null) {
        timeline.measureTimeline_fn();
      }
      var top = $(window).height();
      var height = $("#css3kfa-tl-ctnr").height();
      $("#css3kfa-editorpane").css({top:top - height + "px"});
    });
    $(document.body).append('<div id="css3kfa-editorpane"></div>' + '<div id="css3kfa-stylepane"></div>' + '<div id="css3kfa-cover"></div>' + '<div class="css3kfa-dialog" id="css3kfa-showcss_html" style="display:none" title="CSS"><div style="position:relative"><div class="css3kfa-showcsswindow"></div></div></div>' + '<div class="css3kfa-dialog" id="css3kfa-loop_html" style="display:none" title="Set animation loop"><input type="checkbox" id="css3kfa-loop_chk" value="loop">Loop</div>' + '<div class="css3kfa-dialog" id="css3kfa-animstate_html" style="display:none" title="Set animation play state"><input type="checkbox" id="css3kfa-animstate_chk" value="running">Running <div>This only affects the output in the CSS dialog, animations will always run regardless of this setting.</div></div>' + 
    '<div class="css3kfa-dialog" id="css3kfa-timelinelen_html" style="display:none" title="Set timeline length"><input type="number" min="1" max="10000" step="1" id="css3kfa-timelinelen_number">&nbsp; seconds</div>' + '<div class="css3kfa-dialog" id="css3kfa-perspective_html" style="display:none" title="Set 3D perspective"><input type="number" min="1" max="10000" step="1" id="css3kfa-perspective_number"> pixels</div>' + '<div class="css3kfa-dialog" id="css3kfa-fps_html" style="display:none" title="Set FPS"><input type="number" min="1" max="60" step="1" id="css3kfa-fps_number">&nbsp; frames per second <br /><span style="font-size:12px">(Increase FPS for faster playback in browser)</div>' + 
    '<div class="css3kfa-dialog" id="css3kfa-delay_html" style="display:none" title="Set initial delay"><input type="number" min="0" step="0.1" id="css3kfa-delay_number">&nbsp; seconds</div>' + '<div class="css3kfa-dialog" id="css3kfa-timingfunc_anim_html"  style="display:none" title="Set Animation Timing Function"><input type="radio" name="timingfunc-anim" value="linear">&nbsp; Linear <br><input type="radio" name="timingfunc-anim" value="ease">&nbsp; Ease <br><input type="radio" name="timingfunc-anim" value="ease-in">&nbsp; Ease In <br><input type="radio" name="timingfunc-anim" value="ease-out">&nbsp; Ease Out <br><input type="radio" name="timingfunc-anim" value="ease-in-out">&nbsp; Ease In, Ease Out <br><input type="radio" name="timingfunc-anim" value="steps">&nbsp; Steps <br><div>The timing function determines how smoothly the animation starts and ends. This setting will only affect the live animation, the editor always animates with a linear timing function.</div></div>' + 
    '<div class="css3kfa-dialog" id="css3kfa-timingfunc_trans_html" style="display:none" title="Set Transition Timing Function"><input type="radio" name="timingfunc-trans" value="linear">&nbsp; Linear <br><input type="radio" name="timingfunc-trans" value="ease">&nbsp; Ease <br><input type="radio" name="timingfunc-trans" value="ease-in">&nbsp; Ease In <br><input type="radio" name="timingfunc-trans" value="ease-out">&nbsp; Ease Out <br><input type="radio" name="timingfunc-trans" value="ease-in-out">&nbsp; Ease In, Ease Out <br><div>The timing function determines how smoothly the transition starts and ends. This setting will only affect the live transition, the editor always animates with a linear timing function.</div></div>' + 
    '<div class="css3kfa-dialog" id="css3kfa-persite_html" style="display:none" title="This Page Only / Across Site"><input type="radio" name="all_pages" value="0">&nbsp; Apply to this element on this page only <br><input type="radio" name="all_pages" value="1">&nbsp; Apply to identical elements on all pages <br><input type="radio" name="all_pages" value="2">&nbsp; Apply to all similar elements everywhere <div><i>Apply to this element on this page only</i> will only apply styles and animations to the element on the current page.<br><i>Apply to this element on all pages</i> will attempt to load the animation on every page with the same element, i.e. one that has a matching DOM hierarchy, class and / or ID.<br><i>Apply to all similar elements everywhere</i> will apply the styles and animations to all elements with the same end tag (i.e. DIV, P etc.), regardless of class or ID, across the whole site.</div> </div>' + 
    '<div class="css3kfa-dialog" id="css3kfa-live-dev_html" style="display:none" title="Live / Under development"><input type="radio" name="live_devel" value="0">&nbsp; Show changes on live pages <br><input type="radio" name="live_devel" value="1">&nbsp; Show changes only when editing <br><br><i>Show changes on live pages</i> will show all changes on live pages straight away.<br><i>Show changes only when editing</i> will only show changes when logged in and editing styles or animations - people browsing the site won\'t see your changes</div> </div>' + 
    '<div class="css3kfa-dialog" id="css3kfa-rename_html" style="display:none" title="Set name">Set the name for the style set, animation or transition:<br><br><input type="text" name="title"></div>' + '<div class="css3kfa-dialog" id="css3kfa-duplicatewarn_html" style="display:none; text-align:center" title="Item already exists"><br>A Keyframe Animation or Transition has already been set on this page element! </div>' + '<div id="css3kfa-waiting-block"><div id="css3kfa-loading"></div></div>' + '<div class="css3kfa-dialog" id="css3kfa-delete_html" style="display:none" title="Delete Timeline">Delete all styles, animations and transitions?</div>' + 
    '<div class="css3kfa-dialog" id="css3kfa-delete_style" style="display:none" title="Delete Style">Delete this style?</div>' + '<div class="css3kfa-dialog" id="css3kfa-reload_html" style="display:none" title="Reload page">Reload page to see changes?</div>');
    $("#css3kfa-step_amt").keydown(function(e) {
      $('input[name="timingfunc"]')[1].checked = true;
    });
    Number.prototype.format = function() {
      return new Number(this.toFixed(3).toString().replace(/0+$/, ""));
    };
    var x, y, mouseDown = false;
    $("#css3kfa-stylepane").on("touchstart mousedown", function(e) {
      x = e.pageX;
      y = e.pageY;
      if (x === undefined) {
        x = e.originalEvent.touches[0].pageX;
      }
      if (y === undefined) {
        y = e.originalEvent.touches[0].pageY;
      }
      mouseDown = true;
    }).on("mousemove touchmove", function(e) {
      if (!mouseDown || !editor.stylepane.canDrag) {
        return;
      }
      var eventX = e.pageX;
      if (eventX === undefined) {
        eventX = e.originalEvent.touches[0].pageX;
      }
      var eventY = e.pageY;
      if (eventY === undefined) {
        eventY = e.originalEvent.touches[0].pageY;
      }
      var _x = x - eventX, _y = y - eventY;
      if (editor.stylepane.dragging || Math.abs(_x) > 4 || Math.abs(_y) > 4) {
        var v = $(".css3kfa-stylepanetitle").outerHeight() + 3, $this = $(this), top = $this.offset().top - _y;
        if (eventY - top < v) {
          editor.stylepane.dragging = true;
          $this.css({"opacity":0.4, "cursor":"move"});
          x = eventX;
          y = eventY;
          $this.offset({left:$this.offset().left - _x, top:$this.offset().top - _y});
          return false;
        }
      }
      return true;
    }).on("mouseup touchend", function(e) {
      if (editor.stylepane.dragging) {
        editor.stylepane.dragging = false;
        editor.stylepane.hasDragged = true;
        editor.stylepane.resizePicker_fn();
        $(this).css({"opacity":1, "cursor":"default"});
      }
      mouseDown = false;
    });
    $("#css3kfa-editorpane").load(css3kfa_vars.pluginPath + "js/includes/timeline.html");
  }
  css3kfa.Editor_cl = Editor_cl;
  Editor_cl.prototype = {init_fn:function(block, stylepane, showEditor) {
    this.stylepane = stylepane;
    var top = $(window).height();
    var zIndex = css3kfa_obj.highestZ + 2;
    block.showFrameProperties_fn(0);
    $("#css3kfa-stylepane").css({"z-index":zIndex}).fadeIn();
    if (showEditor === true) {
      var $editorPane = $("#css3kfa-editorpane");
      $editorPane.css({"display":"block"});
      var height = $("#css3kfa-tl-ctnr").height();
      $editorPane.css({"z-index":zIndex, top:top + "px"}).animate({top:top - height + "px"}, 500, function() {
        css3kfa.timeline.scrollMarkerInit_fn();
      });
    }
    $("body").append('<div class="css3kfa-editor-spacer" style="height:' + height + 'px">&nbsp;</div>');
  }, startWaiting_fn:function(animType, creating) {
    if (this.isWaiting === true) {
      return;
    }
    this.isWaiting = true;
    if (creating) {
      animType += 3;
    }
    var text = "";
    switch(animType) {
      case 0:
        text = "Loading styles...";
        break;
      case 1:
        text = "Loading styles and animation...";
        break;
      case 2:
        text = "Loading styles and transition...";
        break;
      case 3:
        text = "Loading styles...";
        break;
      case 4:
        text = "Adding animation...";
        break;
      case 5:
        text = "Adding transition...";
        break;
    }
    var w = $(window).width(), h = $(window).height();
    $("#css3kfa-loading").html(text);
    $("#css3kfa-waiting-block").css({"display":"block", "top":"0px", "width":w + "px", "height":+h + "px"});
    var $obj = $("#css3kfa-loading"), lw = $obj.outerWidth(), lh = $obj.outerHeight(), x = (w - lw) / 2, y = (h - lh) / 2;
    y += $("body").scrollTop();
    $obj.css({"top":y + "px", "left":x + "px"});
  }, stopWaiting_fn:function() {
    $("#css3kfa-waiting-block").fadeOut(1000);
    this.isWaiting = false;
  }, reveal_fn:function() {
    var top = $(window).height(), height = $("#css3kfa-tl-ctnr").height();
    $("#css3kfa-editorpane").css("top", top + "px").animate({height:height + "px", top:top - height + "px"}, 500);
  }, close_fn:function() {
    $("#css3kfa-editorpane").hide();
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);

