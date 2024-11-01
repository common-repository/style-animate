(function(css3kfa, $, undefined) {
  function StylePane_cl(timeline) {
    this.currentKeyframe = null;
    this.frameID = "#css3kfa-stylepane";
    this.overflowSet = false;
    this.isUpdating = false;
    this.dontRefresh = false;
    this.width = 0;
    this.hasDragged = false;
    this.dragging = false;
    this.canDrag = true;
    this.shown = false;
    this.unusedHidden = false;
    this.isMeasuringPicker = false;
    this.initialWidth = null;
  }
  css3kfa.Stylepane = StylePane_cl;
  StylePane_cl.prototype = {beginShow_fn:function(block, keyframe) {
    this.block = block;
    block.stylePane = this;
    this.currentKeyframe = keyframe;
    css3kfa.timeline.stylePane = this;
  }, refresh_fn:function() {
    if (this.dontRefresh === true) {
      return;
    }
    var i, defaultStyle, styleName, style, kf = null, timeline = css3kfa.timeline, defaultStyles = timeline.defaultStyles.styles, block = timeline.selectedBlock;
    if (block === undefined || block === null) {
      block = timeline.getFirstBlock_fn();
    }
    for (i = 0; i < block.kfa.length; i++) {
      if (block.kfa[i].frame === timeline.currentFrame) {
        kf = block.kfa[i];
        this.currentKeyframe = kf;
        break;
      }
    }
    this.beginShow_fn(block, kf);
    this.isUpdating = true;
    for (i = 0; i < defaultStyles.length; i++) {
      defaultStyle = defaultStyles[i];
      if (defaultStyle.open) {
        styleName = defaultStyle.name;
        if (styleName !== undefined) {
          style = null;
          if (this.currentKeyframe !== null) {
            style = this.currentKeyframe.getOuterStyleFromOuterName_fn(styleName);
          }
          if (style === null && this.block !== null) {
            style = this.block.getOuterStyleFromOuterName_fn(styleName);
          }
          if (style === null) {
            style = defaultStyle;
          }
          this.showStyle_fn(false, "", style);
        }
      }
    }
    this.resize_fn();
    this.startResizeDelayed_fn(0);
    this.isUpdating = false;
  }, resizeOnMenu_fn:function() {
    var stylePane = this;
    $(".css3kfa-stylepane-menubutton").on("mouseup touchend", stylePane.menuEventHandler_fn);
    $("body").on("mouseup touchend", stylePane.bodyEventHandler_fn);
  }, bodyEventHandler_fn:function(x, y) {
    var $stylePane = $("#css3kfa-stylepane"), xTop = $stylePane.offset().left, yTop = $stylePane.offset().top, xBottom = xTop + $stylePane.width(), yBottom = yTop + $stylePane.height();
    if (x < xTop || x > xBottom || y < yTop || y > yBottom) {
      css3kfa.timeline.stylePane.resize_fn();
      css3kfa.timeline.stylePane.startResizeDelayed_fn(0);
    }
  }, menuEventHandler_fn:function() {
    css3kfa.timeline.stylePane.resize_fn();
    css3kfa.timeline.stylePane.startResizeDelayed_fn(0);
  }, removeHandlers_fn:function() {
    var stylePane = this;
    $(".css3kfa-stylepane-menubutton").off("mouseup touchend", stylePane.menuEventHandler_fn);
    $("body").off("mouseup touchend", stylePane.bodyEventHandler_fn);
  }, startResizeDelayed_fn:function(count) {
    this.isMeasuringPicker = true;
    this.initialW = $("#css3kfa-stylepane").width();
    this.doResizeDelayed_fn(count);
  }, doResizeDelayed_fn:function(count) {
    count++;
    if (count > 25) {
      this.isMeasuringPicker = false;
      return;
    }
    var $stylePane = $("#css3kfa-stylepane"), stylepane = this, right = 0;
    $(".wp-picker-container").each(function() {
      var r = $(this).offset().left + $(this).outerWidth();
      if (r > right) {
        right = r;
      }
    });
    var left = $stylePane.offset().left, width = right - left, sw = $stylePane.width(), resetSize = true;
    $("div.css3kfa-accordion").each(function() {
      var obj = $(this);
      obj.children().each(function() {
        var obj1 = $(this);
        if (obj1.hasClass("css3kfa-accordion-head-open")) {
          resetSize = false;
        }
      });
    });
    var doResize = false;
    if (resetSize && this.initialWidth !== null) {
      width = this.initialWidth;
      doResize = true;
    }
    if (width > 0 && sw !== width) {
      width += 4;
      doResize = true;
    }
    if (doResize) {
      $stylePane.width(width);
      this.resize_fn(true);
    }
    setTimeout(function() {
      stylepane.doResizeDelayed_fn(count);
    }, 10);
  }, resize_fn:function(ignoreWidth) {
    var $stylePane = $("#css3kfa-stylepane"), $obj = $(".css3kfa-accordion"), v = $(".css3kfa-stylepanetitle").outerHeight(), h = $obj.outerHeight() + 1, numAccordions = this.unusedHidden === true ? $(".css3kfa-accordion-hlt").length : $obj.length, maxHeight = h * numAccordions + v + 4, borderW = $stylePane.outerWidth() - $stylePane.innerWidth(), maxWidth = borderW;
    $(".css3kfa-style-outer-panel").each(function() {
      maxHeight += this.offsetHeight;
    });
    if (maxWidth < this.width) {
      maxWidth = this.width;
    }
    if (maxWidth < 320) {
      maxWidth = 320;
    }
    if (ignoreWidth !== true) {
      $stylePane.css({"width":maxWidth + "px", "height":maxHeight + "px"});
    } else {
      $stylePane.css({"height":maxHeight + "px"});
    }
    if (!this.hasDragged) {
      css3kfa_obj.positionStylePane_fn(true);
    }
  }, resizePicker_fn:function() {
    if (!this.isMeasuringPicker) {
      this.startResizeDelayed_fn(0);
    }
  }, show_fn:function(styleName) {
    this.isUpdating = true;
    var i, style, _style, innerID, draw = this.shown === false;
    if (draw) {
      this.draw_fn();
      this.shown = true;
    }
    var timeline = css3kfa.timeline;
    var defaultStyles = timeline.defaultStyles.styles;
    if (this.initialWidth === null) {
      var $stylePane = $("#css3kfa-stylepane");
      this.initialWidth = $stylePane.width();
    }
    for (i = 0; i < defaultStyles.length; i++) {
      _style = defaultStyles[i];
      if (styleName !== undefined && styleName !== _style.name) {
        continue;
      }
      style = null;
      if (this.currentKeyframe !== null) {
        style = this.currentKeyframe.getOuterStyleFromOuterName_fn(_style.name);
      }
      if (style === null && this.block !== null) {
        style = this.block.getOuterStyleFromOuterName_fn(_style.name);
      }
      if (style === null) {
        style = _style;
      }
      innerID = "css3kfa-inner-accordion_" + i;
      this.showStyle_fn(draw, innerID, style);
    }
    if (draw) {
      var v, index, id, el, stylePane = this;
      $(".css3kfa-style-table").on("mouseup", function() {
        stylePane.resizePicker_fn();
      });
      v = $(".css3kfa-accordion").on("mouseup", function() {
        if (stylePane.dragging === false) {
          var defaultStyles = css3kfa.timeline.defaultStyles.styles;
          $(this).next().toggle();
          $(this).children().toggleClass("css3kfa-accordion-head-open");
          index = Number(this.id.split("_")[1]);
          defaultStyles[index].open = !defaultStyles[index].open;
          stylePane.refresh_fn();
        }
      });
      v.next().hide();
      for (i = 0; i < v.length; i++) {
        id = v[i].id.split("_");
        index = Number(id[1]);
        if (defaultStyles[index].open) {
          el = $("#" + v[i].id);
          el.next().toggle();
          el.children().toggleClass("css3kfa-accordion-head-open");
        }
      }
      v = $(".css3kfa-accordion-inner").on("mouseup", function() {
        $(this).next().toggle();
        $(this).children().toggleClass("css3kfa-accordion-inner-head-open");
        index = this.id.split("_")[1];
        defaultStyles[index].inneropen = !defaultStyles[index].inneropen;
        stylePane.refresh_fn();
      });
      v.next().hide();
      for (i = 0; i < v.length; i++) {
        id = v[i].id.split("_");
        index = id[1];
        if (defaultStyles[index].inneropen) {
          el = $("#" + v[i].id);
          el.next().toggle();
          el.children().toggleClass("css3kfa-accordion-inner-head-open");
        }
      }
      $("a.wp-color-result").on("mouseup touchend", function() {
        stylePane.resizePicker_fn();
      });
    }
    this.isUpdating = false;
  }, showStyle_fn:function(draw, el, style) {
    function showStyleIcon(style, id) {
      var iconElementId = "css3kfa-" + id + "a", iconId = iconElementId + "_ui", className = "", titleName = style.displayName, displayName = titleName.replace(/\s|-/g, "");
      $("#" + iconElementId).append('<div id="' + iconId + '" title="">&nbsp;</div>');
      switch(displayName) {
        case "top":
          className = "css3kfa-style-icon-top";
          break;
        case "left":
          className = "css3kfa-style-icon-left";
          break;
        case "bottom":
          className = "css3kfa-style-icon-bottom";
          break;
        case "right":
          className = "css3kfa-style-icon-right";
          break;
        case "topleft":
          className = "css3kfa-style-icon-topleft";
          break;
        case "bottomleft":
          className = "css3kfa-style-icon-bottomleft";
          break;
        case "topright":
          className = "css3kfa-style-icon-topright";
          break;
        case "bottomright":
          className = "css3kfa-style-icon-bottomright";
          break;
        default:
          className = style.value[0].name.includes("radius") ? "css3kfa-style-icon-borderradius" : "css3kfa-style-icon-border";
          titleName = "all";
          break;
      }
      titleName = titleName.replace(/-/g, " ");
      $("#" + iconId).removeClass().addClass(className).attr("title", titleName);
    }
    if (style === null) {
      return;
    }
    var i, anim, colspan, containerId, id, id1, displayName, name, rowId, widthClass, styleName = style.name, innerStyles = style.value;
    if (draw) {
      containerId = "css3kfa-container_" + styleName;
      var html = '<table class="css3kfa-style-table">';
      if (style.singleLine === true) {
        id = "css3kfa-" + styleName;
        rowId = id + "_row";
        anim = style.canInterp === true ? '<td class="css3kfa-style-cananim-cell"><div class="css3kfa-style-can-anim" title="Can be animated" alt="can be animated">&nbsp;</div></td>' : '<td class="css3kfa-style-cananim-cell"><div class="css3kfa-style-cant-anim" title="Cannot be animated" alt="Cannot be animated">&nbsp;</div></td>';
        html += '<tr id="' + rowId + '">' + anim + '<td id="' + id + 'z" class="css3kfa-style-clearbutton-cell"></td><td class="css3kfa-style-width-label css3kfa-style-text" id="' + id + 'a"></td>';
        for (i = 0; i < innerStyles.length; i++) {
          id1 = "css3kfa-" + styleName + i;
          widthClass = i < innerStyles.length - 1 && innerStyles[i].unitType !== "color" ? ' class="css3kfa-style-width"' : "";
          if (i === innerStyles.length - 2 && innerStyles[i + 1].unitType === "color") {
            widthClass = "";
          }
          if (innerStyles[i].unitType === "line-style") {
            html += "<td" + widthClass + ' id="' + id1 + 'b" colspan="2"></td><td id="' + id1 + 'b1"></td>';
          } else {
            html += "<td" + widthClass + ' id="' + id1 + 'b"></td><td id="' + id1 + 'b1"></td>';
          }
        }
        html += "</tr>";
      } else {
        for (i = 0; i < innerStyles.length; i++) {
          displayName = innerStyles[i].displayName.replace("-", "&#8209;").replace(" ", "&nbsp;");
          name = styleName + i;
          id = "css3kfa-" + name;
          rowId = id + "_row";
          switch(innerStyles[i].unitType) {
            case "image":
            case "bgsize":
            case "bgrepeat":
            case "bgclip":
            case "bgorigin":
            case "bgattachment":
              colspan = ' colspan="2"';
              break;
            default:
              colspan = "";
          }
          anim = innerStyles[i].canInterp === true ? '<td class="css3kfa-style-cananim-cell"><div class="css3kfa-style-can-anim" title="Can be animated" alt="Can be animated">&nbsp;</div></td>' : '<td class="css3kfa-style-cananim-cell"><div class="css3kfa-style-cant-anim" title="Cannot be animated" alt="Cannot be animated">&nbsp;</div></td>';
          if (style.showIcon === true) {
            html += '<tr id="' + rowId + '">' + anim + '<td id="' + id + 'z" class="css3kfa-style-clearbutton-cell"></td><td class="css3kfa-style-width-label css3kfa-style-text" id="' + id + 'a"></td><td class="css3kfa-style-width" id="' + id + 'b"' + colspan + '></td><td class="css3kfa-style-width" id="' + id + 'b1"></td><td id="' + id + 'c"></td></tr>';
          } else {
            html += '<tr id="' + rowId + '">' + anim + '<td id="' + id + 'z" class="css3kfa-style-clearbutton-cell"></td><td class="css3kfa-style-width-label css3kfa-style-text" id="' + id + 'a">' + displayName + '</td><td class="css3kfa-style-width" id="' + id + 'b"' + colspan + '></td><td class="css3kfa-style-width" id="' + id + 'b1"></td><td id="' + id + 'c"></td></tr>';
          }
          if (style.isGradient_fn()) {
            if (i >= style.firstPos) {
              i++;
            }
          }
        }
      }
      html += "</table>";
      $("#" + el).append('<div id="' + containerId + '">' + html + "</div>");
    }
    var innerStyleName, outerStyleName, value, clearButtonInactive, clearButtonElementId, clearButtonId, elementId, innerStyle, _styleValue;
    if (style.singleLine === true) {
      id = styleName;
      innerStyle = innerStyles[0];
      clearButtonElementId = "css3kfa-" + id + "z";
      value = innerStyle.value;
      clearButtonId = clearButtonElementId + "_ui";
      style.clearButtonId = clearButtonId;
      clearButtonInactive = false;
      style.rowId = "css3kfa-" + id + "_row";
      for (i = 0; i < innerStyles.length; i++) {
        innerStyle = innerStyles[i];
        _styleValue = this.currentKeyframe === null ? null : this.currentKeyframe.getValue_fn(innerStyle.name);
        if (_styleValue === null) {
          _styleValue = this.block.getValue_fn(innerStyle.name);
        }
        if (_styleValue !== null) {
          clearButtonInactive = true;
          break;
        }
      }
      if (draw) {
        $("#" + clearButtonElementId).append('<div id="' + clearButtonId + '" class="css3kfa-style-clear-button-inactive" title="Remove Style"></div>');
        showStyleIcon(style, id);
      }
      for (i = 0; i < innerStyles.length; i++) {
        id = styleName + i;
        elementId = "css3kfa-" + id + "b";
        innerStyle = innerStyles[i];
        styleName = style.name;
        this.uiElements_fn(draw, innerStyle, elementId, styleName);
      }
      style.setClearButtonState_fn(this);
    } else {
      clearButtonInactive = false;
      for (i = 0; i < innerStyles.length; i++) {
        innerStyle = innerStyles[i];
        _styleValue = this.currentKeyframe === null ? null : this.currentKeyframe.getValue_fn(innerStyle.name);
        if (_styleValue === null) {
          _styleValue = this.block.getValue_fn(innerStyle.name);
        }
        if (_styleValue !== null) {
          clearButtonInactive = true;
        }
        if (style.isGradient_fn() === false) {
          innerStyleName = innerStyle.name;
          outerStyleName = styleName;
          id = outerStyleName + i;
          elementId = "css3kfa-" + id + "b";
          clearButtonElementId = "css3kfa-" + id + "z";
          clearButtonId = clearButtonElementId + "_ui";
          innerStyle.clearButtonId = clearButtonId;
          innerStyle.rowId = "css3kfa-" + id + "_row";
          if (draw) {
            value = this.currentKeyframe === null ? null : this.currentKeyframe.getValue_fn(outerStyleName);
            if (value === null) {
              value = this.block.getValue_fn(outerStyleName);
            }
            $("#" + clearButtonElementId).append('<div id="' + clearButtonId + '" class="css3kfa-style-clear-button-inactive" title="Remove Style"></div>');
            if (style.showIcon === true) {
              showStyleIcon(style, id);
            }
          }
          this.uiElements_fn(draw, innerStyle, elementId, outerStyleName);
          style.setClearButtonState_fn(this, innerStyleName);
        } else {
          if (i < style.firstPos) {
            innerStyleName = innerStyle.name;
            outerStyleName = styleName;
            id = outerStyleName + i;
            rowId = "css3kfa-" + id + "_row";
            elementId = "css3kfa-" + id + "b";
            clearButtonElementId = "css3kfa-" + id + "z";
            clearButtonId = clearButtonElementId + "_ui";
            innerStyle.clearButtonId = clearButtonId;
            innerStyle.rowId = rowId;
            if (draw) {
              value = this.currentKeyframe === null ? null : this.currentKeyframe.getValue_fn(outerStyleName);
              if (value === null) {
                value = this.block.getValue_fn(outerStyleName);
              }
              $("#" + clearButtonElementId).append('<div id="' + clearButtonId + '" class="css3kfa-style-clear-button-inactive" title="Remove Style"></div>');
            }
            this.uiElements_fn(draw, innerStyle, elementId, outerStyleName);
            style.setClearButtonState_fn(this, innerStyleName);
          } else {
            if (i < innerStyles.length - 1) {
              innerStyle = innerStyles[i + 1];
              innerStyleName = innerStyle.name;
              outerStyleName = styleName;
              id = outerStyleName + i;
              id1 = outerStyleName + (i + 1).toString();
              elementId = "css3kfa-" + id + "b";
              clearButtonElementId = "css3kfa-" + id + "z";
              clearButtonId = "css3kfa-" + id1 + "z_ui";
              rowId = "css3kfa-" + id1 + "_row";
              innerStyle.clearButtonId = clearButtonId;
              innerStyle.rowId = rowId;
              if (draw) {
                value = this.currentKeyframe === null ? null : this.currentKeyframe.getValue_fn(outerStyleName);
                if (value === null) {
                  value = this.block.getValue_fn(outerStyleName);
                }
                $("#" + clearButtonElementId).append('<div id="' + clearButtonId + '" class="css3kfa-style-clear-button-inactive" title="Remove Style"></div>');
              }
              this.uiElements_fn(draw, innerStyle, elementId, outerStyleName);
              style.setClearButtonState_fn(this, innerStyleName);
              innerStyle = innerStyles[i];
              innerStyleName = innerStyle.name;
              outerStyleName = styleName;
              id = outerStyleName + i;
              elementId = "css3kfa-" + id + "c";
              if (draw) {
                innerStyle.clearButtonId = clearButtonId;
                value = this.currentKeyframe === null ? null : this.currentKeyframe.getValue_fn(outerStyleName);
                if (value === null) {
                  value = this.block.getValue_fn(outerStyleName);
                }
              }
              this.uiElements_fn(draw, innerStyle, elementId, outerStyleName);
              style.setClearButtonState_fn(this, innerStyleName);
              i++;
            }
          }
        }
      }
      style.sortInnerStyles_fn();
    }
    if (style.hasVariants === true) {
      var variant, innerID1 = el + "_inner-accordion1";
      id = el + "_accordion1";
      if (draw) {
        $("#" + el).append('<div class="css3kfa-accordion-inner" id="' + id + '"><div class="css3kfa-accordion-inner-head"></div></div><div class="css3kfa-style-inner-panel css3kfa-style-inner-panel-v" id="' + innerID1 + '"></div>');
      }
      for (var p = 0; p < 4; p++) {
        variant = style.variants[p];
        if (variant !== null) {
          this.showStyle_fn(draw, innerID1, variant);
        }
      }
    }
  }, uiElements_fn:function(draw, innerStyle, elementID, styleName) {
    var styleValue = "", currFrame = css3kfa.timeline.currentFrame, tla = this.block.tla;
    if (currFrame >= tla.length) {
      currFrame = tla.length - 1;
    }
    var frameData = tla[currFrame].frameData;
    if (frameData === undefined) {
      return;
    }
    for (var i = 0; i < frameData.length; i++) {
      if (frameData[i].name == innerStyle.name) {
        styleValue = frameData[i].value;
        break;
      }
    }
    if (styleValue == "") {
      var _s = this.currentKeyframe === null ? null : this.currentKeyframe.getValueOrDefault_fn(innerStyle.name);
      if (_s === null || _s.value === null || _s.isDflt === true) {
        _s = this.block.getValueOrDefault_fn(innerStyle.name);
      }
      styleValue = _s !== null ? _s.value : null;
    }
    var params = {draw:draw, innerStyleName:innerStyle.name, elementID:elementID, styleName:styleName, value:styleValue, isUnit:false}, params1 = {draw:draw, innerStyleName:innerStyle.name, elementID:elementID + 1, styleName:styleName, value:styleValue, isUnit:true};
    switch(innerStyle.unitType) {
      case "fontfamily":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "Georgia, serif", "Palatino Linotype, Book Antiqua, Palatino, serif", "Times New Roman, Times, serif", "Arial, Helvetica, sans-serif", "Arial Black, Gadget, sans-serif", "Comic Sans MS, cursive, sans-serif", "Impact, Charcoal, sans-serif", "Lucida Sans Unicode, Lucida Grande, sans-serif", "Tahoma, Geneva, sans-serif", "Trebuchet MS, Helvetica, sans-serif", "Verdana, Geneva, sans-serif", "Courier New, Courier, monospace", "Lucida Console, Monaco, monospace");
        break;
      case "fontstyle":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "normal", "italic", "oblique");
        break;
      case "fontweight":
        this.numberbox_fn(params, 100, 100, 900);
        break;
      case "textdecorationline":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "none", "solid", "dotted", "dashed", "double", "wavy");
        break;
      case "textdecorationstyle":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "none", "underline", "overline", "line-through");
        break;
      case "fontvariant":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "normal", "small-caps");
        break;
      case "texttransform":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "none", "capitalize", "uppercase", "lowercase");
        break;
      case "textalign":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "left", "right", "center", "justify");
        break;
      case "textoverflow":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "clip", "ellipsis", "string");
        break;
      case "pixel":
      case "pixelpositive":
        if (innerStyle.unitType === "pixelpositive") {
          this.numberbox_fn(params, 1, 0, 1000);
        } else {
          this.numberbox_fn(params, 1);
        }
        params1.value = innerStyle.unit;
        this.pulldown_fn(params1, "css3kfa-unit-pulldown", "px", "em", "rem", "%", "vw", "vh", "vmin", "vmax", "pt", "pc", "in", "cm", "mm", "ex", "ch");
        break;
      case "color":
        this.textbox_fn(params);
        this.colorpicker_fn(params);
        break;
      case "degrees":
        this.numberbox_fn(params);
        this.slider_fn(params);
        break;
      case "degree":
        this.numberbox_fn(params, 1, 0, 360);
        this.showunit_fn(params1, "&deg;");
        break;
      case "line-style":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "none", "solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset");
        break;
      case "decimal":
        this.numberbox_fn(params, 0.1);
        break;
      case "decimalmax":
        this.numberbox_fn(params, 0.1, 0, 1);
        break;
      case "percent":
      case "percentzero":
        this.numberbox_fn(params, 1, 0, 100);
        this.showunit_fn(params1, "%");
        break;
      case "percentmax":
        this.numberbox_fn(params, 1, 0, 10000);
        this.showunit_fn(params1, "%");
        break;
      case "backface-visibility":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "visible", "hidden");
        break;
      case "transform-style":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "preserve-3d", "flat");
        break;
      case "gradient":
        this.gradient(params);
        break;
      case "image":
        this.urlbox_fn(params);
        this.mediabutton_fn(params);
        break;
      case "repeat":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "stretch", "repeat", "round");
        break;
      case "type":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "circle", "ellipse");
        break;
      case "placement":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "closest-side", "closest-corner", "farthest-side", "farthest-corner", "contain", "cover");
        break;
      case "bgrepeat":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "repeat", "repeat-x", "repeat-y", "no-repeat");
        break;
      case "bgsize":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "initial", "cover", "contain");
        break;
      case "bgorigin":
      case "bgclip":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "padding-box", "border-box", "content-box");
        break;
      case "bgattachment":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "local", "scroll", "fixed");
        break;
      case "overflow":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "hidden", "visible", "scroll", "auto");
        break;
      case "display":
        this.pulldown_fn(params, "css3kfa-border-pulldown", "block", "inline-block", "none");
        break;
    }
  }, pulldown_fn:function() {
    var v, arg = 0, select = "", params = arguments[arg++], draw = params.draw, innerStyleName = params.innerStyleName, value = params.value, isUnit = params.isUnit, el = params.elementID, id = el + "_ui", styleClass = arguments[arg++], stylepane = this;
    if (draw) {
      $("#" + el).append('<select id="' + id + '-pulldown" class="' + styleClass + '"></select>');
    }
    if (value === "") {
      select += '<option value=""></option>';
    }
    for (var i = arg; i < arguments.length; i++) {
      v = arguments[i];
      select += '<option value="' + v + '"' + (value === v ? " selected" : "") + ">" + v + "</option>";
    }
    $("#" + id + "-pulldown").off().html(select).on("change", {x:innerStyleName, z:id, isUnit:isUnit}, function(e) {
      stylepane.update_fn(e);
    });
  }, colorpicker_fn:function(params) {
    var draw = params.draw, innerStyleName = params.innerStyleName, el = params.elementID, id = el + "_ui", styleValue = params.value, stylepane = this, isSet = styleValue !== null, $id = $("#" + id);
    $id.data({"styleName":innerStyleName, "id":id, "defaultColor":styleValue});
    if (draw) {
      if ($id.data("colorPicker") === undefined) {
        $id.data("colorPicker", true).alphaColorPicker({callback:function(name, id, value) {
          stylepane.update_fn({data:{x:name, z:id, val:value}});
        }});
      }
    }
    if (isSet && !draw) {
      $id.val(styleValue);
      var fn = $id.data("picker");
      if (fn !== undefined) {
        fn(styleValue);
      }
    }
  }, textbox_fn:function(params) {
    var draw = params.draw, innerStyleName = params.innerStyleName, el = params.elementID, id = el + "_ui", styleValue = params.value, stylepane = this;
    if (draw) {
      $('<div style="display:inline"><input type="text" id="' + id + '" value="" class="css3kfa-style-textbox"></div>').appendTo($("#" + el)).keydown({x:innerStyleName, z:id}, function(e) {
        if (e.which === 13) {
          stylepane.update_fn(e);
        }
      });
    }
    $("#" + id).val(styleValue != null ? styleValue.toString() : "");
  }, urlbox_fn:function(params) {
    var draw = params.draw, innerStyleName = params.innerStyleName, el = params.elementID, id = el + "_ui", styleValue = params.value, stylepane = this;
    if (draw) {
      $('<div style="display:inline"><input type="text" id="' + id + '" value="" class="css3kfa-style-textbox"></div>').appendTo($("#" + el)).keydown({x:innerStyleName, z:id}, function(e) {
        if (e.which === 13) {
          var id = e.data.z, styleValue = $("#" + id).val();
          if (/^http/.exec(styleValue) !== null) {
            stylepane.update_fn(e);
          }
        }
      });
    }
    var arr = styleValue.split("/");
    if (arr.length > 1) {
      styleValue = arr[arr.length - 1];
    }
    $("#" + id).val(styleValue != null ? styleValue.toString() : "");
  }, mediabutton_fn:function(params) {
    var draw = params.draw, innerStyleName = params.innerStyleName, el = params.elementID + "1", numBoxID = params.elementID + "_ui", buttonID = numBoxID + "_button", stylepane = this;
    if (draw) {
      $('<div class="css3kfa-media-button" id="' + buttonID + '"></div>').appendTo($("#" + el)).click({x:innerStyleName, z:numBoxID}, function(e) {
        stylepane.browseMedia_fn(e);
      });
    }
  }, slider_fn:function(params) {
    var draw = params.draw, innerStyleName = params.innerStyleName, el = params.elementID + "1", numBoxID = params.elementID + "_ui", sliderID = numBoxID + "_slider", styleValue = params.value, stylepane = this;
    if (draw) {
      $("td#" + el).addClass("css3kfa-slider-overlap");
      $('<div class="css3kfa-small-slider" id="' + sliderID + '"></div>').on("mousedown", function() {
        stylepane.canDrag = false;
      }).on("mouseup", function() {
        stylepane.canDrag = true;
      }).appendTo($("#" + el)).slider({range:"min", min:-360, max:360, value:styleValue != null ? styleValue : 0, slide:function(event, ui) {
        $("#" + numBoxID).val(ui.value);
        stylepane.update_fn({data:{x:innerStyleName, z:numBoxID}});
      }});
    }
    $("#" + numBoxID + "_slider").slider("value", $.isNumeric(styleValue) ? styleValue : 0);
  }, numberbox_fn:function(params, step, min, max) {
    var draw = params.draw, innerStyleName = params.innerStyleName, el = params.elementID, id = el + "_ui", id1 = el + "1_ui", styleValue = params.value, stylepane = this;
    if (step === undefined) {
      step = 1;
    }
    var sMin = ' min="' + (min !== undefined && min !== null ? min : "-10000") + '"';
    var sMax = ' max="' + (max !== undefined && max !== null ? max : "10000") + '"';
    if (draw) {
      $('<input type="number" step="' + step + '" id="' + id + '" class="css3kfa-style-numberbox"' + sMin + sMax + ">").appendTo($("#" + el));
    }
    $("#" + el).off().on("change", {x:innerStyleName, z:id, z1:id1}, function(e) {
      stylepane.update_fn(e);
    }).keydown({x:innerStyleName, z:id, z1:id1}, function(e) {
      if (e.which === 13) {
        stylepane.update_fn(e);
      }
    });
    $("#" + id).val(styleValue !== null && $.isNumeric(styleValue) ? styleValue : "");
  }, showunit_fn:function(params, content) {
    if (params.draw) {
      $("#" + params.elementID).append('<div class="css3kfa-style-unit">' + content + "</div>");
    }
  }, browseMedia_fn:function(e) {
    var id = e.data.z, stylepane = this;
    $(this.frameID).hide();
    $("#css3kfa-editorpane").hide();
    css3kfa.timeline.closeDialogs_fn();
    if (this.file_frame !== undefined) {
      this.file_frame.open();
      return;
    }
    this.file_frame = wp.media.frames.file_frame = wp.media({title:jQuery(this).data("uploader_title"), button:{text:jQuery(this).data("uploader_button_text")}, multiple:false});
    var file_frame = this.file_frame;
    this.file_frame.on("select", function() {
      var attachment = file_frame.state().get("selection").first().toJSON();
      $("#" + id).val(attachment.url);
      stylepane.update_fn(e);
    });
    this.file_frame.open();
    this.file_frame.on("close", function() {
      $(stylepane.frameID).show();
      $("#css3kfa-editorpane").show();
    });
  }, update_fn:function(e) {
    if (this.isUpdating === true || this.block === null) {
      return;
    }
    var style, styleValue, unitValue, kf, outerStyle = null, keyframe = this.currentKeyframe, block = this.block, kfa = block.kfa, innerStyleName = e.data.x, id = e.data.z, $slider = $("#" + id + "_slider"), wasNull = false, onlyFrame = true, lastFrame = true, i = 0, frameIndex = 0, blockStyle = block.getOuterStyleFromInnerName_fn(innerStyleName, true), innerStyle = blockStyle.getInnerStyle_fn(innerStyleName), innerStyleValue = innerStyle.value, timeline = css3kfa.timeline, currentFrame = timeline.currentFrame, 
    canInterp = innerStyle.canInterp, length = kfa.length;
    if (e.data.val !== undefined) {
      styleValue = e.data.val;
    } else {
      if (e.data.isUnit === false) {
        styleValue = $("#" + id + "-pulldown").val();
      } else {
        styleValue = $("#" + id).val();
        if (styleValue === undefined) {
          styleValue = innerStyle.value;
          if (styleValue === null) {
            styleValue = innerStyle.dflt;
          }
        }
        unitValue = $("#" + id + "-pulldown").val();
        if (unitValue === undefined) {
          var id1 = e.data.z1;
          if (id1 !== undefined) {
            unitValue = $("#" + id1 + "-pulldown").val();
          }
        }
      }
    }
    if (unitValue === undefined) {
      unitValue = innerStyle.unit;
    }
    styleValue = innerStyle.validate_fn(styleValue);
    if ($slider.length > 0) {
      $slider.slider("value", styleValue);
    }
    for (i = 0; i < length; i++) {
      kf = kfa[i];
      if (kf === keyframe) {
        frameIndex = i;
      }
      if (onlyFrame === true) {
        if (kf.hasStyle_fn(innerStyleName)) {
          onlyFrame = false;
        }
      }
    }
    if (kfa[frameIndex].frame !== currentFrame) {
      var canAdd = true;
      var selectedBlock = timeline.selectedBlock;
      if (css3kfa.timeline.animType === 2) {
        if (length > 1) {
          canAdd = false;
          selectedBlock.moveLastFrame_fn(currentFrame, kfa[length - 1].frame);
          currentFrame = kfa[length - 1].frame;
        }
      }
      if (canAdd) {
        this.dontRefresh = true;
        if (selectedBlock === null || selectedBlock === undefined) {
          selectedBlock = timeline.getFirstBlock_fn();
        }
        var frameId = "tbf-" + selectedBlock.numericID.toString() + "-" + currentFrame;
        keyframe = selectedBlock.setKeyFrame_fn(frameId);
        this.currentKeyframe = keyframe;
        this.dontRefresh = false;
        length = kfa.length;
        for (i = 0; i < length; i++) {
          kf = kfa[i];
          if (kf === keyframe) {
            frameIndex = i;
          }
          if (onlyFrame === true) {
            if (kf.hasStyle_fn(innerStyleName)) {
              onlyFrame = false;
            }
          }
        }
      }
    }
    if (innerStyleValue === null) {
      if (canInterp) {
        innerStyleValue = innerStyle.valueOrDefault_fn().value;
        if (innerStyleValue === "auto" || innerStyleValue === "initial") {
          innerStyleValue = styleValue;
        }
      } else {
        innerStyleValue = styleValue;
      }
      wasNull = true;
    }
    if (onlyFrame) {
      var firstStyle, newStyle;
      for (i = 0; i < frameIndex; i++) {
        if (!kfa[i].hasStyle_fn(innerStyleName)) {
          if (canInterp) {
            firstStyle = block.setStyle_fn(i, innerStyleName, innerStyleValue, innerStyle.unit);
          }
        }
      }
      for (i = frameIndex + 1; i < length; i++) {
        if (!kfa[i].hasStyle_fn(innerStyleName)) {
          if (canInterp) {
            firstStyle = block.setStyle_fn(i, innerStyleName, styleValue, innerStyle.unit);
          }
        }
      }
      newStyle = block.setStyle_fn(null, innerStyleName, styleValue, unitValue);
      newStyle.update_fn(this, innerStyleName);
    }
    lastFrame = true;
    if (canInterp) {
      outerStyle = block.setStyle_fn(frameIndex, innerStyleName, styleValue, unitValue);
    }
    for (i = frameIndex + 1; i < length; i++) {
      style = kfa[i].getInnerStyle_fn(innerStyleName);
      if (style !== null) {
        lastFrame = false;
        break;
      }
    }
    if (!canInterp || lastFrame && !onlyFrame) {
      outerStyle = block.setStyle_fn(null, innerStyleName, styleValue, unitValue);
    }
    if (!canInterp) {
      for (i = 0; i < length; i++) {
        style = kfa[i].getInnerStyle_fn(innerStyleName);
        if (style != null) {
          style.value = styleValue;
          if (unitValue != null) {
            style.unit = unitValue;
            style.isDflt = false;
          }
        }
      }
    }
    block.clearSimilarStyles_fn(frameIndex, outerStyle);
    var same = true;
    for (i = 0; i < length; i++) {
      style = kfa[i].getInnerStyle_fn(innerStyleName);
      if (style !== null && style.unit !== unitValue) {
        same = false;
        break;
      }
    }
    style = block.keyframe.getInnerStyle_fn(innerStyleName);
    if (style !== null && style.unit !== unitValue) {
      same = false;
    }
    if (same === false) {
      if (style !== null) {
        style.unit = unitValue;
      }
      for (i = 0; i < length; i++) {
        style = kfa[i].getInnerStyle_fn(innerStyleName);
        if (style !== null) {
          style.unit = unitValue;
        }
      }
    }
    var show = outerStyle.update_fn(this, innerStyleName);
    block.updateAllTLA_fn();
    timeline.fillAllEmptyTLCells_fn();
    timeline.drawScene_fn(this.block.kfa[frameIndex].frame);
    if (show === true) {
      this.show_fn(outerStyle.name);
    } else {
      if (blockStyle.redisplay_fn(innerStyleName) === true && wasNull === true) {
        this.show_fn();
      }
    }
    timeline.saveData_fn();
    css3kfa_obj.positionMarkers_fn(true);
  }, draw_fn:function() {
    var _style, style, id, innerID, dfltStyles = css3kfa.timeline.defaultStyles.styles, stylepane = this, len = dfltStyles.length, $pane = $(this.frameID);
    $pane.append('<div class="css3kfa-stylepanetitle"><div class="css3kfa-hamburger css3kfa-stylepane-menubutton"></div><div class="css3kfa-stylepanehead">STYLES</div><div class="css3kfa-stylepane-closebutton"></div></div>');
    $(".css3kfa-stylepane-closebutton").on("click", function() {
      var timeline = css3kfa.timeline;
      css3kfa_obj.deactivate_fn();
      timeline.animation.closeEditor_fn();
      timeline.animation.hidePanes_fn();
      css3kfa.timeline.cleanup_fn();
      css3kfa.timeline = null;
    });
    for (var i = 0; i < len; i++) {
      _style = dfltStyles[i];
      style = null;
      if (this.currentKeyframe != null) {
        style = this.currentKeyframe.getOuterStyleFromOuterName_fn(_style.name);
      }
      if (style === null && this.block != null) {
        style = this.block.getOuterStyleFromOuterName_fn(_style.name);
      }
      if (style === null) {
        style = _style;
      }
      id = "css3kfa-accordion_" + i;
      innerID = "css3kfa-inner-accordion_" + i;
      $pane.append('<div class="css3kfa-accordion" id="' + id + '"><span class="css3kfa-accordion-head">' + style.displayName + '</span></div><div class="css3kfa-style-inner-panel css3kfa-style-outer-panel" id="' + innerID + '"></div>');
    }
    var iconsPath = css3kfa_vars.pluginPath + "jquery-simple-context-menu-master/icons/";
    var closeFunc = {label:"Close editor", icon:iconsPath + "close-editor1.png", action:function() {
      css3kfa.timeline.animation.close_fn();
    }};
    var toggleUnusedStylesFunc = {label:"Show / hide unused styles", icon:iconsPath + "show-hide-styles.png", action:function() {
      stylepane.toggleUnusedStyles_fn();
    }};
    var toggleMarkersFunc = {label:"Show / hide markers", icon:iconsPath + "show-hide-markers.png", action:function() {
      stylepane.toggleMarkers_fn();
    }};
    var delFunc = {label:"Delete these styles", icon:iconsPath + "trash.png", action:function() {
      css3kfa.timeline.animation.deleteTimeline_fn();
    }};
    var toggleLiveFunc = {label:"Live / Development mode", icon:iconsPath + "live-devel-mode.png", action:function() {
      var devel = css3kfa.timeline.rootLayer.hideCSS;
      $('#css3kfa-live-dev_html input[name="live_devel"][value="0"]').prop("checked", !devel);
      $('#css3kfa-live-dev_html input[name="live_devel"][value="1"]').prop("checked", devel);
      $("#css3kfa-live-dev_html").dialog({resizable:false, height:300, width:500, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        $(this).dialog("close");
        var live = $('#css3kfa-live-dev_html input[name="live_devel"][value="1"]').prop("checked");
        css3kfa.timeline.rootLayer.hideCSS = live;
        css3kfa.timeline.saveData_fn();
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
    }};
    var CSSFunc = {label:"View CSS", icon:iconsPath + "receipt-text.png", action:function() {
      css3kfa.timeline.showCSS_fn();
    }};
    var helpPageFunc = {label:"Help", icon:iconsPath + "help.png", action:function() {
      stylepane.help_fn();
    }};
    var extentsFunc = {label:"Show extents", icon:iconsPath + "extents.png", action:function() {
      css3kfa.timeline.animation.showOutline_fn();
      css3kfa.timeline.animation.fadeOutline_fn(5000);
      css3kfa_obj.saveScroll_fn();
    }};
    var revealFunc = {label:"Dock Panel", icon:iconsPath + "reveal.png", action:function() {
      stylepane.hasDragged = false;
      css3kfa_obj.positionStylePane_fn();
    }};
    var perPageFunc = {label:"This page only / across site", icon:iconsPath + "persite.png", action:function() {
      var firstBlock = css3kfa.timeline.getFirstBlock_fn();
      var singlePage = css3kfa_obj.isOnSinglePage_fn(firstBlock.elementID);
      var singleElement = css3kfa_obj.isOnSingleElement_fn(firstBlock.elementID);
      $('#css3kfa-persite_html input[name="all_pages"][value="0"]').prop("checked", singlePage);
      $('#css3kfa-persite_html input[name="all_pages"][value="1"]').prop("checked", !singlePage);
      $('#css3kfa-persite_html input[name="all_pages"][value="2"]').prop("checked", !singleElement);
      $("#css3kfa-persite_html").dialog({resizable:false, height:400, width:500, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        $(this).dialog("close");
        var allPages = $('#css3kfa-persite_html input[name="all_pages"][value="1"]').prop("checked");
        var allElements = $('#css3kfa-persite_html input[name="all_pages"][value="2"]').prop("checked");
        var hasChangedAllElements = allElements === singleElement;
        if (allElements) {
          firstBlock.setAllElements_fn(allElements);
        } else {
          firstBlock.setAllPages_fn(allPages);
        }
        css3kfa.timeline.saveData_fn();
        css3kfa.timeline.redrawScene_fn();
        if (!allElements && hasChangedAllElements) {
          css3kfa_obj.reloadDialog_fn();
        }
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
      css3kfa_obj.saveScroll_fn();
    }};
    var adminFunc = {label:"Show admin page", icon:iconsPath + "application-table.png", action:function() {
      window.location.href = css3kfa.timeline.animation.adminUrl;
    }};
    var renameFunc = {label:"Rename", icon:iconsPath + "rename.png", action:function() {
      $('#css3kfa-rename_html input[name="title"]').val(css3kfa.timeline.title);
      $("#css3kfa-rename_html").dialog({resizable:false, height:250, width:400, modal:true, dialogClass:"css3kfa-dlg", buttons:{"Apply":function() {
        $(this).dialog("close");
        var v = $('#css3kfa-rename_html input[name="title"]').val();
        css3kfa.timeline.setTitle_fn(v);
        $("#css3kfa-title-input").val(v);
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
      css3kfa_obj.saveScroll_fn();
    }};
    $(".css3kfa-stylepanetitle").css3kfa_menu({element:"css3kfa-stylepane-menubutton", title:"Styles Menu", items:[toggleUnusedStylesFunc, toggleMarkersFunc, revealFunc, closeFunc, null, toggleLiveFunc, CSSFunc, extentsFunc, perPageFunc, renameFunc, adminFunc, null, delFunc, null, helpPageFunc]});
  }, toggleUnusedStyles_fn:function() {
    if (!this.unusedHidden) {
      var defaultStyles = css3kfa.timeline.defaultStyles.styles;
      var index, obj;
      $("div.css3kfa-accordion").each(function() {
        obj = $(this);
        if (!obj.hasClass("css3kfa-accordion-hlt")) {
          obj.next().hide();
          obj.children().removeClass("css3kfa-accordion-head-open");
          index = Number(obj[0].id.split("_")[1]);
          defaultStyles[index].open = !defaultStyles[index].open;
          obj.hide();
        }
      });
    } else {
      $("div.css3kfa-accordion").each(function() {
        $(this).show();
      });
    }
    this.unusedHidden = !this.unusedHidden;
    this.resize_fn();
  }, toggleMarkers_fn:function() {
    $(".css3kfa-marker").toggle();
  }, toggleDevelopment_fn:function() {
  }, clearStyle_fn:function(styleName, currFrame, dflt, dfltClear) {
    this.block.clearStyle_fn(styleName, currFrame, dflt, dfltClear);
    var style = this.block.kfa[0].getOuterStyleFromInnerName_fn(styleName, false);
    if (style !== null) {
      this.block.clearSimilarStyles_fn(0, style);
    }
  }, drawScene_fn:function() {
    css3kfa.timeline.drawScene_fn(css3kfa.timeline.currentFrame);
  }, help_fn:function() {
    window.open("", "_blank");
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);

