(function(css3kfa, $, undefined) {
  css3kfa.Block_dragTLID = null;
  css3kfa.Block_lastHighltKF = null;
  css3kfa.Block_lastHighltKF_empty = null;
  css3kfa.Block_displayReverse = true;
  function Block_cl(numericID, name, timeline, elementID, parentID) {
    this.tla = [];
    this.kfa = [];
    this.frameValues = [];
    this.children = [];
    this.hideCSS = false;
    if (typeof numericID === "object") {
      this.deserialize_fn(numericID);
      return;
    }
    this.animationName = (timeline.animType === 2 ? "transition_" : "animation_") + Date.now();
    this.name = name;
    this.numericID = numericID;
    this.elementID = elementID;
    this.fullElementID = elementID;
    this.parentID = parentID;
    this.fullParentID = parentID;
    this.$elementID = $(elementID);
    this.$parentID = $(parentID);
    css3kfa.timelineID = this.getTimelineID_fn();
    this.parent = null;
    this.keyframe = new css3kfa.KeyFrame_cl;
    this.animState = "running";
    this.innerHTML = "";
    this.stylePane = null;
  }
  css3kfa.Block_cl = Block_cl;
  Block_cl.prototype = {cleanupAll_fn:function() {
    var i;
    for (i = 0; i < this.children.length; i++) {
      this.children[i].cleanup_fn();
    }
    css3kfa.timeline.drawScene_fn(null);
    for (i = 0; i < this.children.length; i++) {
      this.children[i].post_cleanup_fn();
    }
  }, cleanup_fn:function() {
    var i, styles = this.keyframe.styles, length = styles.length;
    for (i = 0; i < length; i++) {
      styles[i].resetDisplay_fn();
    }
    styles = this.kfa[0].styles;
    length = styles.length;
    for (i = 0; i < length; i++) {
      styles[i].resetDisplay_fn();
    }
    this.updateTLA_fn(0);
    var children = this.children;
    for (i = 0; i < children.length; i++) {
      children[i].cleanup_fn();
    }
  }, post_cleanup_fn:function() {
    this.tla.length = 0;
    this.tla = null;
    this.kfa.length = 0;
    this.kfa = null;
    var children = this.children;
    for (var i = 0; i < children.length; i++) {
      children[i].post_cleanup_fn();
    }
    children.length = 0;
    children = null;
  }, setAllPages_fn:function(allPages) {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setAllPages_fn(allPages);
    }
    if (allPages === true) {
      this.elementID = css3kfa_obj.getPageNeutralName_fn(this.fullElementID);
      this.parentID = css3kfa_obj.getPageNeutralName_fn(this.fullParentID);
    } else {
      var pageID = $("body").attr("class").match(/(page-id-[0-9].)/);
      if (pageID !== null) {
        this.originalElementChain = css3kfa_obj.currentAnimation.changeBaseElement_fn(pageID[1]);
      }
      this.fullElementID = css3kfa_obj.getBrowserCorrectChain_fn(this.originalElementChain);
      this.fullParentID = css3kfa_obj.getParentCorrectChain_fn(this.fullElementID);
      this.elementID = this.fullElementID;
      this.parentID = this.fullParentID;
    }
  }, setAllElements_fn:function(allElements) {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setAllElements_fn(allElements);
    }
    if (allElements === true) {
      this.elementID = css3kfa_obj.getElementNeutralName_fn(this.fullElementID);
      this.parentID = css3kfa_obj.getElementNeutralName_fn(this.fullParentID);
    } else {
      this.elementID = this.fullElementID;
      this.parentID = this.fullParentID;
    }
    this.$elementID = $(this.elementID);
    this.$parentID = $(this.parentID);
  }, clearStyle_fn:function(innerStyleName, currFrame, dflt, dfltClear) {
    var kfa = this.kfa, length = kfa.length;
    for (var i = 0; i < length; i++) {
      kfa[i].clearStyle_fn(innerStyleName, currFrame, this, dflt, dfltClear);
    }
    this.keyframe.clearStyle_fn(innerStyleName, currFrame, this, dflt, dfltClear);
    this.updateAllTLA_fn();
  }, getDirection_fn:function() {
    return "normal";
  }, getPlayState_fn:function() {
    return this.animState;
  }, getName_fn:function() {
    return this.elementID;
  }, getParentName_fn:function() {
    return this.parentID;
  }, getAnimationName_fn:function() {
    return this.elementID.replace(/[\.\s\(\)]/g, "");
  }, getCSSData_fn:function(serialize) {
    if (serialize) {
      if (this.hideCSS === true) {
        return null;
      }
    }
    var css = [];
    var children = [];
    var posType = css3kfa.DefaultStyles_element.css("position");
    var obj = {name:this.getName_fn(), parentName:this.getParentName_fn(), animationName:this.animationName, timingfunc:css3kfa.timeline === null ? "" : css3kfa.timeline.getTimingFunction_fn(), delay:css3kfa.timeline === null ? 0 : css3kfa.timeline.getDelay_fn(), iterations:this.getIterationCount_fn(), direction:this.getDirection_fn(), playstate:this.getPlayState_fn(), fps:css3kfa.timeline === null ? 25 : css3kfa.timeline.fps, transformStyle:css3kfa.timeline === null ? "" : css3kfa.timeline.getTransformStyle_fn(), 
    perspective:css3kfa.timeline === null ? "" : css3kfa.timeline.getPerspective_fn(), posType:posType, css:css, children:children};
    var i, data = [];
    this.keyframe.getCSS_fn(data);
    css.push({frame:0, data:data});
    for (i = 0; i < this.kfa.length; i++) {
      data = [];
      this.kfa[i].getCSS_fn(data);
      if (data !== null && data.length > 0) {
        css.push({frame:this.kfa[i].frame, data:data});
      }
    }
    for (i = 0; i < this.children.length; i++) {
      children.push(this.children[i].getCSSData_fn());
    }
    return obj;
  }, get3Dstatus_fn:function() {
    var i, kfa = this.kfa, length = kfa.length, status = this.keyframe.get3Dstatus_fn();
    if (status === true) {
      return true;
    }
    for (i = 0; i < length; i++) {
      status = kfa[i].get3Dstatus_fn();
      if (status === true) {
        return true;
      }
    }
    var children = this.children;
    length = children.length;
    for (i = 0; i < length; i++) {
      status = children[i].get3Dstatus_fn();
      if (status === true) {
        return true;
      }
    }
    return false;
  }, getTimelineLength_fn:function(max) {
    var _max = this.kfa.length > 0 ? this.kfa[this.kfa.length - 1].frame : 0;
    if (max > _max) {
      _max = max;
    }
    for (var i = 0; i < this.children.length; i++) {
      _max = this.children[i].getTimelineLength_fn(_max);
    }
    return _max;
  }, getTimelineStart_fn:function(min) {
    var _min = this.kfa.length > 0 ? this.kfa[0].frame : min;
    if (_min < min) {
      min = _min;
    }
    for (var i = 0; i < this.children.length; i++) {
      _min = this.children[i].getTimelineStart_fn(_min);
    }
    return _min;
  }, setAllTimelineStyles_fn:function(tlaIndex) {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].setTimelineStyles_fn(tlaIndex);
    }
  }, setTimelineStyles_fn:function(tlaIndex) {
    if (tlaIndex === -1) {
      return;
    }
    var i, tla = this.tla;
    if (tla === null) {
      return;
    }
    var length = tla.length;
    if (tlaIndex === null) {
      for (i = 0; i < length; i++) {
        if (tla[i].kfSet === true) {
          tlaIndex = i;
          break;
        }
      }
    }
    if (tlaIndex >= length) {
      tlaIndex = length - 1;
      if (length === 0) {
        return;
      }
    }
    var p, name, value, index = 0, bgValue = [], bgSet = false, styles = this.tla[tlaIndex].styles, hasSetPos = false, $elementID = this.$elementID, perspective = css3kfa.timeline.perspective, transformStyle = css3kfa.timeline.transformStyle;
    if (this.$parentID === undefined) {
      return;
    }
    this.$parentID.css({"-webkit-perspective":perspective + "px", "-moz-perspective":perspective + "px", "perspective":perspective + "px"});
    $elementID.css({"-webkit-transform-style":transformStyle, "-moz-transform-style":transformStyle, "transform-style":transformStyle});
    if (styles !== null) {
      for (i = 0; i < 5; i++) {
        bgValue.push("");
      }
      for (i = 0; i < styles.length; i++) {
        if (styles[i].name === "background-image") {
          value = styles[i].value;
          if (value.indexOf("url") !== -1) {
            for (p = 0; p < 5; p++) {
              bgValue[p] += value;
            }
          } else {
            index = 0;
            if (value.indexOf("-webkit-") !== -1) {
              index = 1;
            } else {
              if (value.indexOf("-moz-") !== -1) {
                index = 2;
              } else {
                if (value.indexOf("-o-") !== -1) {
                  index = 3;
                } else {
                  if (value.indexOf("-ms-") !== -1) {
                    index = 4;
                  }
                }
              }
            }
            if (bgValue[index] !== "") {
              bgValue[index] = value + "," + bgValue[index];
            } else {
              bgValue[index] = value;
            }
          }
          bgSet = true;
        }
      }
      for (i = 0; i < styles.length; i++) {
        if (css3kfa.Dump_styles === true) {
          console.log(styles[i].name + "," + styles[i].value);
        }
        name = styles[i].name;
        if (name !== "background-image") {
          if (name === "top" || name === "left" || name === "bottom" || name === "right") {
            hasSetPos = true;
          }
          $elementID.css(name, styles[i].value);
        }
        if (bgSet === true) {
          for (p = 0; p < 5; p++) {
            if (bgValue[p] !== "") {
              $elementID.css("background-image", bgValue[p]);
              if (css3kfa.Dump_styles === true) {
                console.log("combined background-image" + "," + bgValue[p]);
              }
            }
          }
        }
      }
    }
    var position = $elementID.css("position");
    if (hasSetPos && position !== "relative" && position !== "absolute") {
      $elementID.css("position", "relative");
    }
    this.setAllTimelineStyles_fn(tlaIndex);
  }, toJSON:function(key) {
    var replacement = {};
    for (var val in this) {
      switch(val) {
        case "stylePane":
        case "parent":
        case "tla":
        case "selectedBlock":
        case "timeline":
        case "$elementID":
        case "$parentID":
          break;
        default:
          replacement[val] = this[val];
      }
    }
    return replacement;
  }, deserialize_fn:function(obj) {
    this.stylePane = null;
    this.numericID = obj.numericID;
    this.fullElementID = obj.fullElementID;
    this.elementID = obj.elementID;
    this.parentID = obj.parentID;
    this.fullParentID = obj.fullParentID;
    this.name = obj.name;
    css3kfa.timelineID = this.getTimelineID_fn();
    this.innerHTML = obj.innerHTML;
    this.animState = obj.animState;
    this.timingFunc = obj.timingFunc;
    this.animationName = obj.animationName;
    this.uniqueClass = obj.uniqueClass;
    this.hideCSS = obj.hideCSS;
    var i, this_kfa = this.kfa, obj_kfa = obj.kfa, this_chld = this.children, obj_chld = obj.children;
    for (i = 0; i < obj_kfa.length; i++) {
      this_kfa.push(new css3kfa.KeyFrame_cl(obj_kfa[i], this));
    }
    this.keyframe = new css3kfa.KeyFrame_cl(obj.keyframe, this);
    for (i = 0; i < obj_chld.length; i++) {
      this_chld.push(new css3kfa.Block_cl(obj_chld[i]));
    }
    if (this.timingFunc === undefined) {
      this.timingFunc = "linear";
    }
    if (this.stepAmt === undefined) {
      this.stepAmt = 1;
    }
  }, postDeserialize_fn:function(timeline, parent) {
    css3kfa.timeline = timeline;
    if (this.elementID !== undefined && this.elementID != "") {
      this.$elementID = $(this.elementID);
    }
    if (this.parentID !== undefined && this.parentID != "") {
      this.$parentID = $(this.parentID);
    }
    this.parent = parent;
    var i;
    for (i = 0; i < this.children.length; i++) {
      this.children[i].postDeserialize_fn(timeline, this);
    }
    if (this.kfa.length > 0) {
      for (i = 0; i < this.kfa[this.kfa.length - 1].frame + 1; i++) {
        this.tla.push({kfIndex:-1, kfSet:false, styles:[], tempStyles:[], frameData:[]});
      }
      for (i = 0; i < this.kfa.length; i++) {
        this.tla[this.kfa[i].frame].kfIndex = i;
        this.tla[this.kfa[i].frame].kfSet = true;
      }
      this.updateAllTLA_fn();
    }
  }, getTimelineID_fn:function() {
    return "css3kfa-lyr-button-" + this.numericID;
  }, addBlockInit_fn:function(block) {
    this.children.unshift(block);
    block.parent = this;
  }, addBlock_fn:function(block) {
    this.addBlockInit_fn(block);
    css3kfa.timeline.display_fn();
  }, deleteBlock_fn:function(block) {
    var i, j;
    for (i = 0; i < this.children.length; i++) {
      if (this.children[i] === block) {
        var newParent = this;
        this.children.splice(i, 1);
        for (j = block.children.length - 1; j > -1; j--) {
          newParent.children.unshift(block.children[j]);
          block.children[j].parent = newParent;
        }
        block.children.length = 0;
        return;
      }
      this.children[i].deleteBlock_fn(block);
    }
    css3kfa.timeline.redisplayAll_fn();
  }, getBlockFromID_fn:function(id) {
    return this.getBlock_fn(id);
  }, display_fn:function() {
    var i, children = this.children;
    $("#css3kfa-tl-lyr-ctnr").empty();
    $("#css3kfa-tl-buttons-ctnr").empty();
    if (css3kfa.Block_displayReverse) {
      for (i = children.length - 1; i > -1; i--) {
        children[i].draw_fn(true, null);
      }
    } else {
      for (i = 0; i < children.length; i++) {
        children[i].draw_fn(true, null);
      }
    }
  }, draw_fn:function(drawTimeline, indent) {
    var i, alt, name = "";
    if (css3kfa.Block_displayReverse) {
      if (this.parent.parent != null) {
        indent += 16;
        if (this.parent.parent.name === "root") {
          indent -= 8;
        }
      }
      for (i = this.children.length - 1; i > -1; i--) {
        this.children[i].draw_fn(drawTimeline, indent);
      }
    }
    var timelineID = this.getTimelineID_fn();
    var nameID = timelineID + "_name";
    var blockID = "blockID_" + this.numericID;
    $("#css3kfa-tl-buttons-ctnr").append('<div id="' + timelineID + '" class="css3kfa-panel css3kfa-lyr-button"></div>');
    if (css3kfa.Editor_dragdrop) {
      $("#" + timelineID).on("mousedown", {x:this}, function(e) {
        e.data.x.layerMouseDown_fn();
      }).on("dragstart", {x:this}, function(e) {
        e.data.x.layerDragStart(e);
      }).on("dragover", {x:this}, function(e) {
        e.data.x.layerHover_fn(e);
      }).on("drop", {x:this}, function(e) {
        e.data.x.layerDrop(e);
      });
    } else {
      $("#" + timelineID).on("mouseover", {x:this}, function(e) {
        e.data.x.layerHover_fn(e);
      }).on("mousedown", {x:this}, function(e) {
        e.data.x.layerMouseDown_fn();
      }).on("mouseup", {x:this}, function(e) {
        e.data.x.layerMouseUp_fn(e);
      });
    }
    if (this.name != null) {
      name = this.name.split(">");
      name = name[name.length - 1];
    }
    alt = ' alt="' + this.name + '" title="' + this.name + '"';
    var html = '<div id="' + blockID + '"' + alt + '"><div class="css3kfa-lyr-button-outer"><div id="' + nameID + '" class="css3kfa-lyr-button-lbl">' + name + "</div></div></div>";
    $(document.body).append('<div id="css3kfa-test" style="display:table;">' + html + "</div>");
    $("#css3kfa-test").remove();
    $("#" + timelineID).append('<div style="display:table; width: 100%; height:22px">' + html + "</div>");
    if (css3kfa.Block_displayReverse) {
      if (drawTimeline) {
        this.drawTimelineBlock_fn();
      }
    } else {
      if (this.parent.parent !== null) {
        indent += 16;
      }
      if (drawTimeline) {
        this.drawTimelineBlock_fn();
      }
      for (i = 0; i < this.children.length; i++) {
        this.children[i].draw_fn(drawTimeline, indent);
      }
    }
  }, drawTimelineBlock_fn:function() {
    var hltClass = css3kfa.timeline.selectedBlock === this ? "css3kfa-kf-mkr-down" : "css3kfa-kf-mkr";
    var id = "css3kfa-tl-bl-" + this.numericID.toString();
    var content = '<div class="css3kfa-tl-bl" id="' + id + '"></div>';
    if ($("#" + id).length === 0) {
      $("#css3kfa-tl-lyr-ctnr").append(content);
    }
    content = "";
    var i, p, kfClass, className, blockID, kfSet = false, lastFr = this.kfa.length > 0 ? this.kfa[this.kfa.length - 1].frame : 0, tla = this.tla, numCells = css3kfa.timeline.numCells, length = tla.length, frhlt = css3kfa.timeline.frhlt, numericID = this.numericID.toString();
    for (i = 0; i < numCells; i++) {
      kfClass = "";
      if (length > i) {
        if (tla[i].kfSet) {
          kfClass = hltClass + " css3kfa-kf-mkr-dot";
          if (kfSet) {
            var lastKF = true;
            for (p = i; p < length; p++) {
              if (this.tla[p].kfSet) {
                lastKF = false;
                break;
              }
            }
            if (lastKF) {
              kfSet = false;
            }
          } else {
            kfSet = true;
          }
        } else {
          if (i < lastFr && kfSet) {
            kfClass = hltClass + " css3kfa-kf-mkr-c";
            if (i > 0 && tla[i - 1].kfSet) {
              kfClass = hltClass + " css3kfa-kf-mkr-l";
            }
            if (i < length - 1 && tla[i + 1].kfSet) {
              kfClass = hltClass + " css3kfa-kf-mkr-r";
            }
          }
        }
      }
      className = i === 0 || (i + 1) % frhlt === 0 ? "css3kfa-tl-bl-fr-dk " : "css3kfa-tl-bl-fr-lt ";
      blockID = "tbf-" + numericID + "-" + i;
      if (css3kfa.Editor_dragdrop) {
        content += '<div class="css3kfa-tl-bl-fr ' + className + kfClass + '" id="' + blockID + '" draggable="true">&nbsp;</div>';
      } else {
        content += '<div class="css3kfa-tl-bl-fr ' + className + kfClass + '" id="' + blockID + '" >&nbsp;</div>';
      }
    }
    content += "</div>";
    $("#" + id).html(content);
    var iconsPath = css3kfa_vars.pluginPath + "jquery-simple-context-menu-master/icons/";
    var block = this;
    for (i = 0; i < numCells; i++) {
      blockID = "tbf-" + numericID + "-" + i;
      id = "#" + blockID;
      if (i > 0) {
        if (i < length && tla[i].kfSet === true) {
          $(id).css3kfa_contextPopup({title:"Keyframe functions", items:[{label:"Clear keyframe", selector:id, icon:iconsPath + "trash.png", action:function() {
            block.clearKeyFrame_fn(this.selector);
          }}]});
        } else {
          if (css3kfa.timeline.animation.animType !== 2 || this.kfa.length < 2) {
            $(id).css3kfa_contextPopup({title:"Keyframe functions", items:[{label:"Set keyframe", selector:id, icon:iconsPath + "setkf.png", action:function() {
              block.setKeyFrame_fn(this.selector);
              block.showFrameProperties1_fn(this.selector);
            }}]});
          }
        }
      } else {
        $(id).contextmenu(function() {
          return false;
        });
      }
      if (css3kfa.Editor_dragdrop) {
        $(id).mousedown({id:this.numericID, x:this, y:blockID, z:i}, function(e) {
          var block = css3kfa.timeline.getBlockFromID_fn(e.data.id);
          block.mouseDown_fn(e);
        }).mouseup({id:this.numericID, x:this, y:i + 1}, function(e) {
          css3kfa.timeline.rulerMouseUp_fn(e.data.y);
        }).on("dragstart", {x:this, y:blockID}, function(e) {
          e.data.x.tlDragStart_fn(e);
        }).on("dragover", {x:this, y:blockID}, function(e) {
          e.data.x.tlHover_fn(e);
        }).on("drop", {x:this, y:blockID}, function(e) {
          e.data.x.tlDrop_fn(e);
        });
      } else {
        $(id).mousedown({id:this.numericID, x:this, y:blockID, z:i}, function(e) {
          var block = css3kfa.timeline.getBlockFromID_fn(e.data.id);
          block.mouseDown_fn(e);
          if (e.button !== 2) {
            e.data.x.tlCellMouseDown_fn(e);
            e.stopPropagation();
            e.preventDefault();
            e.cancelBubble = true;
            e.returnValue = false;
          }
        });
        $(id).mouseup({id:this.numericID, x:this, y:i + 1}, function(e) {
          css3kfa.timeline.rulerMouseUp_fn(e.data.y);
        });
        $("#css3kfa-tl-lyr-ctnr").on("mousemove", {x:this}, function(e) {
          if (e.button !== 2) {
            e.data.x.ghostTLCell_fn(e);
          }
        });
        $(id).on("mouseup", {x:this, y:blockID}, function(e) {
          if (e.button !== 2) {
            e.data.x.tlCellMouseUp_fn(e);
          }
        });
        $(id).on("mouseover", {x:this, y:blockID}, function(e) {
          if (e.button !== 2) {
            e.data.x.tlHover_fn(e);
          }
        });
      }
    }
  }, tlDragStart_fn:function(e) {
    e.originalEvent.dataTransfer.setData("Text", e.data.y);
  }, tlDrop_fn:function(e) {
    e.originalEvent.preventDefault();
    var id1, id2;
    if (css3kfa.Editor_dragdrop) {
      id1 = e.originalEvent.dataTransfer.getData("Text");
      id2 = e.originalEvent.target.id;
    } else {
      id2 = e.data.y;
      id1 = css3kfa.Block_dragTLID;
    }
    var arr1 = id1.split("-");
    var draggedID = arr1[2];
    if (draggedID === undefined) {
      css3kfa.timeline.dragBlock = null;
      return;
    }
    var arr2 = id2.split("-");
    var targetID = arr2[2];
    if (draggedID === targetID) {
      return;
    }
    if (this.tla.length <= draggedID) {
      return;
    }
    if (!this.tla[draggedID].kfSet) {
      return;
    }
    if (this.tla.length > targetID && this.tla[targetID].kfSet) {
      css3kfa.dialog("Warning", "You cannot drop a keyframe onto another keyframe.");
      return;
    }
    if (arr1[1] !== arr2[1]) {
      css3kfa.dialog("Warning", "You cannot move keyframes between layers.");
      return;
    }
    var kf1 = this.kfa[this.tla[draggedID].kfIndex];
    var newKF = this.setKeyFrame_fn(id2, true);
    for (var i = 0; i < kf1.styles.length; i++) {
      newKF.styles.push(kf1.styles[i]);
    }
    this.clearKeyFrame_fn(id1);
    this.copyStylesToBlock_fn();
    css3kfa.timeline.saveData_fn();
    this.showFrameProperties1_fn(id2);
    css3kfa.timeline.moveAndPlay_fn(Number(arr2[2]));
  }, tlHover_fn:function(e) {
    e.originalEvent.preventDefault();
    if (css3kfa.Editor_dragdrop === false) {
      css3kfa.Block_dragTL1ID = e.data.y;
    }
  }, tlCellMouseDown_fn:function(e) {
    var id = e.data.y;
    css3kfa.Block_dragTLID = id;
    var name = "draggrfx";
    $(document.body).append('<div id="' + name + '" style="position: absolute; opacity: 0.4; pointer-events: none"></div>');
    $("#" + name).append($("#" + id).clone_fn());
    css3kfa.timeline.dragGrfxID = name;
  }, tlCellMouseUp_fn:function(e) {
    this.tlDrop_fn(e);
    this.tlCellDragExit_fn(e);
  }, ghostTLCell_fn:function(e) {
    if (css3kfa.Block_dragTLID !== null) {
      var top = e.pageY.toString() + "px";
      var left = e.pageX.toString() + "px";
      $("#" + css3kfa.timeline.dragGrfxID).css({"top":top, "left":left});
    }
  }, tlCellDragExit_fn:function(e) {
    if (css3kfa.Block_dragTLID !== null) {
      $("#" + css3kfa.timeline.dragGrfxID.toString()).remove();
      css3kfa.timeline.dragGrfxID = null;
    }
    css3kfa.Block_dragTLID = null;
  }, setLength_fn:function(numCells) {
    var tl, i;
    for (i = css3kfa.timeline.numCells; i < numCells; i++) {
      if (this.tla.length > i) {
        tl = this.tla[i];
        if (tl.styles !== undefined) {
          tl.styles.length = 0;
        }
        if (tl.tempStyles !== undefined) {
          tl.tempStyles.length = 0;
        }
        this.tla[i] = null;
      }
    }
    for (i = 0; i < this.children.length; i++) {
      this.children[i].setLength_fn(numCells);
    }
  }, mouseDown_fn:function(e) {
    var index = e.data.z;
    this.layerMouseDown_fn(false);
    css3kfa.timeline.rulerMouseDown_fn(index, false);
    css3kfa.Block_lastHighltKF = null;
    css3kfa.Block_lastHighltKF_empty = null;
    css3kfa.timeline.drawScene_fn(index, this);
  }, layerMouseDown_fn:function(refresh) {
    if (refresh === undefined) {
      refresh = true;
    }
    var block = css3kfa.timeline.selectedBlock;
    if (block !== this) {
      css3kfa.timeline.selectedBlock = this;
      if (block !== null) {
        block.drawTimelineBlock_fn();
      }
      this.drawTimelineBlock_fn();
      css3kfa.timeline.stylePane.block = this;
      this.highlightLayer_fn();
      if (css3kfa.Editor_dragdrop === false) {
        css3kfa.timeline.dragGrfxID = this.getDragGrfx();
        css3kfa.timeline.dragBlock = this;
      }
      if (refresh) {
        css3kfa.timeline.stylePane.refresh_fn();
      }
    }
  }, highlightLayer_fn:function() {
    $(".css3kfa-lyr-button-down").removeClass("css3kfa-lyr-button-down");
    $("#" + this.getTimelineID_fn()).addClass("css3kfa-lyr-button-down");
  }, layerHover_fn:function(e) {
    e.originalEvent.preventDefault();
    if (css3kfa.timeline.dragBlock !== null && css3kfa.timeline.dragBlock !== this) {
      $(".css3kfa-lyr-button-dragover").removeClass("css3kfa-lyr-button-dragover");
      $("#" + this.getTimelineID_fn()).addClass("css3kfa-lyr-button-dragover");
    }
  }, layerMouseUp_fn:function(e) {
    this.layerDrop(e);
    this.layerDragExit(e);
  }, showFrameProperties_fn:function(frameIndex) {
    var stylepane = css3kfa.editor.stylepane;
    if (this.tla.length === 0 || this.tla.length <= frameIndex) {
      stylepane.beginShow_fn(this, null);
      stylepane.show_fn();
      return;
    }
    var tlData = this.tla[frameIndex];
    if (tlData.kfIndex === -1) {
      stylepane.beginShow_fn(this, null);
      stylepane.show_fn();
      return;
    }
    if (this.kfa.length < tlData.kfIndex) {
      return;
    }
    var kfData = this.kfa[tlData.kfIndex];
    stylepane.beginShow_fn(this, kfData);
    stylepane.show_fn();
  }, showFrameProperties1_fn:function(frameID) {
    var arr = frameID.split("-");
    var frameIndex = Number(arr[2]);
    this.showFrameProperties_fn(frameIndex);
  }, setKeyFrame_fn:function(frameID, empty) {
    var data = this.setKeyFrameInit_fn(frameID, empty);
    css3kfa.timeline.moveAndPlay_fn(data.frame);
    css3kfa.timeline.saveData_fn();
    this.drawTimelineBlock_fn();
    return data.keyframe;
  }, setKeyFrameInit_fn:function(frameID, empty) {
    if (empty === undefined) {
      empty = false;
    }
    if (frameID === undefined) {
      frameID = css3kfa.Block_lastHighltKF_empty;
    }
    var arr = frameID.split("-");
    var timelineID = this.numericID;
    var frame = Number(arr[2]);
    var prevKF = -1, nextKF = -1;
    if (this.tla.length > frame && this.tla[frame].kfSet === false || this.tla.length <= frame) {
      var i, index, oldLen = this.tla.length;
      for (i = oldLen; i <= frame; i++) {
        this.tla.push({kfIndex:-1, kfSet:false, styles:[], tempStyles:[], frameData:[]});
      }
      this.tla[frame].kfSet = true;
      var hasInserted = false;
      var kf = new css3kfa.KeyFrame_cl(frame, this);
      for (i = frame - 1; i > -1; i--) {
        if (this.tla[i].kfSet) {
          prevKF = i;
          index = this.tla[i].kfIndex;
          this.kfa.splice(index + 1, 0, kf);
          if (!empty) {
            this.setKeyFrameStyles_fn(index + 1);
          }
          this.tla[frame].kfIndex = index + 1;
          hasInserted = true;
          break;
        }
      }
      for (i = frame + 1; i < this.tla.length; i++) {
        if (this.tla[i].kfSet) {
          if (nextKF === -1) {
            nextKF = i;
          }
          if (!hasInserted) {
            index = this.tla[i].kfIndex;
            this.kfa.splice(index, 0, kf);
            this.tla[frame].kfIndex = index;
            if (!empty) {
              this.setKeyFrameStyles_fn(index);
            }
            hasInserted = true;
          }
          this.tla[i].kfIndex++;
        }
      }
      if (!hasInserted) {
        this.kfa.push(kf);
        this.tla[frame].kfIndex = this.kfa.length - 1;
      }
      css3kfa.Block_lastHighltKF_empty = null;
      css3kfa.Block_lastHighltKF = "tbf-" + timelineID + "-" + frame;
      var lastHighltKf = css3kfa.Block_lastHighltKF;
      css3kfa.timeline.setPlayStop_fn(true);
      this.updateAllTLA_fn();
      this.fillEmptyTLCells_fn();
      css3kfa.Block_lastHighltKF = lastHighltKf;
      return {keyframe:kf, frame:frame};
    }
  }, moveLastFrame_fn:function(toFrame, fromFrame) {
    var newKF = this.setKeyFrame_fn("x-x-" + toFrame, true);
    var kf1 = this.kfa[this.tla[fromFrame].kfIndex];
    for (var i = 0; i < kf1.styles.length; i++) {
      newKF.styles.push(kf1.styles[i]);
    }
    this.clearKeyFrame_fn("x-x-" + fromFrame);
    css3kfa.timeline.moveAndPlay_fn(toFrame);
  }, clearKeyFrame_fn:function(frameID) {
    var i, v, style, arr = frameID.split("-"), timelineID = Number(arr[1]), frame = Number(arr[2]), _id = "#tbf-" + timelineID + "-", prevFrame = -1, nextFrame = -1, kfIndex = this.tla[frame].kfIndex;
    if (frame >= this.tla.length || this.tla[frame].kfSet === false) {
      return;
    }
    for (i = frame - 1; i > -1; i--) {
      if (this.tla[i].kfSet) {
        prevFrame = i;
        break;
      }
    }
    for (i = frame + 1; i < this.tla.length; i++) {
      if (this.tla[i].kfSet) {
        if (nextFrame === -1) {
          nextFrame = i;
          break;
        }
        this.tla[i].kfIndex--;
      }
    }
    var kfIndex = this.tla[frame].kfIndex;
    this.tla[frame].kfSet = false;
    this.tla[frame].kfIndex = -1;
    if (prevFrame === -1 && nextFrame === -1) {
      v = _id + frame.toString();
      if (v === "#" + css3kfa.Block_lastHighltKF) {
        css3kfa.Block_lastHighltKF = null;
      }
      this.tla.length = 1;
    } else {
      if (prevFrame === -1) {
        for (i = 0; i < nextFrame; i++) {
          v = _id + i.toString();
          this.tla[i].kfIndex = -1;
          this.tla[i].kfSet = false;
          if (v === "#" + css3kfa.Block_lastHighltKF) {
            css3kfa.Block_lastHighltKF = null;
          }
        }
      } else {
        if (nextFrame === -1) {
          for (i = prevFrame + 1; i < this.tla.length; i++) {
            v = _id + i.toString();
            if (v === "#" + css3kfa.Block_lastHighltKF) {
              css3kfa.Block_lastHighltKF = null;
            }
          }
          this.tla.length = prevFrame + 1;
        }
      }
    }
    for (i = frame + 1; i < this.tla.length; i++) {
      if (this.tla[i].kfSet) {
        this.tla[i].kfIndex--;
      }
    }
    this.kfa.splice(kfIndex, 1);
    if (this.kfa.length === 1) {
      for (var p = 0; p < this.kfa[0].styles.length; p++) {
        var _style, style = this.kfa[0].styles[p], blockStyles = this.keyframe.styles, kfStylesLen = blockStyles.length;
        for (i = 0; i < kfStylesLen; i++) {
          _style = blockStyles[i];
          if (_style.name === style.name) {
            break;
          }
        }
        if (i !== kfStylesLen) {
          blockStyles.splice(i, 1);
        }
        this.keyframe.styles.push(style);
      }
      this.kfa[0].styles.length = 0;
    }
    if (this.kfa.length > 0) {
      var lastFrame = this.kfa[this.kfa.length - 1].frame;
      if (frame > lastFrame) {
        frame = lastFrame;
      }
    } else {
      frame = 0;
    }
    this.clearSimilarStylesEntire_fn();
    this.updateAllTLA_fn();
    css3kfa.timeline.moveAndPlay_fn(frame);
    css3kfa.timeline.saveData_fn();
    this.drawTimelineBlock_fn();
  }, clearSimilarStylesEntire_fn:function() {
    var kf, q, r, outerStyle;
    if (this.kfa.length === 1) {
      kf = this.kfa[0];
      for (r = 0; r < kf.styles.length; r++) {
        outerStyle = kf.styles[r];
        this.applyStyleToBlock_fn(outerStyle);
      }
      return;
    }
    kf = this.kfa[0];
    for (r = 0; r < kf.styles.length; r++) {
      outerStyle = kf.styles[r];
      this.clearSimilarStyles_fn(0, outerStyle);
    }
  }, copyStylesToBlock_fn:function() {
    var i, style, p, q, r, innerStyle, name, value, unit, dflt, variant, lastKF = this.kfa[this.kfa.length - 1];
    for (i = 0; i < lastKF.styles.length; i++) {
      style = lastKF.styles[i];
      for (var p = 0; p < style.value.length; p++) {
        innerStyle = style.value[p];
        name = innerStyle.name;
        value = innerStyle.value;
        unit = innerStyle.unit;
        dflt = innerStyle.isDflt;
        this.setStyle_fn(null, name, value, unit, dflt);
      }
      if (style.hasVariants) {
        for (q = 0; q < 4; q++) {
          variant = style.variants[q];
          if (variant !== null) {
            for (r = 0; r < variant.value.length; r++) {
              innerStyle = variant.value[r];
              name = innerStyle.name;
              value = innerStyle.value;
              unit = innerStyle.unit;
              dflt = innerStyle.isDflt;
              this.setStyle_fn(null, name, value, unit, dflt);
            }
          }
        }
      }
    }
  }, clearSimilarStyles_fn:function(index, style) {
    var i, p, q, r, kf, outerStyle1, outerStyle2, same = true, keyFrame = this.kfa[index], length = this.kfa.length;
    style = style.parent !== null ? style.parent : style;
    outerStyle1 = style;
    for (q = 0; q < this.kfa.length; q++) {
      if (q === index) {
        continue;
      }
      kf = this.kfa[q];
      for (r = 0; r < kf.styles.length; r++) {
        outerStyle2 = kf.styles[r];
        if (outerStyle1.name === outerStyle2.name) {
          if (!outerStyle1.isSame_fn(outerStyle2)) {
            same = false;
            q = this.kfa.length;
            break;
          }
        }
      }
    }
    if (same && keyFrame.styles.length > 0) {
      var styles;
      outerStyle1 = style;
      for (r = 0; r < length; r++) {
        kf = this.kfa[r];
        styles = kf.styles;
        for (i = 0; i < styles.length; i++) {
          outerStyle2 = styles[i];
          if (outerStyle1.name === outerStyle2.name) {
            if (outerStyle1.isSame_fn(outerStyle2)) {
              styles.splice(i, 1);
            }
          }
        }
      }
      this.applyStyleToBlock_fn(style);
    }
  }, applyStyleToBlock_fn:function(style) {
    var i, _style, kfStyles = this.keyframe.styles, kfStylesLen = kfStyles.length;
    for (i = 0; i < kfStylesLen; i++) {
      _style = kfStyles[i];
      if (_style.name === style.name) {
        break;
      }
    }
    if (i !== kfStylesLen) {
      kfStyles.splice(i, 1);
    }
    this.keyframe.styles.push(style);
  }, getLength_fn:function(l) {
    var _l, len = 0, children = this.children, kfa = this.kfa;
    for (var i = 0; i < children.length; i++) {
      _l = children[i].getLength_fn(l);
      if (_l > l) {
        l = _l;
      }
    }
    if (kfa.length > 0) {
      len = kfa[kfa.length - 1].frame + 1;
    }
    return l < len ? len : l;
  }, setKeyFrameStyles_fn:function(index) {
    var i, style;
    function cloneStyles(copyTo, copyFrom, swapInterp) {
      for (i = 0; i < copyFrom.styles.length; i++) {
        style = copyFrom.styles[i].clone_fn();
        copyTo.styles.push(style);
      }
    }
    if (this.kfa.length === 1) {
      return;
    }
    var kf = this.kfa[index];
    if (this.kfa.length === index + 1) {
      cloneStyles(kf, this.kfa[index - 1], false);
    } else {
      if (index === 0) {
        cloneStyles(kf, this.kfa[1], true);
      } else {
        var prevKF = this.kfa[index - 1];
        var nextKF = this.kfa[index + 1];
        if (prevKF !== null && nextKF !== null) {
          var prevStyle, nextStyle, newStyle, weight, p;
          for (i = 0; i < prevKF.styles.length; i++) {
            prevStyle = prevKF.styles[i];
            if (nextKF.getOuterStyleFromOuterName_fn(prevStyle.name) == null) {
              kf.push(prevStyle.clone_fn());
            }
          }
          for (i = 0; i < nextKF.styles.length; i++) {
            nextStyle = nextKF.styles[i];
            if (prevKF.getOuterStyleFromOuterName_fn(nextStyle.name) == null) {
              kf.push(nextStyle.clone_fn());
            }
          }
          for (i = 0; i < prevKF.styles.length; i++) {
            for (p = 0; p < prevKF.styles[i].value.length; p++) {
              prevStyle = prevKF.styles[i].value[p];
              nextStyle = nextKF.getInnerStyle_fn(prevStyle.name);
              if (prevStyle != null && nextStyle != null && prevStyle.value != null && nextStyle.value != null) {
                if (this.timingFunc === "steps") {
                  weight = Math.floor(this.stepAmt / (nextKF.frame - prevKF.frame) * kf.frame) / this.stepAmt;
                } else {
                  weight = (kf.frame - prevKF.frame) / (nextKF.frame - prevKF.frame);
                }
                newStyle = css3kfa.InnerStyle.interpolate_fn(prevStyle, nextStyle, weight);
                this.setStyle_fn(index, newStyle.name, newStyle.value, newStyle.unit);
              }
            }
          }
        }
      }
    }
    this.updateTLA_fn(index);
  }, setStyle_fn:function(frameIndex, innerStyleName, innerStyleValue, unit, dflt) {
    var style = null;
    if (frameIndex === null) {
      style = this.keyframe.getOuterStyleFromInnerName_fn(innerStyleName, false);
      if (style === null) {
        style = css3kfa.timeline.defaultStyles.getOuterStyleFromInnerName_fn(innerStyleName, true);
        style = style.clone_fn();
        this.keyframe.push(style);
      }
      style.setValue_fn(innerStyleName, innerStyleValue, dflt);
      if (unit !== undefined) {
        style.setUnit_fn(innerStyleName, unit);
      }
    } else {
      style = this.kfa[frameIndex].setStyle_fn(innerStyleName, innerStyleValue, unit, dflt);
    }
    return style;
  }, getOuterStyleFromInnerName_fn:function(styleName) {
    var style = this.keyframe.getOuterStyleFromInnerName_fn(styleName, false);
    if (style == null) {
      style = css3kfa.timeline.defaultStyles.getDefaultStyleFromInnerName_fn(styleName, true);
    }
    return style;
  }, getOuterStyleFromOuterName_fn:function(styleName) {
    return this.keyframe.getOuterStyleFromOuterName_fn(styleName);
  }, getInnerStyle_fn:function(styleName) {
    var style = this.keyframe.getInnerStyle_fn(styleName);
    if (style == null) {
      var s = css3kfa.timeline.defaultStyles.getDefaultStyleFromInnerName_fn(styleName);
      if (s != null) {
        style = s.getInnerStyle_fn(styleName);
      }
    }
    return style;
  }, getUnit_fn:function(innerStyleName) {
    return this.keyframe.getUnit_fn(innerStyleName);
  }, getValue_fn:function(innerStyleName) {
    var style = this.getInnerStyle_fn(innerStyleName);
    return style != null ? style.value : null;
  }, getValueOrDefault_fn:function(innerStyleName) {
    var innerStyle = this.getInnerStyle_fn(innerStyleName);
    return innerStyle != null ? innerStyle.valueOrDefault_fn() : null;
  }, hasStyle_fn:function(styleName) {
    return this.keyframe.hasStyle_fn(styleName);
  }, getCurrentKeyframeIndex_fn:function() {
    for (var i = 0; i < this.kfa.length; i++) {
      if (this.kfa[i].frame === css3kfa.timeline.currentFrame) {
        return i;
      }
    }
  }, getIterationCount_fn:function() {
    return css3kfa.timeline !== null && css3kfa.timeline.loopAnim === true ? "infinite" : "1";
  }, updateTLA_fn:function(frameIndex) {
    var tl, i, outer, outerStyle, styles, kfa = this.kfa, tla = this.tla;
    if (frameIndex > 0 && kfa.length > 1) {
      var x, y, p, style, prevStyle, weight, interpStyle, found = false, nextKF = kfa[frameIndex], prevKF = kfa[frameIndex - 1], numCells = nextKF.frame - prevKF.frame, step1 = 1 / numCells, step2 = this.stepAmt / numCells;
      for (i = 1; i < numCells; i++) {
        tl = tla[prevKF.frame + i];
        tl.tempStyles.length = 0;
        tl.styles.length = 0;
        if (tl.frameData !== undefined) {
          tl.frameData.length = 0;
        }
      }
      for (x = 0; x < nextKF.styles.length; x++) {
        style = nextKF.styles[x];
        prevStyle = prevKF.getOuterStyleFromOuterName_fn(style.name);
        if (prevStyle != null && prevStyle.canInterp === true) {
          for (i = 1; i < numCells; i++) {
            tl = this.tla[prevKF.frame + i];
            if (this.timingFunc === "steps") {
              weight = Math.floor(step2 * i) / this.stepAmt;
            } else {
              weight = step1 * i;
            }
            interpStyle = prevStyle.interpolate_fn(style, weight);
            interpStyle.applyBlockStyles_fn(this);
            tl.tempStyles.push(interpStyle);
          }
        }
      }
      for (i = 1; i < numCells; i++) {
        tl = tla[prevKF.frame + i];
        for (x = 0; x < this.keyframe.styles.length; x++) {
          outer = this.keyframe.styles[x];
          found = false;
          for (y = 0; y < tl.tempStyles.length; y++) {
            if (tl.tempStyles[y].name === outer.name) {
              found = true;
              break;
            }
          }
          if (!found) {
            tl.tempStyles.unshift(outer);
          }
        }
      }
      for (i = 1; i < numCells; i++) {
        tl = this.tla[prevKF.frame + i];
        styles = css3kfa.KeyFrame_sortStyles_fn(tl.tempStyles);
        tl.tempStyles.length = 0;
        for (p = 0; p < styles.length; p++) {
          outerStyle = styles[p];
          outerStyle.getNameValuePairs_fn(tl.styles);
          outerStyle.getFrameData_fn(tl.frameData);
        }
      }
    }
    tl = tla[kfa[frameIndex].frame];
    tl.styles.length = 0;
    tl.tempStyles.length = 0;
    tl.frameData.length = 0;
    for (i = 0; i < this.keyframe.styles.length; i++) {
      outer = this.keyframe.styles[i];
      if (outer !== undefined) {
        if (kfa[frameIndex].getOuterStyleFromOuterName_fn(outer.name) == null) {
          tl.tempStyles.push(outer);
        }
      }
    }
    for (i = 0; i < this.kfa[frameIndex].styles.length; i++) {
      outerStyle = this.kfa[frameIndex].styles[i].clone_fn();
      outerStyle.applyBlockStyles_fn(this);
      tl.tempStyles.push(outerStyle);
    }
    styles = css3kfa.KeyFrame_sortStyles_fn(tl.tempStyles);
    for (i = 0; i < styles.length; i++) {
      outerStyle = styles[i];
      outerStyle.getNameValuePairs_fn(tl.styles);
      outerStyle.getFrameData_fn(tl.frameData);
    }
  }, updateAllTLA_fn:function() {
    var i, tla = this.tla;
    for (i = 0; i < tla.length; i++) {
      tla[i].styles.length = 0;
      tla[i].tempStyles.length = 0;
    }
    for (i = 0; i < this.kfa.length; i++) {
      this.updateTLA_fn(i);
    }
  }, updateAllTLA_recurs_fn:function() {
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].updateAllTLA_recurs_fn();
    }
    this.updateAllTLA_fn();
  }, fillEmptyTLCells_fn:function() {
    var i;
    if (this.kfa.length > 0) {
      var tl, j, len = css3kfa.timeline.getLength_fn(), last = this.kfa[this.kfa.length - 1].frame, lastStyle = this.tla[last].styles;
      for (i = last + 1; i < len; i++) {
        if (this.tla.length - 1 < i) {
          this.tla.push({kfIndex:-1, kfSet:false, styles:[], tempStyles:[], frameData:[]});
        }
        tl = this.tla[i];
        tl.styles.length = 0;
        for (j = 0; j < lastStyle.length; j++) {
          tl.styles.push(lastStyle[j]);
        }
      }
      var first = this.kfa[0].frame;
      var firstStyle = this.tla[first].styles;
      for (i = 0; i < first; i++) {
        tl = this.tla[i];
        tl.styles.length = 0;
        for (j = 0; j < firstStyle.length; j++) {
          tl.styles.push(firstStyle[j]);
        }
      }
    }
    for (i = 0; i < this.children.length; i++) {
      this.children[i].fillEmptyTLCells_fn();
    }
  }, setAnimPlayState_fn:function(s) {
    this.animState = s === true ? "running" : "paused";
  }, getLayerName_fn:function(name) {
    if (this.name === name) {
      return true;
    }
    for (var i = 0; i < this.children.length; i++) {
      if (this.children[i].getLayerName_fn(name) === true) {
        return true;
      }
    }
    return false;
  }, getBlock_fn:function(id) {
    if (this.numericID === id) {
      return this;
    }
    for (var i = 0; i < this.children.length; i++) {
      var ret = this.children[i].getBlock_fn(id);
      if (ret != null) {
        return ret;
      }
    }
    return null;
  }, getFirstFrame_fn:function(frame) {
    if (frame === undefined) {
      frame = 0;
    }
    for (var i = 0; i < this.children.length; i++) {
      var ret = this.children[i].getFirstFrame_fn(frame);
      if (ret > frame) {
        frame = ret;
      }
      return frame;
    }
    return this.kfa[0].frame;
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);

