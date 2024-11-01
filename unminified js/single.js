var jQuery;
var css3kfa_bg;
var css3kfa_vars;
var css3kfa;
var Color;
var wp;
var css3kfa_menu;
var ajaxurl;
(function(css3kfa, $, undefined) {
  css3kfa.Editor_dragdrop = true;
  css3kfa.Editor_defaultUnit = "px";
  css3kfa.timeline = null;
  css3kfa.Dump_styles = false;
  css3kfa.Block_lastHighltKF_empty = null;
  function css3kfa_object_cl() {
    this.anims = [];
    this.reticleElement = null;
    this.highestZ = -999;
    this.started = false;
    this.moving = false;
    this.adding = false;
    this.cssString = "";
    this.baseElement = null;
    this.movingMarker = null;
    this.curMouseX = 0;
    this.curMouseY = 0;
    this.allItemsOfClass = false;
    this.reticleShowing = false;
    this.openAccordions = [];
    this.currentAnimation = null;
  }
  css3kfa.css3kfa_object_cl = css3kfa_object_cl;
  css3kfa_object_cl.prototype = {positionStylePane_fn:function(ignoreTop, ignoreOpacity) {
    var stylePane = $("#css3kfa-stylepane"), win = $(window), left = win.width() - stylePane.width() - 10, top = 80;
    if (ignoreTop === true) {
      stylePane.css({"left":left + "px", "opacity":1});
    } else {
      if (ignoreOpacity === true) {
        stylePane.css({"left":left + "px", "top":top + "px"});
      } else {
        stylePane.css({"left":left + "px", "top":top + "px", "opacity":1});
      }
    }
  }, getBrowserCorrectChain_fn:function(elementChain, allPages) {
    if (allPages === undefined) {
      allPages = false;
    }
    elementChain = this.stripTrailingHash_fn(elementChain);
    var classList = elementChain.split(/[>\s]/).reverse(), length = classList.length, el, s = "";
    if (length > 2) {
      classList[length - 2] = classList[length - 2].replace(/:nth-child\([0-9]+\)/i, "");
    }
    var matches = classList[length - 1].match(/(page-id-[0-9]+)/i);
    var bodyTag = "";
    if (matches !== null) {
      bodyTag = matches[1];
      classList.length = classList.length - 1;
    }
    matches = classList[0].match(/(.+)(#.+)/);
    if (matches !== null) {
      classList[0] = matches[1];
      classList.unshift(matches[2]);
    }
    length = classList.length;
    for (var i = 0; i < length; i++) {
      el = classList[i];
      if (i > 0) {
        s = ">" + s;
      }
      s = el + s;
      if (i === length) {
        return "";
      }
      if ($(s).length === 1) {
        break;
      }
    }
    if (!allPages && bodyTag !== "") {
      s = "BODY." + bodyTag + " " + s;
    }
    if (s === "") {
      s = "BODY";
    }
    return s;
  }, getParentCorrectChain_fn:function(elementChain) {
    var $obj = $(elementChain);
    var parent;
    while ((parent = $obj.parent()).length > 0) {
      if (this.isBlockDisplay_fn(parent)) {
        var parentString = css3kfa_obj.getElementChain_fn(parent);
        return css3kfa_obj.getBrowserCorrectChain_fn(parentString);
      }
      $obj = parent;
    }
    return elementChain;
  }, isBlockDisplay_fn:function($obj) {
    var v = $obj.css("display");
    switch(v) {
      case "block":
      case "flex":
      case "inline-block":
      case "inline-flex":
      case "table-cell":
      case "table-caption":
      case "list-item":
      case "run-in":
        return true;
    }
    return false;
  }, getElementChain_fn:function(baseElement) {
    if (baseElement.length == 0) {
      return;
    }
    var parent, count, found, children, css_string, complete, classList, i, css = [], element = baseElement, className = "";
    while (true) {
      parent = element.parent();
      if (parent == undefined || parent.length == 0) {
        break;
      }
      count = 1;
      found = false;
      children = parent.children().each(function() {
        if ($(this)[0] === element[0]) {
          found = true;
        }
        if (found === false) {
          count++;
        }
      });
      css_string = element[0].tagName;
      complete = false;
      if (css_string == "ARTICLE" && element.attr("id") !== undefined) {
        complete = true;
      }
      if (css_string == "BODY") {
        complete = true;
      }
      if (!complete && children.length > 1) {
        css_string += ":nth-child(" + count + ")";
      }
      if (element.attr("id") != undefined && element.attr("id").length > 0) {
        css_string += "#" + element.attr("id");
      }
      classList = element[0].className.split(/\s+/);
      for (i = 0; i < classList.length; i++) {
        className = classList[i];
        if (className.length === 0) {
          continue;
        }
        if (!complete) {
          css_string += "." + className;
        } else {
          if (className.indexOf("page-id") > -1 || className.indexOf("postid") > -1) {
            css_string += "." + className;
          }
        }
      }
      css.push(css_string);
      if (complete) {
        break;
      }
      element = parent;
    }
    css.reverse();
    css_string = "";
    className = css[0];
    if (className.indexOf("page-id") == -1 && className.indexOf("postid") == -1 && className.indexOf("post-") == -1) {
      var pageId = css3kfa_vars.pageId;
      css[0] = "BODY.page-id-" + pageId.toString();
    }
    for (i = 0; i < css.length; i++) {
      css_string += css[i];
      if (i < css.length - 1) {
        css_string += ">";
      }
    }
    return this.stripTrailingHash_fn(css_string);
  }, stripTrailingHash_fn:function(s) {
    if (s.indexOf("#", s.length - 1) !== -1) {
      s = s.substr(0, s.length - 1);
    }
    return s;
  }, init_fn:function() {
    var obj = this;
    if ($("div#wpadminbar").length > 0) {
      this.highestZ = parseInt($("div#wpadminbar").css("z-index"), 10) - 100;
    }
    $("*").each(function() {
      if (this.id !== "css3kfa-waiting-block" && !obj.isAdminBar_fn($(this))) {
        var current = parseInt($(this).css("z-index"), 10);
        if (current && css3kfa_obj.highestZ < current) {
          obj.highestZ = current;
        }
      }
    });
    $("body").on("click", function(e) {
      obj.showTypeMenu_fn(e);
    });
    $(window).on("mousemove", function(e) {
      obj.positionCursor_fn(e);
    });
    $(document).keyup(function(e) {
      if (e.keyCode === 27) {
        obj.deactivate_fn();
      }
    });
    this.highestZ++;
    $("body").append('<div class="css3kfa css3kfa-add-marker"></div>').append('<div class="css3kfa css3kfa-move-marker"></div>');
    var pageIds = [], re = /page-id-(\d+)/, bodyClass = $("body").attr("class"), match = re.exec(bodyClass);
    if (match != null && match.length > 1) {
      if (bodyClass.indexOf(match[0]) > -1) {
        pageIds.push(match[1]);
      }
    }
    if (pageIds.indexOf(css3kfa_vars.pageId) == -1) {
      pageIds.push(css3kfa_vars.pageId);
    }
    $("article").each(function(index, element) {
      var attr = $(this).attr("id");
      if (attr != undefined) {
        var re = /post-([0-9]+)/;
        var match = re.exec(attr);
        if (match != null && match.length > 1 && !pageIds.includes(match[1])) {
          pageIds.push(match[1]);
        }
      }
    });
    var single = this;
    var data = {"action":"css3kfa_fetchall", "security":css3kfa_vars.css3kfaNonce, "ids":pageIds};
    $.ajax({url:ajaxurl, data:data, dataType:"json", error:function() {
    }, success:function(data) {
      $.each(data, function(animIndex, animData) {
        var anim = new css3kfa.Animation_cl(animData);
        if (anim.$obj.length !== 0) {
          anim.showInitialStyles_fn();
        }
      });
    }, method:"POST"});
    $(window).on("resize", function() {
      css3kfa_obj.anims.forEach(function(anim) {
        anim.moveMarker_fn();
      });
      showIcon();
    });
    $(window).on("scroll", function() {
      if (single.reticleShowing == true) {
        single.appendReticle_fn(null);
      }
    });
    autoScroll(this);
    showIcon();
    function autoScroll(obj) {
      setTimeout(function() {
        autoScroll(obj);
      }, 10);
      if (!obj.moving && !obj.adding) {
        return;
      }
      var absTop = 0;
      if ($("#wpadminbar").length > 0) {
        absTop = $("#wpadminbar").height();
      }
      var xScroll = 0, yScroll = 0, margin = 30, editorH = 0, $win = $(window), scrollTop = $win.scrollTop(), scrollLeft = $win.scrollLeft(), top = obj.curMouseY;
      if (top < absTop) {
        return;
      }
      var left = obj.curMouseX, w = $win.width(), editorPane = $("#css3kfa-editorpane");
      if (editorPane.css("display") === "block") {
        editorH = editorPane.outerHeight();
      }
      if (top - scrollTop < absTop + margin) {
        yScroll = -10;
      }
      if (top - scrollTop > $win.height() - margin - editorH) {
        yScroll = 10;
      }
      if (left - scrollLeft < margin) {
        xScroll = -10;
      }
      if (left - scrollLeft > w - margin) {
        xScroll = 10;
      }
      $win.scrollTop(scrollTop + yScroll);
      $win.scrollLeft(scrollLeft + xScroll);
    }
    function showIcon() {
      if ($("#wp-admin-bar-addanimation").css("display") == "none") {
        var iconspan = '<span class="css3kfa-custom-icon css3kfa-custom-icon-inactive"></span>';
        var iconspanActive = '<span class="css3kfa-custom-icon css3kfa-custom-icon-active"></span>';
        var icon = '<div class="css3kfa-topicon-container"><div class="css3kfa-topicon"><span class="css3kfa-button-text">' + iconspan + '</span><span class="css3kfa-button-text-active">' + iconspanActive + "</span></div></div>";
        $(document.body).append(icon);
        var topH = $("#wpadminbar").height() - 4;
        var bgCol = $("#wpadminbar").css("background-color");
        $(".css3kfa-topicon-container").css({"top":topH + "px", "border-top-color":bgCol, "border-left-color":bgCol});
        $(".css3kfa-topicon").css({"width":"50px", "height":"50px"});
        $(".css3kfa-custom-icon").on("mouseup", css3kfa_obj.addAnimationn);
      } else {
        $(".css3kfa-topicon-container").css("display", "none");
        $(".css3kfa-custom-icon").off("mouseup", css3kfa_obj.addAnimation);
      }
    }
  }, saveScroll_fn:function() {
    var scrollPos = $(window).scrollTop(), rescrollTimer = 0;
    function reScroll() {
      var currScroll = $(window).scrollTop();
      if (currScroll != scrollPos) {
        $(window).scrollTop(scrollPos);
      } else {
        rescrollTimer += 10;
        if (rescrollTimer < 1000) {
          setTimeout(function() {
            reScroll();
          }, 10);
        }
      }
    }
    setTimeout(function() {
      reScroll();
    }, 10);
  }, positionMarkers_fn:function(notCurrentAnim) {
    var currentAnim = notCurrentAnim === true ? css3kfa.timeline.animation : null;
    this.anims.forEach(function(anim) {
      if (currentAnim !== anim) {
        anim.moveMarker_fn();
      }
    });
  }, isAdminBar_fn:function(obj) {
    return obj.attr("id") === "wpadminbar" || $("div#wpadminbar").find(obj).length > 0;
  }, positionCursor_fn:function(event) {
    if (!this.adding) {
      return;
    }
    if (this.isAdminBar_fn($(event.target))) {
      return;
    }
    if (this.movingMarker !== null && (Math.abs(this.mouseX - event.pageX) > 4 || Math.abs(this.mouseY - event.pageY) > 4)) {
      this.moving = true;
      $("body").css({"-webkit-touch-callout":"none", "-webkit-user-select":"none", "-khtml-user-select":"none", "-moz-user-select":"none", "-ms-user-select":"none", "user-select":"none"});
      this.movingMarker.startMarkerMove();
      this.killHrefs_fn();
      $("body, a").css("cursor", "none");
    }
    this.curMouseX = event.pageX;
    this.curMouseY = event.pageY;
    var change = true;
    if (this.baseElement !== null) {
      change = this.baseElement[0] !== $(event.target)[0];
      var classes = $(event.target)[0].className;
      if (classes !== undefined) {
        if (classes.indexOf("css3kfa-marker") !== -1) {
          this.baseElement = null;
          this.removeReticle_fn();
          return;
        }
        if (classes.indexOf("css3kfa-reticle") !== -1) {
          change = false;
        }
      }
    }
    this.baseElement = $(event.target);
    if (this.moving) {
      $("body").css("cursor", "none");
      $("#" + this.movingMarker.id).css("display", "none");
      $(".css3kfa move-marker").css({"display":"block", "top":event.pageY + "px", "left":event.pageX + "px", "pointer-events":"none"});
      if (change) {
        this.removeReticle_fn();
        this.cssString = this.getElementChain_fn(this.baseElement);
        this.appendReticle_fn(this.baseElement);
        this.reticleShowing = true;
      }
    }
    if (this.adding) {
      var cl = this.baseElement.attr("class"), id = this.baseElement.attr("id");
      if (cl !== undefined && cl.indexOf("css3kfa") !== -1 || id !== undefined && id.indexOf("css3kfa") !== -1) {
        this.removeReticle_fn();
        return;
      }
      if (change) {
        this.cssString = this.getElementChain_fn(this.baseElement);
        this.appendReticle_fn(this.baseElement);
        this.reticleShowing = true;
        var top = this.baseElement.offset().top, left = this.baseElement.offset().left - 20;
        if (left < 10) {
          left = 10;
        }
        if (top < 10) {
          top = 10;
        }
        $(".css3kfa-add-marker").css({"display":"block", "top":top + "px", "left":left + "px"});
      }
    }
  }, appendReticle_fn:function(element) {
    if ($(".css3kfa-reticle").length === 0) {
      $("body").append('<div class="css3kfa-reticle" id="css3kfa-reticle1"></div><div class="css3kfa-reticle" id="css3kfa-reticle2"></div><div class="css3kfa-reticle" id="css3kfa-reticle3"></div><div class="css3kfa-reticle" id="css3kfa-reticle4"></div>');
    }
    if (element !== null || this.reticleElement !== null) {
      if (element !== null && element[0].className.indexOf("css3kfa") === -1 && element[0].id.indexOf("css3kfa") === -1) {
        if (element !== null && this.reticleElement != element) {
          this.reticleElement = element;
        }
        element = this.reticleElement;
        var w = element.outerWidth() + 4, h = element.outerHeight() + 4, x = element.offset().left - $(window).scrollLeft() - 4, y = element.offset().top - $(window).scrollTop() - 4;
        $("#css3kfa-reticle1").css({"width":"0px", "height":h + "px", "top":y + "px", "left":x + "px"});
        $("#css3kfa-reticle2").css({"width":"0px", "height":h + "px", "top":y, "left":x + w + "px"});
        $("#css3kfa-reticle3").css({"width":w, "height":"0px", "top":y, "left":x + "px"});
        $("#css3kfa-reticle4").css({"width":w, "height":"0px", "top":y + h + "px", "left":x + "px"});
        this.reticleShowing = true;
      }
    }
  }, removeReticle_fn:function() {
    var $reticle = $(".css3kfa-reticle");
    if ($reticle.length !== 0) {
      $reticle.remove();
    }
    this.reticleShowing = false;
    this.reticleElement = null;
  }, getPageNeutralName_fn:function(elementChain) {
    if (elementChain === undefined) {
      return null;
    }
    var matches = elementChain.match(/(page-id-[0-9]+)[\s>]+(.+)/i);
    if (matches !== null) {
      return matches[2];
    }
    matches = elementChain.match(/(article#post-[0-9]+)[\s>]+(.+)/i);
    if (matches !== null) {
      return matches[2];
    }
    return elementChain;
  }, getElementNeutralName_fn:function(elementChain) {
    if (elementChain === undefined) {
      return null;
    }
    var classList = elementChain.split(/[>\s]/);
    var lastElement = classList[classList.length - 1];
    var matches = lastElement.match(/(\w+)[\.#:]?/);
    if (matches.length > 0) {
      return matches[1];
    }
    return elementChain;
  }, isOnSinglePage_fn:function(elementChain) {
    var singlePage = false;
    if (elementChain.match(/(page-id-[0-9]+)/i) !== null) {
      singlePage = true;
    }
    if (elementChain.match(/article#post-[0-9]/i) !== null) {
      singlePage = true;
    }
    return singlePage;
  }, isOnSingleElement_fn:function(elementChain) {
    var singleElement = false;
    if (elementChain.match(/[\.:#]/) !== null) {
      singleElement = true;
    }
    return singleElement;
  }, killHrefs_fn:function() {
    $("a[href]").each(function() {
      var obj = $(this);
      if (!css3kfa_obj.isAdminBar_fn(obj)) {
        obj.attr("css3kfa-oldhref", this.href);
        obj.attr("css3kfa-oldtarget", this.target);
        this.href = "#";
        this.target = "";
      }
    });
  }, restoreHrefs_fn:function() {
    setTimeout(function() {
      $("a[href]").each(function() {
        var attr = $(this).attr("css3kfa-oldhref");
        if (attr != undefined && attr.length !== 0) {
          this.href = attr;
          $(this).attr("css3kfa-oldhref", "");
        }
        attr = $(this).attr("css3kfa-oldtarget");
        if (attr != undefined && attr.length !== 0) {
          this.target = attr;
          $(this).attr("css3kfa-oldtarget", "");
        }
      });
    }, 1000);
  }, duplicateWarning_fn:function() {
    $("#css3kfa-duplicatewarn_html").dialog({resizable:false, height:200, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"OK":function() {
      $(this).dialog("close");
    }}});
  }, showTypeMenu_fn:function(event) {
    if (!this.started) {
      return;
    }
    if (this.isAdminBar_fn($(event.target))) {
      return;
    }
    if (!this.reticleShowing) {
      return;
    }
    var is_css3kfa = false;
    if (event.srcElement != null && event.srcElement.className != null) {
      if (event.srcElement.className.indexOf("css3kfa-") !== -1) {
        is_css3kfa = true;
      }
    }
    if (event.target != null && event.target.className != null) {
      if (event.target.className.indexOf("css3kfa-") !== -1) {
        is_css3kfa = true;
      }
    }
    if (!is_css3kfa) {
      var html = '<div class="css3kfa-typemenu"><div id="css3kfa-type-style">Add / Edit Styles</div><div id="css3kfa-type-anim">Add Keyframe Animation</div><div id="css3kfa-type-trans">Add Transition</div></div>';
      $("body").append(html);
      var $obj = $(".css3kfa-typemenu"), y = event.clientY + $(window).scrollTop(), x = event.clientX + $(window).scrollLeft();
      $obj.css({"top":y + "px", "left":x + "px", "z-index":"1000000"});
      var obj = this;
      obj.deactivate_fn();
      $("#css3kfa-type-style").one("mouseup", function() {
        obj.hideTypeMenu_fn();
        obj.addAnimEvent_fn(0);
      });
      $("#css3kfa-type-anim").one("mouseup", function() {
        obj.hideTypeMenu_fn();
        obj.addAnimEvent_fn(1);
      });
      $("#css3kfa-type-trans").one("mouseup", function() {
        obj.hideTypeMenu_fn();
        obj.addAnimEvent_fn(2);
      });
      $(document).one("keyup", function(e) {
        if (e.keyCode === 27) {
          obj.hideTypeMenu_fn();
        }
      }).one("mouseup", function(e) {
        obj.hideTypeMenu_fn();
      });
    } else {
      this.deactivate_fn();
    }
    event.stopPropagation();
  }, hideTypeMenu_fn:function() {
    $(".css3kfa-typemenu").remove();
    this.removeReticle_fn();
  }, addAnimEvent_fn:function(animType) {
    var anims = css3kfa_obj.anims, found = false, s = this.getBrowserCorrectChain_fn(css3kfa_obj.cssString);
    if (s === "") {
      return;
    }
    css3kfa.editor.startWaiting_fn(animType, true);
    for (var i = 0; i < anims.length; i++) {
      if (anims[i].elementChain === s) {
        found = true;
        break;
      }
    }
    if (found) {
      css3kfa_obj.duplicateWarning_fn();
      this.deactivate_fn();
      css3kfa.editor.stopWaiting_fn();
      return;
    }
    this.deactivate_fn();
    this.anims.forEach(function(anim) {
      anim.closeEditor_fn();
    });
    var data = {"action":"css3kfa_new", "security":css3kfa_vars.css3kfaNonce, "element_chain":css3kfa_obj.cssString, "page":css3kfa_vars.pageId, "anim_type":animType};
    $.ajax({url:ajaxurl, data:data, error:function(e) {
      console.log("no id from server (error function)");
    }, success:function(e) {
      if (e === "error") {
        console.log("no id from server (error message returned)");
      } else {
        var obj = JSON.parse(e);
        var anim = new css3kfa.Animation_cl({"elementChain":css3kfa_obj.cssString, "id":obj.postId, "admin_url":obj.admin_url, "animType":animType});
        anim.showUI_fn(null);
      }
    }, method:"POST"});
    return;
  }, activate_fn:function() {
    this.adding = true;
    this.moving = false;
    $(".css3kfa-button-text").css("display", "none");
    $(".css3kfa-button-text-active").css("display", "inline-block");
    this.started = true;
    this.killHrefs_fn();
    var obj = this;
    $("a").one("mouseup", obj.killScroll_fn);
    $("a").css("cursor", "default");
  }, deactivate_fn:function() {
    this.removeReticle_fn();
    if (this.adding === false) {
      return;
    }
    var obj = this;
    this.started = false;
    this.adding = false;
    $("a").off("mouseup", obj.killScroll_fn).css("cursor", "pointer");
    $(".css3kfa-button-text-active").css("display", "none");
    $(".css3kfa-button-text").css("display", "inline-block");
    $(".css3kfa-add-marker").css({"display":"none"});
    this.restoreHrefs_fn();
  }, killScroll_fn:function() {
    var yScroll = $(window).scrollTop();
    $(window).one("scroll", function() {
      $(window).scrollTop(yScroll);
    });
  }, addAnimation:function() {
    var yScroll = $(window).scrollTop();
    $(window).one("scroll", function() {
      $(window).scrollTop(yScroll);
    });
    if (!this.started) {
      this.activate_fn();
    } else {
      this.deactivate_fn();
    }
  }, reloadDialog_fn:function() {
    $("#css3kfa-reload_html").dialog({resizable:false, height:200, width:300, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
      location.reload(true);
      $(this).dialog("close");
    }, Cancel:function() {
      $(this).dialog("close");
    }}});
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);
var css3kfa_obj = new css3kfa.css3kfa_object_cl;
css3kfa.editor = new css3kfa.Editor_cl;
jQuery(window).on("load", function() {
  css3kfa_obj.init_fn();
});

