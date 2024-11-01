(function(css3kfa, $, undefined) {
  css3kfa.DefaultStyles_element = null;
  function Timeline_cl(postID, animType) {
    this.isShowingCSS = false;
    this.animation = null;
    this.animType = animType;
    this.cssOut = new css3kfa.CSS_Out;
    this.menu = null;
    this.postID = postID;
    this.frhlt = 6;
    this.dragGrfxID = null;
    this.dragBlock = null;
    this.dragTLID = null;
    this.selectedBlock = null;
    this.lastLayerAdded = 0;
    this.delay = 0;
    this.currentFrame = 0;
    this.numLayers = 0;
    this.lastLayerAdded = 0;
    this.isPlaying = false;
    this.loopAnim = false;
    this.name = "";
    this.time = Date.now();
    this.elapsedTime = 0;
    this.hasChanged = false;
    this.canAjax = true;
    this.defaultStyles = new css3kfa.DefaultStyles;
    this.defaultStyles.initVariants_fn();
    this.timingFunc = "linear";
    this.stepAmt = 1;
    this.perspective = 600;
    this.transformStyle = "preserve-3d";
    this.title = "";
    this.oldTitle = "";
    switch(animType) {
      case 0:
        this.title = "Styles";
        break;
      case 1:
        this.title = "Untitled animation";
        break;
      case 2:
        this.title = "Untitled transition";
        break;
    }
    this.isShowingCSS = false;
    this.cssDialog = null;
  }
  css3kfa.Timeline_cl = Timeline_cl;
  Timeline_cl.prototype = {deserialize_fn:function(obj) {
    this.numCells = obj.numCells;
    this.numLayers = obj.numLayers;
    this.lastLayerAdded = obj.lastLayerAdded;
    this.loopAnim = obj.loopAnim;
    this.delay = obj.delay;
    this.name = obj.name;
    this.setFPS_fn(obj.fps, this);
    this.perspective = obj.perspective;
    this.transformStyle = obj.transformStyle;
    this.title = obj.title;
    this.animType = obj.animType;
    if (obj.stepAmt !== undefined) {
      this.stepAmt = obj.stepAmt;
    }
    if (obj.timingFunc !== undefined) {
      this.timingFunc = obj.timingFunc;
    }
    this.rootLayer = new css3kfa.Block_cl(obj.rootLayer);
    this.rootLayer.postDeserialize_fn(this, null);
  }, postDeserialize_fn:function() {
    this.init_fn();
    this.selectedBlock = this.rootLayer.children[this.rootLayer.children.length - 1];
    this.selectedBlock.highlightLayer_fn();
    this.setTitle_fn(this.title);
    this.setPlayStop_fn(true);
    this.positionLayerButtons_fn();
    this.currentFrame = this.rootLayer.getFirstFrame_fn();
  }, preInit_fn:function(elementID, parentID) {
    this.setFPS_fn(24, this);
    this.numCells = 10 * this.fps + 1;
    this.rootLayer = new css3kfa.Block_cl(-1, "root", this, "");
    this.addNewLayerInit_fn(elementID, parentID);
    css3kfa.timeline = this;
  }, init_fn:function() {
    this.selectedBlock = this.rootLayer.children[this.rootLayer.children.length - 1];
    $("#css3kfa-tl-lyr-window").scroll({x:this}, function(e) {
      $("#css3kfa-tl-ruler").scrollLeft($("#css3kfa-tl-lyr-window").scrollLeft());
      e.data.x.scrollMarker_fn();
    });
    var iconsPath = css3kfa_vars.pluginPath + "jquery-simple-context-menu-master/icons/", timeline = this;
    var revealFunc = {label:"Dock Styles Panel", icon:iconsPath + "reveal.png", action:function() {
      timeline.animation.stylepane.hasDragged = false;
      css3kfa_obj.positionStylePane_fn();
    }};
    var lengthFunc = {label:"Set timeline length", icon:iconsPath + "dot.png", action:function() {
      $("#css3kfa-timelinelen_number").val(Math.round(timeline.numCells / css3kfa.Block_fps));
      $("#css3kfa-timelinelen_html").dialog({resizable:false, height:200, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        var n = $("#css3kfa-timelinelen_number").val();
        var num = Number(n);
        if (isNaN(num) || num < 1) {
          css3kfa.dialog("Please enter a valid number!");
          return;
        }
        var minLength = timeline.getLength_fn();
        if (num * css3kfa.Block_fps > minLength) {
          css3kfa.dialog("Confirm action", "Change timeline length?", function() {
            var length = num * css3kfa.Block_fps;
            timeline.rootLayer.setLength_fn(length);
            timeline.numCells = length;
            timeline.drawTimeline_fn();
            timeline.rootLayer.display_fn();
            timeline.saveData_fn();
          });
        } else {
          timeline.numCells = timeline.getLength_fn();
          timeline.drawTimeline_fn();
          timeline.rootLayer.display_fn();
          timeline.saveData_fn();
          css3kfa.dialog("Warning", "Cannot reduce timeline to crop keyframes");
        }
        $(this).dialog("close");
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
    }};
    var timingFuncAnim = {label:"Set timing function", icon:iconsPath + "dot.png", action:function() {
      jQuery('input[name="timingfunc-anim"]')[0].checked = timeline.timingFunc == "linear";
      jQuery('input[name="timingfunc-anim"]')[1].checked = timeline.timingFunc == "ease";
      jQuery('input[name="timingfunc-anim"]')[2].checked = timeline.timingFunc == "ease-in";
      jQuery('input[name="timingfunc-anim"]')[3].checked = timeline.timingFunc == "ease-out";
      jQuery('input[name="timingfunc-anim"]')[4].checked = timeline.timingFunc == "ease-in-out";
      jQuery('input[name="timingfunc-anim"]')[5].checked = timeline.timingFunc == "steps";
      jQuery("#css3kfa-step_amt").val(timeline.stepAmt);
      jQuery("#css3kfa-timingfunc_anim_html").dialog({resizable:false, height:350, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        var functype = jQuery('input[name="timingfunc-anim"]');
        var v = "", steps = "";
        if (functype) {
          for (var i = 0; i < functype.length; i++) {
            if (functype[i].checked == true) {
              v = functype[i].value;
              break;
            }
          }
        }
        if (v == "steps") {
          steps = Number(jQuery("#css3kfa-step_amt").val());
          if (steps == 0) {
            steps = 1;
          }
        }
        timeline.setTimingFunction_fn(v, steps);
        timeline.saveData_fn();
        timeline.redrawScene_fn();
        jQuery(this).dialog("close");
      }, Cancel:function() {
        jQuery(this).dialog("close");
      }}});
    }};
    var timingFuncTrans = {label:"Set timing function", icon:iconsPath + "dot.png", action:function() {
      jQuery('input[name="timingfunc-trans"]')[0].checked = timeline.timingFunc == "linear";
      jQuery('input[name="timingfunc-trans"]')[1].checked = timeline.timingFunc == "ease";
      jQuery('input[name="timingfunc-trans"]')[2].checked = timeline.timingFunc == "ease-in";
      jQuery('input[name="timingfunc-trans"]')[3].checked = timeline.timingFunc == "ease-out";
      jQuery('input[name="timingfunc-trans"]')[4].checked = timeline.timingFunc == "ease-in-out";
      jQuery("#css3kfa-timingfunc_trans_html").dialog({resizable:false, height:350, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        var functype = jQuery('input[name="timingfunc-trans"]');
        var v = "", steps = "";
        if (functype) {
          for (var i = 0; i < functype.length; i++) {
            if (functype[i].checked == true) {
              v = functype[i].value;
              break;
            }
          }
        }
        if (v == "steps") {
          steps = Number(jQuery("#css3kfa-step_amt").val());
          if (steps == 0) {
            steps = 1;
          }
        }
        timeline.setTimingFunction_fn(v, steps);
        timeline.saveData_fn();
        timeline.redrawScene_fn();
        jQuery(this).dialog("close");
      }, Cancel:function() {
        jQuery(this).dialog("close");
      }}});
    }};
    var FPSFunc = {label:"Set FPS", icon:iconsPath + "dot.png", action:function() {
      $("#css3kfa-fps_number").val(Math.round(css3kfa.Block_fps));
      $("#css3kfa-fps_html").dialog({resizable:false, height:250, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        var n = $("#css3kfa-fps_number").val();
        var num = Number(n);
        if (isNaN(num) || num < 1) {
          css3kfa.dialog("Invalid entry", "Please enter a valid number!");
          return;
        }
        timeline.setFPS_fn(num);
        $(this).dialog("close");
        timeline.drawTimeline_fn();
        timeline.saveData_fn();
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
    }};
    var childFunc = {label:"Include child elements", icon:iconsPath + "dot.png", action:function() {
      timeline.includeChildren_fn();
      css3kfa.editor.reveal_fn();
    }};
    var perspectiveFunc = {label:"Set 3D perspective", icon:iconsPath + "dot.png", action:function() {
      var num = timeline.perspective;
      $("#css3kfa-perspective_number").val(num);
      $("#css3kfa-perspective_html").dialog({resizable:false, height:200, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        timeline.perspective = Number($("#css3kfa-perspective_number").val());
        timeline.saveData_fn();
        $(this).dialog("close");
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
    }};
    var loopFunc = {label:"Set animation loop", icon:iconsPath + "dot.png", action:function() {
      $("#css3kfa-loop_chk").prop("checked", timeline.loopAnim);
      $("#css3kfa-loop_html").dialog({resizable:false, height:200, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        var loop = $("#css3kfa-loop_chk").prop("checked");
        timeline.loopAnim = loop;
        timeline.saveData_fn();
        $(this).dialog("close");
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
    }};
    if (this.animType === 1) {
      $("#css3kfa-tl-topleft").css3kfa_menu({element:"css3kfa-timeline-menubutton", title:"Animation menu", items:[lengthFunc, timingFuncAnim, FPSFunc, loopFunc, perspectiveFunc, null, revealFunc]});
    } else {
      $("#css3kfa-tl-topleft").css3kfa_menu({element:"css3kfa-timeline-menubutton", title:"Transition menu", items:[lengthFunc, timingFuncTrans, FPSFunc, null, revealFunc]});
    }
    this.checkForChanges_fn();
  }, toJSON:function(key) {
    var replacement = {};
    for (var val in this) {
      switch(val) {
        case "stylePane":
        case "selectedBlock":
        case "defaultStyles":
        case "cssOut":
        case "cssDialog":
        case "canAjax":
        case "currTlaIndex":
        case "delay":
        case "dragBlock":
        case "dragGrfxID":
        case "dragTLID":
        case "elapsedTime":
        case "hasChanged":
        case "isPlaying":
        case "menu":
        case "time":
        case "timeout":
        case "oldTitle":
        case "animation":
          break;
        default:
          replacement[val] = this[val];
      }
    }
    return replacement;
  }, checkForChanges_fn:function() {
    if (this.hasChanged) {
      this.elapsedTime += Date.now() - this.time;
      this.time = Date.now();
      if (this.elapsedTime > 500) {
        if (this.canAjax) {
          this.hasChanged = false;
          this.elapsedTime = 0;
          this.serialize_fn();
        }
      }
    }
    var timeline = this;
    setTimeout(function() {
      timeline.checkForChanges_fn();
    }, 250);
  }, saveData_fn:function() {
    var $obj = $("#css3kfa-animtype");
    this.oldTitle = $obj.attr("title");
    $obj.addClass("css3kfa-issaving").attr("title", "saving...").attr("alt", "saving...");
    this.time = Date.now();
    this.hasChanged = true;
    this.elapsedTime = 0;
    this.updateCSSDialog_fn();
  }, getTransformStyle_fn:function() {
    var canShow = this.rootLayer.get3Dstatus_fn();
    if (canShow) {
      return this.transformStyle;
    }
    return null;
  }, getPerspective_fn:function() {
    var canShow = this.rootLayer.get3Dstatus_fn();
    if (canShow) {
      return this.perspective;
    }
    return null;
  }, showCSS_fn:function() {
    this.cssDialog = $("#css3kfa-showcss_html");
    this.updateCSSDialog_fn();
    var timeline = this;
    this.cssDialog.dialog({resizable:true, height:400, width:800, modal:false, dialogClass:"css3kfa-dlg", buttons:{"Select text":function() {
      var element = document.getElementsByClassName("css3kfa-showcsswindow")[0];
      var range = document.createRange();
      range.selectNodeContents(element);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }, "Close":function() {
      timeline.cssDialog = null;
      $(this).dialog("close");
    }}});
    css3kfa_obj.saveScroll_fn();
  }, updateCSSDialog_fn:function() {
    if (this.cssDialog !== null) {
      var styles = this.rootLayer.getCSSData_fn(false);
      var css = this.cssOut.getStyles(this.animType, styles, true);
      $(".css3kfa-showcsswindow").html(css);
    }
  }, closeDialogs_fn:function() {
    $(".ui-dialog:visible").find(".css3kfa-dialog").dialog("close");
  }, setTitle_fn:function(title) {
    this.title = title;
    this.animation.setTooltip_fn(title);
    this.saveData_fn();
  }, serialize_fn:function() {
    this.canAjax = false;
    var cssdata = this.rootLayer.getCSSData_fn(true);
    var css = "";
    if (cssdata !== null) {
      css = this.cssOut.getStyles(this.animType, cssdata, false);
    }
    var jsonData = JSON.stringify(this), timeline = this, title = this.title;
    this.timeout = setTimeout(function() {
      timeline.canAjax = true;
    }, 5000);
    var data = {"action":"css3kfa_update", "security":css3kfa_vars.css3kfaNonce, "id":this.postID, "anim_type":this.animType, "content":jsonData, "css":css, "title":title};
    $.ajax({url:ajaxurl, data:data, dataType:"json", error:function() {
      console.log("ajax error");
      timeline.canAjax = true;
      $("#css3kfa-animtype").removeClass("css3kfa-issaving").addClass("css3kfa-failedsave").attr("title", "Save failed! Please reload page").attr("alt", "Save failed! Please reload page");
      clearTimeout(timeline.timeout);
    }, success:function(data) {
      timeline.canAjax = true;
      clearTimeout(timeline.timeout);
      $("#css3kfa-animtype").removeClass("css3kfa-issaving").attr("title", timeline.oldTitle).attr("alt", timeline.oldTitle);
    }, method:"POST"});
  }, setFPS_fn:function(fps) {
    this.fps = fps;
    css3kfa.Block_fps = fps;
    this.frhlt = 6;
    for (var i = 6; i > 2; i--) {
      var f = fps / i;
      if (f - f.toFixed(0) === 0) {
        this.frhlt = i;
        break;
      }
    }
  }, drawTimeline_fn:function() {
    $("#css3kfa-tl-ruler-ctnr").empty();
    var i, id, p = 0, length = this.numCells, secs = 1, text = "";
    for (i = 0; i < length; i++) {
      p = i % css3kfa.Block_fps + 1;
      text = i == 0 ? "1" : "&nbsp;";
      if (p % this.frhlt === 0) {
        text = p;
      }
      id = "css3kfa-tl-fr-" + i.toString();
      if (p % css3kfa.Block_fps === 0) {
        text = secs;
        secs++;
        $("#css3kfa-tl-ruler-ctnr").append('<div class="css3kfa-tl-frlrg" id="' + id + '">' + text + "</div>");
      } else {
        $("#css3kfa-tl-ruler-ctnr").append('<div class="css3kfa-tl-fr" id="' + id + '">' + text + "</div>");
      }
      $("#" + id).mousedown({x:i, y:this}, function(e) {
        e.data.y.rulerMouseDown_fn(e.data.x, true);
      }).mouseup({x:i, y:this}, function(e) {
        e.data.y.rulerMouseUp_fn(e.data.x);
      }).mouseover({x:i, y:this}, function(e) {
        e.data.y.rulerMouseOver_fn(e.data.x);
      }).mouseout({x:i, y:this}, function(e) {
        e.data.y.rulerMouseOut_fn(e.data.x);
      }).contextmenu(function() {
        return false;
      });
    }
    var frameW = $("#css3kfa-tl-fr-1").outerWidth(), leftW = $("#css3kfa-tl-topleft").outerWidth();
    $("#css3kfa-tl-ruler-ctnr").width((this.numCells + 4) * frameW);
    $("#css3kfa-tl-lyr-ctnr").width(this.numCells * frameW);
    $("#css3kfa-tl-topleft").width(leftW);
    var timeline = this;
    $("#css3kfa-title-input").on("keyup", function() {
      timeline.setTitle_fn($(this).val());
    });
    this.measureTimeline_fn();
  }, cleanup_fn:function() {
    css3kfa.timeline.closeDialogs_fn();
    this.stylePane.removeHandlers_fn();
    $(".css3kfa-timeline-menubutton").off();
    $(".css3kfa-playbutton").off();
    $(".css3kfa-stopbutton").off();
    $("#css3kfa-title-input").off();
    $("#copybutton").off();
    $("#css3kfa-tl-add-lyr").off();
    $("#css3kfa-tl-delete-lyr").off();
    this.drawScene_fn(0);
    this.rootLayer = null;
    $("#css3kfa-tl-ruler-ctnr").empty();
    $("#css3kfa-tl-lyr-ctnr").empty();
    $("#css3kfa-playstop").removeClass("css3kfa-stopbutton css3kfa-playbutton").addClass("css3kfa-nobutton");
    if (css3kfa_menu !== null) {
      css3kfa_menu.remove();
    }
    if (css3kfa_bg !== null) {
      css3kfa_bg.css({"display":"none"});
    }
    css3kfa.Block_lastHighltKF = null;
  }, rulerMouseDown_fn:function(frameID, drawScene) {
    if (css3kfa.Block_lastHighltKF_empty) {
      $("#" + css3kfa.Block_lastHighltKF_empty).removeClass("css3kfa-kf-mkr-downempty");
    }
    css3kfa.Block_lastHighltKF = null;
    css3kfa.Block_lastHighltKF_empty = null;
    if (this.currentFrame !== null) {
      this.unHighlightRulerCell_fn();
    }
    $("#css3kfa-tl-fr-" + frameID.toString()).removeClass("css3kfa-tl-fr-hover");
    this.currentFrame = frameID;
    $("#css3kfa-tl-marker").removeClass("css3kfa-tl-bar-click").addClass("css3kfa-tl-bar");
    var marker = this.scrollMarker_fn(), w = document.getElementById("css3kfa-tl-lyr-window"), u = $("#css3kfa-tl-ruler"), newPos = {};
    marker.height(w.clientHeight + u.height());
    newPos.left = marker.offset().left;
    newPos.top = u.offset().top;
    marker.offset(newPos);
    if (drawScene === true) {
      this.drawScene_fn(frameID);
    }
    if (this.stylePane !== undefined) {
      this.stylePane.refresh_fn();
    }
  }, rulerMouseUp_fn:function() {
    $("#css3kfa-tl-marker").removeClass("css3kfa-tl-bar").addClass("css3kfa-tl-bar-click");
    this.highlightRulerCell_fn();
    var w = document.getElementById("css3kfa-tl-lyr-window"), marker = this.scrollMarker_fn(), newPos = {};
    marker.height(w.clientHeight);
    newPos.left = marker.offset().left;
    newPos.top = $("#css3kfa-tl-lyr-window").offset().top;
    marker.offset(newPos);
  }, highlightRulerCell_fn:function() {
    $("#css3kfa-tl-fr-" + this.currentFrame.toString()).addClass("css3kfa-tl-fr-hlt");
    $("#css3kfa-tl-fr-" + (this.currentFrame + 1).toString()).addClass("css3kfa-tl-fr-right-hlt");
  }, unHighlightRulerCell_fn:function() {
    $("#css3kfa-tl-fr-" + this.currentFrame.toString()).removeClass("css3kfa-tl-fr-hlt");
    $("#css3kfa-tl-fr-" + (this.currentFrame + 1).toString()).removeClass("css3kfa-tl-fr-right-hlt");
  }, rulerMouseOver_fn:function(id) {
    $("#css3kfa-tl-fr-" + id.toString()).addClass("css3kfa-tl-fr-hover");
  }, rulerMouseOut_fn:function(id) {
    $("#css3kfa-tl-fr-" + id.toString()).removeClass("css3kfa-tl-fr-hover");
  }, measureTimeline_fn:function() {
    var w = $("#css3kfa-tl-ctnr").width(), leftW = $("#css3kfa-tl-leftcell").width();
    $("#css3kfa-tl-ruler").width(w - leftW - 2);
    $("#css3kfa-tl-lyr-window").width(w - leftW - 2);
  }, positionLayerButtons_fn:function() {
  }, scrollMarker_fn:function() {
    if (this.currentFrame === null) {
      return;
    }
    var v = $("#css3kfa-tl-lyr-window"), w = document.getElementById("css3kfa-tl-lyr-window"), frame = $("#css3kfa-tl-fr-" + this.currentFrame.toString()), marker = $("#css3kfa-tl-marker"), newPos = {};
    marker.height(w.clientHeight);
    marker.width(2);
    newPos.left = frame.offset().left + frame.width() / 2 + 1;
    newPos.top = $("#css3kfa-tl-lyr-window").offset().top;
    if (newPos.left < v.offset().left || newPos.left > v.offset().left + w.clientWidth) {
      marker.css("visibility", "hidden");
    } else {
      marker.css("visibility", "visible");
    }
    if (newPos.left > v.offset().left + w.clientWidth) {
      newPos.left = v.offset().left + w.clientWidth;
    }
    marker.offset(newPos);
    return marker;
  }, scrollMarkerInit_fn:function() {
    this.scrollMarker_fn();
    this.highlightRulerCell_fn();
    $("#css3kfa-tl-marker").addClass("css3kfa-tl-bar-click");
  }, addNewLayerInit_fn:function(elementId, parentId) {
    var label = css3kfa_obj.getPageNeutralName_fn(elementId), block = new css3kfa.Block_cl(this.numLayers, label, this, elementId, parentId);
    this.numLayers++;
    this.lastLayerAdded++;
    this.rootLayer.addBlockInit_fn(block);
    block.setKeyFrameInit_fn("#tbf-0-0");
    return block;
  }, addNewLayer_fn:function(elementId, parentId) {
    this.addNewLayerInit_fn(elementId, parentId);
    this.positionLayerButtons_fn();
    if (css3kfa.Block_displayReverse === true) {
      $("#css3kfa-tl-lyr-window").scrollTop(2000);
    }
  }, dumpArrays_fn:function() {
    this.rootLayer.dump();
  }, display_fn:function() {
    this.rootLayer.display_fn();
    $("#css3kfa-title-input").val(this.title);
  }, getTimingFunction_fn:function() {
    if (this.timingFunc == "steps") {
      return this.timingFunc + "(" + this.stepAmt + ")";
    } else {
      return this.timingFunc;
    }
  }, setTimingFunction_fn:function(timingFunc, stepAmt) {
    this.timingFunc = timingFunc;
    this.stepAmt = stepAmt;
    if (this.rootLayer.children.length > 0) {
      return this.rootLayer.children[0].updateAllTLA_recurs_fn();
    }
  }, getFirstBlock_fn:function() {
    if (this.rootLayer === undefined) {
      return;
    }
    if (this.rootLayer.children.length > 0) {
      return this.rootLayer.children[this.rootLayer.children.length - 1];
    }
  }, getLength_fn:function() {
    return this.rootLayer.getLength_fn(0);
  }, setPlayStop_fn:function(play) {
    if (this.getLength_fn() > 1) {
      if (play) {
        $("#css3kfa-playstop").removeClass("css3kfa-stopbutton").addClass("css3kfa-playbutton").attr("title", "Play").attr("alt", "Play");
        $(".css3kfa-playbutton").one("click", {x:this}, function(e) {
          e.data.x.playStopAnim_fn(true);
        });
      } else {
        $("#css3kfa-playstop").removeClass("css3kfa-playbutton").addClass("css3kfa-stopbutton").attr("title", "Stop").attr("alt", "Stop");
        $(".css3kfa-stopbutton").one("click", {x:this}, function(e) {
          e.data.x.playStopAnim_fn(false);
        });
        css3kfa.editor.stylepane.show_fn();
      }
    } else {
      $("#css3kfa-playstop").removeClass("css3kfa-stopbutton");
    }
  }, playStopAnim_fn:function(play) {
    if (this.isPlaying === false && play === true) {
      this.setPlayStop_fn(false);
      this.isPlaying = true;
      var max = this.rootLayer.getTimelineLength_fn(0), min = this.currentFrame == null ? 0 : this.currentFrame;
      if (this.currentFrame >= max) {
        this.currentFrame = 0;
      }
      var count = this.currentFrame == null ? min : this.currentFrame;
      if (count === max) {
        count = min;
      }
      this.interval = setInterval(function(x) {
        return function() {
          count++;
          var obj = x.obj;
          var frame = obj.currentFrame == null ? 1 : obj.currentFrame + 1;
          if (count === max) {
            if (obj.loopAnim === undefined || obj.loopAnim === false) {
              clearInterval(obj.interval);
              obj.isPlaying = false;
              obj.setPlayStop_fn(true);
            } else {
              count = 0;
              frame = 1;
            }
          }
          obj.moveAndPlay_fn(frame);
        };
      }({obj:this}), 1000 / css3kfa.Block_fps);
    }
    if (this.isPlaying === true && play === false) {
      this.setPlayStop_fn(true);
      this.isPlaying = false;
      clearInterval(this.interval);
    }
  }, moveAndPlay_fn:function(frameID) {
    if (this.currentFrame !== null) {
      this.unHighlightRulerCell_fn();
    }
    this.currentFrame = frameID;
    css3kfa.Block_lastHighltKF = null;
    $("#css3kfa-tl-marker").removeClass("css3kfa-tl-bar").addClass("css3kfa-tl-bar-click");
    this.highlightRulerCell_fn();
    var marker = this.scrollMarker_fn(), w = document.getElementById("css3kfa-tl-lyr-window"), u = $("#css3kfa-tl-ruler"), newPos = {};
    marker.height(w.clientHeight + u.height());
    newPos.left = marker.offset().left;
    newPos.top = u.offset().top;
    marker.offset(newPos);
    this.drawScene_fn(frameID);
    if (this.stylePane !== undefined) {
      this.stylePane.refresh_fn();
    }
  }, drawScene_fn:function(tlaIndex) {
    this.rootLayer.setAllTimelineStyles_fn(tlaIndex);
    this.currTlaIndex = tlaIndex;
  }, redrawScene_fn:function(block) {
    if (this.currTlaIndex === undefined) {
      this.currTlaIndex = this.rootLayer.getTimelineStart_fn(10000);
      if (this.currTlaIndex === 10000) {
        this.currTlaIndex = 0;
      }
    }
    this.drawScene_fn(this.currTlaIndex);
  }, redisplayAll_fn:function() {
    this.display_fn();
    this.redrawScene_fn();
  }, getBlockFromID_fn:function(id) {
    return this.rootLayer.getBlockFromID_fn(id);
  }, fillAllEmptyTLCells_fn:function() {
    for (var i = 0; i < this.rootLayer.children.length; i++) {
      this.rootLayer.children[i].fillEmptyTLCells_fn();
    }
  }, getDelay_fn:function() {
    return this.delay;
  }, setDelay_fn:function(delay) {
    this.delay = delay;
  }, getLayerName_fn:function(name) {
    return this.rootLayer.getLayerName_fn(name);
  }, getDuration_fn:function() {
    return (this.getLength_fn() / this.fps).format();
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);

