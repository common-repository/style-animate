(function(css3kfa, $, undefined) {
  function Style(name, value, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback) {
    this.typeName = "Style";
    if (typeof name === "object") {
      this.deserialize_fn(name);
      return;
    }
    this.callback = callback;
    this.name = name;
    this.value = value;
    this.displayName = displayName;
    this.hasVariants = hasVariants === undefined ? false : hasVariants;
    this.variants = hasVariants === true ? [] : null;
    this.parent = null;
    this.open = false;
    this.inneropen = false;
    this.singleLine = singleLine;
    this.showIcon = showIcon === true ? true : false;
    this.browsers = browsers === undefined ? null : browsers;
    this.canInterp = canInterp === undefined || canInterp === null ? true : canInterp;
    if (this.value != null) {
      var length = value.length;
      for (var i = 0; i < length; i++) {
        if (value[i].browsers === null) {
          value[i].browsers = this.browsers;
        }
        if (value[i].canInterp === null) {
          value[i].canInterp = this.canInterp;
        }
      }
    }
  }
  css3kfa.Style = Style;
  Style.formatValue_fn = function(value, style) {
    switch(style.unitType) {
      case "line-style":
      case "font-style":
      case "text-decoration":
      case "font-family":
        break;
      case "color":
        if (value === "initial") {
          break;
        }
        if (/^rgb/.exec(value) === null) {
          return (new Color(value)).toCSS("rgba");
        }
        break;
      case "image":
        if (value !== "") {
          if (value === style.dfltClear) {
            return value;
          } else {
            return 'url("' + value + '")';
          }
        }
        break;
      case "pixel":
      case "pixelpositive":
        if ($.isNumeric(value)) {
          return value + style.unit;
        } else {
          return value;
        }
        break;
      case "degree":
      case "degrees":
        if ($.isNumeric(value)) {
          return value + "deg";
        }
        break;
    }
    return value;
  };
  Style.prototype = {deserialize_fn:function(obj) {
    this.canInterp = obj.canInterp;
    this.callback = obj.callback;
    this.name = obj.name;
    this.canInterp = obj.canInterp;
    this.hasVariants = obj.hasVariants;
    this.displayName = obj.displayName;
    this.singleLine = obj.singleLine;
    this.showIcon = obj.showIcon;
    this.value = [];
    this.browsers = obj.browsers;
    this.typeName = obj.typeName;
    var i, this_value = this.value, obj_value = obj.value, length = obj_value.length;
    for (i = 0; i < length; i++) {
      this_value.push(new InnerStyle(obj_value[i]));
    }
    if (obj.variants !== null) {
      var variants = obj.variants, _window = window.css3kfa;
      length = variants.length;
      this.variants = [];
      for (i = 0; i < length; i++) {
        this.variants.push((new _window[variants[i].typeName](variants[i])).clone_fn());
      }
    }
  }, toJSON:function(key) {
    var replacement = {};
    for (var val in this) {
      switch(val) {
        case "parent":
        case "inneropen":
        case "open":
          break;
        default:
          replacement[val] = this[val];
      }
    }
    return replacement;
  }, is3D_fn:function() {
    return false;
  }, getIndicesFromName_fn:function(innerStyleName, idName, suffix) {
    var re = new RegExp("(css3kfa-[a-z\\-_]+)([0-9]+)" + suffix), matches = idName.match(re);
    if (matches !== null && matches.length > 2) {
      if (matches[2] >= this.firstPos) {
        var first = innerStyleName.indexOf("stop") !== -1;
        if (first) {
          return {index1:Number(matches[2]), index2:Number(matches[2]) - 1, prefix:matches[1]};
        } else {
          return {index1:Number(matches[2]), index2:Number(matches[2]) + 1, prefix:matches[1]};
        }
      }
    }
    return null;
  }, setClearButtonHandler_fn:function(stylePane, innerStyleName, clearButtonId) {
    $("#" + clearButtonId).on("mouseup", {x:this, y:stylePane, z:innerStyleName}, function(e) {
      var style = e.data.x, stylePane = e.data.y, innerStyleName = e.data.z, rowId = style.singleLine === true ? style.rowId : style.getInnerStyle_fn(innerStyleName).rowId, clearButtonId = style.singleLine === true ? style.clearButtonId : style.getInnerStyle_fn(innerStyleName).clearButtonId;
      if ($("#" + clearButtonId).hasClass("css3kfa-style-clear-button-inactive") === true) {
        return;
      }
      $("#css3kfa-delete_style").dialog({resizable:false, height:200, width:300, modal:true, dialogClass:"css3kfa-dlg", buttons:{"OK":function() {
        var i, value = style.value, length = value.length;
        if (style.singleLine === false) {
          var _innerStyle, block = stylePane.block;
          for (i = 0; i < length; i++) {
            _innerStyle = block.getInnerStyle_fn(value[i].name);
            if (_innerStyle.name === innerStyleName) {
              rowId = _innerStyle.rowId;
              clearButtonId = _innerStyle.clearButtonId;
              $("#" + clearButtonId).removeClass().addClass("css3kfa-style-clear-button-inactive");
              $("#" + rowId + ">td>*").css("color", "#ccc");
            }
          }
        } else {
          $("#" + clearButtonId).removeClass().addClass("css3kfa-style-clear-button-inactive");
          $("#" + rowId + ">td>*").css("color", "#ccc");
        }
        if (style.singleLine === true) {
          for (i = 0; i < length; i++) {
            stylePane.clearStyle_fn(value[i].name, null, true, false);
          }
          stylePane.drawScene_fn();
          for (i = 0; i < length; i++) {
            stylePane.clearStyle_fn(value[i].name, null, true, true);
          }
          stylePane.drawScene_fn();
          for (i = 0; i < length; i++) {
            stylePane.clearStyle_fn(value[i].name, null, false, false);
          }
          stylePane.drawScene_fn();
        } else {
          if (innerStyleName !== undefined) {
            if (style.isGradient_fn()) {
              var indices = style.getIndicesFromName_fn(innerStyleName, clearButtonId, "z_ui");
              if (indices !== null) {
                var name1 = style.value[indices.index1].name;
                var name2 = style.value[indices.index2].name;
                stylePane.clearStyle_fn(name1, null, true, false);
                stylePane.clearStyle_fn(name2, null, true, false);
                stylePane.drawScene_fn();
                stylePane.clearStyle_fn(name1, null, false, false);
                stylePane.clearStyle_fn(name2, null, false, false);
                stylePane.drawScene_fn();
              } else {
                stylePane.clearStyle_fn(innerStyleName, null, true, false);
                stylePane.drawScene_fn();
                stylePane.clearStyle_fn(innerStyleName, null, false, false);
                stylePane.drawScene_fn();
              }
            } else {
              stylePane.clearStyle_fn(innerStyleName, null, true, false);
              stylePane.drawScene_fn();
              if (innerStyleName.match("origin-") !== null) {
                stylePane.clearStyle_fn(innerStyleName, null, true, true);
                stylePane.drawScene_fn();
              }
              stylePane.clearStyle_fn(innerStyleName, null, false, false);
              stylePane.drawScene_fn();
            }
          }
        }
        stylePane.refresh_fn();
        css3kfa.timeline.saveData_fn();
        $(this).dialog("close");
      }, Cancel:function() {
        $(this).dialog("close");
      }}});
    });
  }, setHeadingStyle_fn:function(highlight, clearButtonId) {
    var v = $("#" + clearButtonId).parent().parent().parent().parent().parent().parent();
    v = v.prev();
    if (highlight === true) {
      v.addClass("css3kfa-accordion-hlt");
    } else {
      v.removeClass("css3kfa-accordion-hlt");
    }
  }, setClearButtonState_fn:function(stylepane, innerStyleName) {
    var i, col, bgcol, _s, innerStyle, indices = null, set = false, rowId = this.singleLine === true ? this.rowId : this.getInnerStyle_fn(innerStyleName).rowId, clearButtonId = this.singleLine === true ? this.clearButtonId : this.getInnerStyle_fn(innerStyleName).clearButtonId;
    if (rowId !== undefined && this.isGradient_fn()) {
      indices = this.getIndicesFromName_fn(innerStyleName, clearButtonId, "z_ui");
      if (indices !== null) {
        clearButtonId = indices.prefix + indices.index2.toString() + "z_ui";
      }
      indices = this.getIndicesFromName_fn(innerStyleName, rowId, "_row");
      if (indices !== null) {
        rowId = indices.prefix + indices.index2.toString() + "_row";
      }
    }
    if (this.singleLine === true) {
      for (i = 0; i < this.value.length; i++) {
        innerStyle = this.value[i];
        _s = innerStyle !== null ? innerStyle.valueOrDefault_fn() : null;
        if (_s !== null && _s.value !== null && _s.isDflt === false) {
          set = true;
          break;
        }
      }
    } else {
      if (this.isGradient_fn() && indices !== null) {
        innerStyle = this.value[indices.index1];
        _s = innerStyle !== null ? innerStyle.valueOrDefault_fn() : null;
        if (_s !== null && _s.value !== null && _s.isDflt === false) {
          set = true;
        } else {
          innerStyle = this.value[indices.index2];
          _s = innerStyle !== null ? innerStyle.valueOrDefault_fn() : null;
          if (_s !== null && _s.value !== null && _s.isDflt === false) {
            set = true;
          }
        }
      } else {
        for (i = 0; i < this.value.length; i++) {
          if (innerStyleName === this.value[i].name) {
            innerStyle = this.value[i];
            _s = innerStyle !== null ? innerStyle.valueOrDefault_fn() : null;
            if (_s !== null && _s.value !== null && _s.isDflt === false) {
              set = true;
            }
            break;
          }
        }
      }
    }
    if (set === false) {
      $("#" + clearButtonId).removeClass().addClass("css3kfa-style-clear-button-inactive").off();
      col = "#ccc";
      bgcol = "#fff";
    } else {
      $("#" + clearButtonId).removeClass().addClass("css3kfa-style-clear-button").off();
      col = "#000";
      bgcol = "#ccc";
    }
    this.setClearButtonHandler_fn(stylepane, innerStyleName, clearButtonId);
    if (rowId !== null) {
      $("#" + rowId + " input").css({"border-color":col, "color":col});
      $("#" + rowId + " select").css({"border-color":col, "color":col});
      $("#" + rowId + " a").css({"border-color":col, "color":col});
      $("#" + rowId + " .css3kfa-small-slider.ui-slider.ui-slider-horizontal.ui-widget.ui-widget-content.ui-corner-all").css("border-color", col);
      $("#" + rowId + " .css3kfa-small-slider .ui-slider-handle").css("border-color", col);
    }
    var clearButtonInactive = false;
    for (i = 0; i < this.value.length; i++) {
      innerStyle = this.value[i];
      if (innerStyle.value !== null) {
        clearButtonInactive = true;
        break;
      }
    }
    this.setHeadingStyle_fn(clearButtonInactive, clearButtonId);
  }, isGradient_fn:function() {
    return this.name.includes("gradient");
  }, getParent_fn:function(innerStyleName) {
    var i, p, innerStyles = this.value;
    for (i = 0; i < innerStyles.length; i++) {
      if (innerStyles[i].name === innerStyleName) {
        return this;
      }
    }
    if (this.hasVariants) {
      var variant, variants = this.variants;
      for (i = 0; i < variants.length; i++) {
        variant = variants[i];
        for (p = 0; p < variant.value.length; p++) {
          if (variant.value[p].name === innerStyleName) {
            return variant;
          }
        }
      }
    }
    return null;
  }, update_fn:function(stylePane, innerStyleName) {
    if (innerStyleName !== undefined) {
      this.setClearButtonState_fn(stylePane, innerStyleName);
    }
    if (!this.hasVariants) {
      return false;
    }
    if (innerStyleName !== undefined) {
      var style, p, innerStyle, parentInnerStyle, variant, variantInnerStyle, index = -1;
      style = this.getParent_fn(innerStyleName);
      if (style !== null) {
        for (p = 0; p < style.value.length; p++) {
          innerStyle = style.value[p];
          if (innerStyle.isDflt) {
            innerStyle.value = innerStyle.dflt;
            innerStyle.isDflt = false;
          }
        }
      }
      for (p = 0; p < this.value.length; p++) {
        parentInnerStyle = this.value[p];
        if (parentInnerStyle.name === innerStyleName) {
          index = p;
          break;
        }
      }
      if (index === -1) {
        return true;
      }
      parentInnerStyle = this.value[index];
      for (p = 0; p < this.variants.length; p++) {
        variant = this.variants[p];
        variantInnerStyle = variant.value[index];
        variantInnerStyle.dflt = parentInnerStyle.dflt;
        if (variantInnerStyle.isDflt) {
          variantInnerStyle.unit = parentInnerStyle.unit;
        }
      }
    } else {
      this.resetVariants_fn();
    }
    return true;
  }, resetDisplay_fn:function() {
    var i, innerStyle, value = this.value, length = value.length;
    for (i = 0; i < length; i++) {
      innerStyle = value[i];
      innerStyle.value = innerStyle.dflt;
      innerStyle.unit = css3kfa.timeline.defaultStyles.getDefaultUnit_fn(innerStyle.name);
      switch(innerStyle.name) {
        case "origin-x-3d":
        case "origin-y-3d":
        case "origin-z-3d":
          innerStyle.value = null;
      }
    }
    if (this.hasVariants) {
      var variants = this.variants;
      length = variants.length;
      for (i = 0; i < length; i++) {
        variants[i].resetDisplay_fn();
      }
    }
  }, resetInnerStyleDefault_fn:function(variantInnerStyleName) {
    if (!this.hasVariants) {
      return false;
    }
    var v = this.getInnerStyleIndex_fn(variantInnerStyleName);
    var index = v.index;
    var variant = v.variant;
    if (index !== false) {
      var variantInnerStyle = variant.value[index];
      if (!variantInnerStyle.isDflt) {
        return;
      }
      var parentInnerStyle = this.value[index];
      variantInnerStyle.dflt = parentInnerStyle.dflt;
      variantInnerStyle.unit = parentInnerStyle.unit;
      variantInnerStyle.isDflt = true;
    } else {
      this.resetVariants_fn();
    }
  }, getInnerStyleIndex_fn:function(variantInnerStyleName) {
    var p;
    if (!this.hasVariants) {
      return {index:false};
    }
    var innerStyle, q, variantVal, isVariant = true, value = this.value, variants = this.variants;
    for (p = 0; p < value.length; p++) {
      if (value[p].name === variantInnerStyleName) {
        isVariant = false;
        break;
      }
    }
    if (isVariant) {
      for (p = 0; p < variants.length; p++) {
        variantVal = variants[p].value;
        for (q = 0; q < variantVal.length; q++) {
          innerStyle = variantVal[q];
          if (innerStyle.name === variantInnerStyleName) {
            return {index:q, variant:variants[p]};
          }
        }
      }
    }
    return {index:false};
  }, resetVariants_fn:function() {
    var p, q, parentInnerStyle, variantInnerStyle, variant, value = this.value, variants = this.variants, valueLen = value.length, variantsLen = variants.length;
    for (p = 0; p < valueLen; p++) {
      parentInnerStyle = value[p];
      if (parentInnerStyle.isDflt) {
        for (q = 0; q < variantsLen; q++) {
          variant = variants[q];
          variantInnerStyle = variant.value[p];
          if (!variantInnerStyle.isDflt) {
            continue;
          }
          variantInnerStyle.dflt = parentInnerStyle.dflt;
          if (parentInnerStyle.isDflt) {
            variantInnerStyle.unit = parentInnerStyle.unit;
          } else {
            variantInnerStyle.dflt = parentInnerStyle.value;
          }
          if (variantInnerStyle.isDflt === true) {
            variantInnerStyle.unit = parentInnerStyle.unit;
          }
        }
      }
    }
  }, isSame_fn:function(other) {
    if (this.name !== other.name) {
      return false;
    }
    var p, innerStyle1, innerStyle2, length = this.value.length;
    for (p = 0; p < length; p++) {
      innerStyle1 = this.value[p];
      innerStyle2 = other.value[p];
      if (innerStyle1.name !== innerStyle2.name || innerStyle1.value !== innerStyle2.value || innerStyle1.unit !== innerStyle2.unit) {
        return false;
      }
    }
    if (this.variants !== null && this.variants !== undefined) {
      if (this.variants.length !== other.variants.length) {
        return false;
      }
      length = this.variants.length;
      for (p = 0; p < length; p++) {
        if (!this.variants[p].isSame_fn(other.variants[p])) {
          return false;
        }
      }
    }
    return true;
  }, create_fn:function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback) {
    return new Style(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback);
  }, clone_fn:function(doInnerStyles) {
    var x, newInnerStyle, innerStyles = [], value = this.value;
    if (doInnerStyles !== false) {
      for (x = 0; x < value.length; x++) {
        newInnerStyle = value[x].clone_fn();
        newInnerStyle.parent = this;
        innerStyles.push(newInnerStyle);
      }
    }
    return this.duplicate_fn(this.name, innerStyles, this.variants, this.parent, doInnerStyles);
  }, duplicate_fn:function(name, innerStyles, variants, parent, doInnerStyles) {
    var style = this.create_fn(name, innerStyles, variants !== null && variants !== undefined, this.displayName, this.singleLine, this.showIcon, this.browsers, this.canInterp, this.callback);
    if (variants !== null && variants !== undefined) {
      var newVariant;
      for (var i = 0; i < variants.length; i++) {
        newVariant = variants[i].clone_fn(doInnerStyles);
        newVariant.parent = style;
        style.variants.push(newVariant);
      }
    }
    style.rowId = this.rowId;
    style.clearButtonId = this.clearButtonId;
    style.hasIcon = this.hasIcon;
    style.setInnerParent_fn();
    return style;
  }, setInnerParent_fn:function() {
    var i, innerStyle = this.value;
    for (i = 0; i < innerStyle.length; i++) {
      innerStyle[i].parent = this;
    }
    if (this.hasVariants) {
      var style;
      for (var p = 0; p < this.variants.length; p++) {
        style = this.variants[p];
        innerStyle = style.value;
        for (i = 0; i < innerStyle.length; i++) {
          innerStyle[i].parent = style;
        }
      }
    }
  }, sortInnerStyles_fn:function() {
    return null;
  }, setInnerStyleDefaults_fn:function() {
    if (css3kfa.DefaultStyles_element !== undefined) {
      var i, p, q, parentInnerStyle, innerStyle, name, unitType, val, dflt, arr, unit;
      for (i = 0; i < this.value.length; i++) {
        innerStyle = this.value[i];
        if (innerStyle.dflt !== undefined && innerStyle.dflt !== null) {
          continue;
        }
        name = innerStyle.name;
        unitType = innerStyle.unitType;
        val = css3kfa.DefaultStyles_element.css(name);
        if (val === undefined) {
          if (typeof this.css === "function") {
            val = this.css(name);
          }
        }
        if (val === "transparent") {
          val = "rgba(255, 255, 255, 0)";
        }
        dflt = null;
        if (val !== undefined && val !== null && val !== "") {
          var isUrl = val.indexOf("url") !== -1;
          val = val.replace(/url\((.*)\)/i, "$1");
          val = val.replace(/["\']/g, "");
          if (isUrl) {
            dflt = val;
          } else {
            dflt = val;
            if (val.indexOf(" ") === -1 && val.indexOf("rgb") === -1) {
              arr = val.match(/([^a-z%]+)([a-z%]*)/);
              if (arr !== null) {
                if (arr.length > 1) {
                  dflt = arr[1];
                }
                if (arr.length > 2) {
                  unit = arr[2];
                }
              } else {
                if (val !== "") {
                  dflt = val;
                }
              }
            }
          }
        }
        if (dflt === null && this.hasVariants === true) {
          var variant, varInner, varInnerName, innerStyleIndex, same = true, first = true, _dflt = null, _dfltUnit = null;
          for (p = 0; p < this.variants.length; p++) {
            variant = this.variants[p];
            for (q = 0; q < variant.value.length; q++) {
              varInner = variant.value[q];
              innerStyleIndex = this.getInnerStyleIndex_fn(varInner.name);
              varInnerName = this.value[innerStyleIndex.index].name;
              if (varInnerName === name) {
                if (first) {
                  first = false;
                  _dflt = varInner.dflt;
                  _dfltUnit = varInner.unit;
                } else {
                  if (varInner.dflt !== _dflt || varInner.unit !== _dfltUnit) {
                    same = false;
                    p = this.variants.length;
                    break;
                  }
                }
                break;
              }
            }
          }
          if (same) {
            dflt = _dflt;
          }
        }
        if (dflt === null && this.parent !== null && this.hasVariants === false) {
          var index = -1;
          for (p = 0; p < this.value.length; p++) {
            if (this.value[p].name === name) {
              index = p;
              break;
            }
          }
          if (index !== -1) {
            parentInnerStyle = this.parent.value[index];
            dflt = parentInnerStyle.valueOrDefault_fn().value;
          }
        }
        if (dflt === null || dflt === undefined) {
          switch(unitType) {
            case "fontstyle":
            case "fontvariant":
              dflt = "normal";
              break;
            case "fontweight":
              dflt = 400;
              break;
            case "textdecorationline":
              dflt = "solid";
              break;
            case "line-style":
            case "texttransform":
            case "textdecorationstyle":
              dflt = "none";
              break;
            case "color":
            case "textdecorationcolor":
            case "gradient":
              dflt = "rgba(0,0,0,0)";
              break;
            case "textalign":
              dflt = "left";
              break;
            case "textoverflow":
              dflt = "clip";
              break;
            case "pixel":
            case "pixelpositive":
            case "percentzero":
            case "degree":
            case "degrees":
              dflt = 0;
              break;
            case "decimal":
            case "decimalmax":
              dflt = 1;
              break;
            case "percent":
            case "percentmax":
              dflt = 100;
              break;
            case "backface-visibility":
              dflt = "visible";
              break;
            case "position":
              dflt = "center";
              break;
            case "transform-style":
              dflt = "preserve-3d";
              break;
            case "video":
            case "image":
              dflt = "";
              break;
            case "overflow":
              dflt = "hidden";
              break;
            default:
              dflt = "";
              break;
          }
          switch(name) {
            case "background-width":
            case "background-height":
              dflt = "100";
              break;
          }
        }
        innerStyle.dflt = dflt;
      }
    }
  }, addVariant_fn:function(variant) {
    this.variants.push(variant);
  }, interpolateInnerStyles_fn:function(style1, style2, styleOut, weight, all) {
    for (var i = 0; i < style1.value.length; i++) {
      var interp = InnerStyle.interpolate_fn(style1.value[i], style2.value[i], weight);
      if (interp !== null) {
        styleOut.value.push(interp);
      } else {
        if (all === true) {
          styleOut.value.push(style1.value[i]);
        }
      }
    }
  }, interpolate_fn:function(style2, weight, all) {
    var ret = this.clone_fn(false);
    this.interpolateInnerStyles_fn(this, style2, ret, weight, all);
    if (this.hasVariants) {
      var variants1 = this.variants, variants2 = style2.variants;
      for (var i = 0; i < variants1.length; i++) {
        this.interpolateInnerStyles_fn(variants1[i], variants2[i], ret.variants[i], weight, all);
      }
    }
    ret.setInnerParent_fn();
    return ret;
  }, getInnerStyle_fn:function(name) {
    var innerStyle = this.value;
    for (var x = 0; x < innerStyle.length; x++) {
      if (innerStyle[x].name === name) {
        return innerStyle[x];
      }
    }
    if (this.hasVariants) {
      var v, variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        v = variants[i].getInnerStyle_fn(name);
        if (v !== null) {
          return v;
        }
      }
    }
    return null;
  }, getValue_fn:function(name) {
    var innerStyle = this.value;
    for (var x = 0; x < innerStyle.length; x++) {
      if (innerStyle[x].name === name) {
        return innerStyle[x].value;
      }
    }
    if (this.hasVariants) {
      var variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        var v = variants[i].getValue_fn(name);
        if (v !== null) {
          return v.value;
        }
      }
    }
    return null;
  }, hasInnerStyle_fn:function(styleName) {
    var innerStyle = this.value;
    for (var i = 0; i < innerStyle.length; i++) {
      if (innerStyle[i].name === styleName) {
        return true;
      }
    }
    return false;
  }, isPresent_fn:function(name) {
    var innerStyle = this.value;
    for (var x = 0; x < innerStyle.length; x++) {
      if (innerStyle[x] !== null && innerStyle[x].name === name) {
        return true;
      }
    }
    if (this.hasVariants) {
      var variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        if (variants[i].isPresent_fn(name) === true) {
          return true;
        }
      }
    }
    return false;
  }, setValue_fn:function(name, value, dflt) {
    var innerStyle = this.value;
    if (dflt === undefined) {
      dflt = false;
    }
    for (var p = 0; p < innerStyle.length; p++) {
      if (innerStyle[p].name === name) {
        innerStyle[p].value = value;
        innerStyle[p].isDflt = dflt;
        return true;
      }
    }
    if (this.hasVariants) {
      var variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        if (variants[i].setValue_fn(name, value, dflt) === true) {
          return true;
        }
      }
    }
    return false;
  }, getUnit_fn:function(name) {
    var innerStyle = this.value;
    for (var x = 0; x < innerStyle.length; x++) {
      if (innerStyle[x].name === name) {
        return innerStyle[x].unit;
      }
    }
    if (this.hasVariants) {
      var variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        var unit = variants[i].getUnit_fn(name);
        if (unit !== null) {
          return unit;
        }
      }
    }
    return null;
  }, setUnit_fn:function(name, value) {
    var innerStyle = this.value;
    for (var x = 0; x < innerStyle.length; x++) {
      if (innerStyle[x].name === name) {
        innerStyle[x].unit = value;
        return true;
      }
    }
    if (this.hasVariants) {
      var variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        if (variants[i].setUnit_fn(name, value) === true) {
          return true;
        }
      }
    }
    return false;
  }, empty:function() {
    var innerStyles = this.value;
    if (innerStyles.length === 0) {
      return true;
    }
    for (var x = 0; x < innerStyles.length; x++) {
      if (innerStyles[x].value !== null && innerStyles[x].isDflt === false) {
        return false;
      }
    }
    if (this.hasVariants) {
      var variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        if (variants[i].empty() === false) {
          return false;
        }
      }
    }
    return true;
  }, getCSS_fn:function(arr) {
    this.getNameValuePairs_fn(arr);
  }, getFrameData_fn:function(arr) {
    var i, variants, innerStyle1, innerStyle = this.value, length = innerStyle.length, hasVariants = this.hasVariants;
    for (i = 0; i < length; i++) {
      innerStyle1 = innerStyle[i];
      if (innerStyle1.value !== null) {
        if (arr === undefined) {
          return;
        }
        arr.push({name:innerStyle1.name, value:innerStyle1.value});
      }
    }
    if (hasVariants) {
      variants = this.variants;
      for (i = 0; i < variants.length; i++) {
        variants[i].getFrameData_fn(arr);
      }
    }
  }, getNameValuePairs_fn:function(arr) {
    var i, _pr, variants, innerStyle1, innerStyle = this.value, length = innerStyle.length, pr = this.getPrefixArray_fn(), hasVariants = this.hasVariants;
    if (this.singleLine === true) {
      var canSet = false;
      for (i = 0; i < length; i++) {
        innerStyle1 = innerStyle[i];
        if (innerStyle1.value !== null) {
          canSet = true;
          break;
        }
      }
      if (canSet) {
        var val = "";
        for (i = 0; i < length; i++) {
          innerStyle1 = innerStyle[i];
          val += innerStyle1.htmlVal_fn();
          if (i < length - 1) {
            val += " ";
          }
        }
        _pr = pr;
        if (innerStyle1.browsers != null) {
          _pr = this.getPrefixArray_fn(innerStyle1.browsers);
        }
        var name = innerStyle1.parent !== null ? innerStyle1.parent.name : innerStyle1.name;
        this.applyPrefixArray_fn(name, _pr, arr, val);
      }
    } else {
      for (i = 0; i < length; i++) {
        innerStyle1 = innerStyle[i];
        if (innerStyle1.value !== null) {
          _pr = pr;
          if (innerStyle1.browsers != null) {
            _pr = this.getPrefixArray_fn(innerStyle1.browsers);
          }
          this.applyPrefixArray_fn(innerStyle1.name, _pr, arr, innerStyle1.htmlVal_fn());
        }
      }
    }
    if (hasVariants) {
      variants = this.variants;
      for (i = 0; i < variants.length; i++) {
        variants[i].getNameValuePairs_fn(arr);
      }
    }
  }, getPrefixArray_fn:function(browsers) {
    if (browsers === null || browsers === undefined) {
      browsers = this.browsers;
    }
    if (browsers === null || browsers === undefined || browsers === false) {
      return null;
    }
    if (browsers.search("none") != -1) {
      return null;
    }
    if (browsers.search("all") != -1) {
      return ["-webkit", "-moz", "-ms", "-o"];
    } else {
      return browsers.split(" ");
    }
  }, applyPrefixArray_fn:function(name, prefixArray, outputArray, value) {
    if (prefixArray != null) {
      var n, length = prefixArray.length;
      for (var i = 0; i < length; i++) {
        n = prefixArray[i] + "-" + name;
        outputArray.push({name:n, value:value});
      }
    }
    outputArray.push({name:name, value:value});
  }, getSortedStyles_fn:function() {
    return false;
  }, redisplay_fn:function(styleName) {
    return false;
  }, applyBlockStyles_fn:function(block) {
    var variants, innerBlockStyle, innerStyles = this.value, length = innerStyles.length, keyframe = block.keyframe, hasVariants = this.hasVariants;
    for (var y = 0; y < length; y++) {
      if (innerStyles[y] !== null && innerStyles[y].value === null) {
        innerBlockStyle = keyframe.getInnerStyle_fn(innerStyles[y].name);
        if (innerBlockStyle != null && innerBlockStyle.value != null) {
          innerStyles[y] = innerBlockStyle;
        }
      }
    }
    if (hasVariants) {
      variants = this.variants;
      for (var i = 0; i < variants.length; i++) {
        variants[i].applyBlockStyles_fn(block);
      }
    }
    return this;
  }, sort:function() {
  }};
  StyleGradient.prototype = new Style;
  StyleGradient.prototype.constructor = StyleGradient;
  StyleGradient.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback) {
    return new StyleCombined(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback);
  };
  function StyleGradient(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
    this.typeName = "StyleGradient";
    this.firstPos = 0;
  }
  css3kfa.StyleGradient = StyleGradient;
  StyleGradient.prototype.applyPrefixArray_fn = function(name, prefixArray, outputArray, value) {
    if (prefixArray != null) {
      for (var i = 0; i < prefixArray.length; i++) {
        var n = prefixArray[i] + "-" + value;
        outputArray.push({name:name, value:n});
      }
    }
    try {
      var v = value.match(/(([0-9]+\.)?[0-9]+)deg/);
      value = value.replace(v[0], 450 - Number(v[1]) + "deg");
    } catch (e) {
    }
    outputArray.push({name:name, value:value});
  };
  StyleGradient.prototype.update_fn = function(stylePane, innerStyleName) {
    Style.prototype.update_fn.call(this, stylePane, innerStyleName);
    this.sortInnerStyles_fn();
  };
  StyleGradient.prototype.getNameValuePairs_fn = function(arr) {
    var i, pr = this.getPrefixArray_fn(), d = "", numPairs = 0;
    for (i = this.firstPos; i < this.value.length; i += 2) {
      if (this.value[i].isDflt !== true || this.value[i + 1].isDflt !== true) {
        numPairs++;
      }
    }
    if (this.name.indexOf("repeating" !== -1) && numPairs < 2) {
      d = "none";
      this.applyPrefixArray_fn("background-image", pr, arr, d);
    } else {
      for (i = 0; i < this.firstPos; i++) {
        if (this.value[i].value != null) {
          d += this.value[i].htmlVal_fn();
          if (this.value[i].unitType === "pixel" && this.value[i + 1].unitType === "pixel" && this.value[i + 1].value != null) {
            d += " ";
          } else {
            if (this.value[i].unitType === "type" && this.value[i + 1].unitType === "placement" && this.value[i + 1].value != null) {
              d += " ";
            } else {
              d += ", ";
            }
          }
        }
      }
      var a = [];
      for (i = this.firstPos; i < this.value.length; i += 2) {
        var v = "";
        if ((i > this.firstPos || i < this.value.length - 1) && this.value.length < i + 2) {
          continue;
        }
        if (this.value[i].value !== null || this.value[i + 1].value !== null) {
          v += this.value[i].htmlVal_fn();
          if (this.value[i + 1].value != null) {
            v += " " + this.value[i + 1].htmlVal_fn();
          }
        }
        if (v != "") {
          a.push(v);
        }
      }
      for (i = 0; i < a.length; i++) {
        d += a[i];
        if (a.length > i + 1) {
          d += ", ";
        }
      }
      d = d.replace(/\s+/g, " ").replace(/\s+jQuery/, "").replace(/,jQuery/, "");
      if (d != "") {
        d = this.name + "(" + d;
        d += ")";
        this.applyPrefixArray_fn("background-image", pr, arr, d);
      }
    }
    return arr;
  };
  StyleGradient.prototype.sortInnerStyles_fn = function() {
    var empty1, empty2, prefix, i, match, arr = [];
    for (i = 0; i < this.firstPos; i++) {
      arr.push(this.value[i]);
    }
    for (i = this.firstPos; i < this.value.length; i += 2) {
      empty1 = this.value[i].value === null || this.value[i].isDflt === true;
      empty2 = this.value[i + 1].value === null || this.value[i + 1].isDflt === true;
      if (!empty1 || !empty2) {
        arr.push(this.value[i]);
        arr.push(this.value[i + 1]);
      }
    }
    for (i = this.firstPos; i < this.value.length; i += 2) {
      empty1 = this.value[i].value === null || this.value[i].isDflt === true;
      empty2 = this.value[i + 1].value === null || this.value[i + 1].isDflt === true;
      if (empty1 && empty2) {
        arr.push(this.value[i]);
        arr.push(this.value[i + 1]);
      }
    }
    this.value = arr;
    var $rowId, count = 0;
    if (this.value[0].rowId !== undefined) {
      match = this.value[0].rowId.match(/(.+)[0-9]_row/);
      prefix = match[1];
      for (i = 0; i < this.value.length; i++) {
        this.value[i].rowId = prefix + i.toString() + "_row";
      }
    }
    if (this.value[0].clearButtonId !== undefined) {
      match = this.value[0].clearButtonId.match(/(.+)[0-9]z_ui/);
      prefix = match[1];
      for (i = 0; i < this.value.length; i++) {
        this.value[i].clearButtonId = prefix + i.toString() + "z_ui";
      }
    }
    var oneSet = false;
    for (i = this.firstPos; i < this.value.length; i += 2) {
      if (this.value[i].value === null && this.value[i + 1].value === null) {
        $rowId = $("#" + this.value[i].rowId);
        count++;
        if (oneSet === false && count > 2 || oneSet === true && count > 1) {
          $rowId.css("display", "none");
        } else {
          $rowId.css("display", "table-row");
        }
      } else {
        oneSet = true;
      }
    }
  };
  StyleGradient.prototype.redisplay_fn = function(styleName) {
    return styleName.search(/color|stop/) !== -1;
  };
  StyleLinearGradient.prototype = new StyleGradient;
  StyleLinearGradient.prototype.constructor = StyleLinearGradient;
  StyleLinearGradient.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new StyleLinearGradient(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  function StyleLinearGradient(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    StyleGradient.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
    this.typeName = "StyleLinearGradient";
    this.firstPos = 1;
  }
  css3kfa.StyleLinearGradient = StyleLinearGradient;
  StyleRadialGradient.prototype = new StyleGradient;
  StyleRadialGradient.prototype.constructor = StyleRadialGradient;
  StyleRadialGradient.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new StyleRadialGradient(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  function StyleRadialGradient(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    StyleGradient.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
    this.typeName = "StyleRadialGradient";
    this.firstPos = 4;
  }
  css3kfa.StyleRadialGradient = StyleRadialGradient;
  StyleCombined.prototype = new Style;
  StyleCombined.prototype.constructor = StyleCombined;
  StyleCombined.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback) {
    return new StyleCombined(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback);
  };
  function StyleCombined(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback);
    this.typeName = "StyleCombined";
  }
  css3kfa.StyleCombined = StyleCombined;
  StyleCombined.prototype.update_fn = function(stylepane, innerStyleName) {
    return Style.prototype.update_fn.call(this, stylepane, innerStyleName);
  };
  StyleFilter.prototype = new Style;
  StyleFilter.prototype.constructor = StyleFilter;
  StyleFilter.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback) {
    return new StyleFilter(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback);
  };
  function StyleFilter(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp, callback);
    this.typeName = "StyleCombined";
  }
  css3kfa.StyleFilter = StyleFilter;
  StyleFilter.prototype.update_fn = function(stylepane, innerStyleName) {
    return Style.prototype.update_fn.call(this, stylepane, innerStyleName);
  };
  StyleFilter.prototype.css = function(name) {
    var v;
    v = css3kfa.DefaultStyles_element.css("filter:" + name);
    if (v !== undefined) {
      return v;
    }
    v = css3kfa.DefaultStyles_element.css("-webkit-filter:" + name);
    if (v !== undefined) {
      return v;
    }
    return null;
  };
  StyleFilter.prototype.getNameValuePairs_fn = function(arr) {
    var i, pr = this.getPrefixArray_fn(), out = "";
    for (i = 0; i < this.value.length; i++) {
      var innerStyle = this.value[i];
      if (innerStyle.isDflt) {
        continue;
      }
      if (i > 0) {
        out += " ";
      }
      if (innerStyle.unitType === "decimal") {
        out += innerStyle.name + "(" + innerStyle.value + ")";
      } else {
        out += innerStyle.name + "(" + innerStyle.value + innerStyle.unit + ")";
      }
    }
    arr.push({name:"filter", value:out});
    if (pr !== null) {
      for (i = 0; i < pr.length; i++) {
        arr.push({name:pr[i] + "-filter", value:out});
      }
    }
  };
  Style3D.prototype = new StyleCombined;
  Style3D.prototype.constructor = Style3D;
  Style3D.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new Style3D(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  Style3D.prototype.update_fn = function(stylePane, innerStyleName) {
    return Style.prototype.update_fn.call(this, stylePane, innerStyleName);
  };
  function Style3D(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
    this.typeName = "Style3D";
  }
  css3kfa.Style3D = Style3D;
  Style3D.prototype.is3D_fn = function() {
    return true;
  };
  Style3D.prototype.getNameValuePairs_fn = function(arr) {
    var pr = this.getPrefixArray_fn();
    var d = (Style3D.htmlCombined(this, "translate") + " " + Style3D.htmlCombined(this, "rotate") + " " + Style3D.htmlCombined(this, "scale") + " " + Style3D.htmlCombined(this, "skew") + " ").replace(/\s+/g, " ").replace(/\s+jQuery/, "");
    if (d !== "") {
      this.applyPrefixArray_fn("transform", pr, arr, d);
    }
    var styles = Style3D.getTriValues(this, "origin");
    if (styles[0] != null || styles[1] != null || styles[2] != null) {
      d = "";
      if (styles[0] !== null && styles[0].value === null) {
        d += styles[0].dfltClear + " ";
      }
      if (styles[0] !== null && styles[0].value !== null) {
        d += styles[0].htmlVal_fn() + " ";
      }
      if (styles[1] !== null && styles[1].value === null) {
        d += styles[1].dfltClear + " ";
      }
      if (styles[1] !== null && styles[1].value !== null) {
        d += styles[1].htmlVal_fn() + " ";
      }
      if (styles[2] !== null && styles[2].value === null) {
        d += styles[2].dfltClear;
      }
      if (styles[2] !== null && styles[2].value !== null) {
        d += styles[2].htmlVal_fn();
      }
      d = d.replace(/\s+/g, " ");
      d = d.replace(/\s+jQuery/, "");
      if (d != "") {
        this.applyPrefixArray_fn("transform-origin", pr, arr, d);
      }
    }
    var innerStyle;
    for (var i = 0; i < this.value.length; i++) {
      innerStyle = this.value[i];
      var _pr = pr;
      switch(innerStyle.name) {
        case "transform-style":
        case "backface-visibility":
          if (innerStyle.value != null) {
            if (innerStyle.browsers !== null) {
              _pr = this.getPrefixArray_fn(innerStyle.browsers);
            }
            this.applyPrefixArray_fn(innerStyle.name, _pr, arr, innerStyle.htmlVal_fn());
          }
      }
    }
  };
  Style3D.getTriValues = function(obj, name) {
    var x, y, z, i, j, k, styles = [null, null, null], value = obj.value;
    for (i = 0; i < value.length; i++) {
      x = value[i];
      if (x.displayName === name) {
        styles[0] = x;
        break;
      }
    }
    for (i = 0; i < value.length; i++) {
      x = value[i];
      if (x.displayName === name + " X") {
        styles[0] = x;
        for (j = 0; j < value.length; j++) {
          y = obj.value[j];
          if (y.displayName === name + " Y") {
            styles[1] = y;
            for (k = 0; k < value.length; k++) {
              z = value[k];
              if (z.displayName === name + " Z") {
                styles[2] = z;
                break;
              }
            }
            break;
          }
        }
        break;
      }
    }
    return styles;
  };
  Style3D.htmlCombined = function(obj, outputName) {
    var inputNames = [outputName + " X", outputName + " Y", outputName + " Z", outputName];
    var x, i, d = "", value = obj.value;
    for (i = 0; i < value.length; i++) {
      x = value[i];
      if (x.value !== null) {
        switch(x.displayName) {
          case inputNames[0]:
            d += outputName + "X(" + Style.formatValue_fn(x.value, x) + ") ";
            break;
          case inputNames[1]:
            d += outputName + "Y(" + Style.formatValue_fn(x.value, x) + ") ";
            break;
          case inputNames[2]:
            d += outputName + "Z(" + Style.formatValue_fn(x.value, x) + ") ";
            break;
          case inputNames[3]:
            d += outputName + "(" + Style.formatValue_fn(x.value, x) + ") ";
            break;
        }
      }
    }
    return d;
  };
  Style2D.prototype = new Style3D;
  Style2D.prototype.constructor = Style2D;
  Style2D.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new Style2D(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  Style2D.prototype.is3D_fn = function() {
    return false;
  };
  Style2D.hasShown = false;
  Style2D.prototype.update_fn = function(stylePane, innerStyleName) {
    var kf = stylePane.block.keyframe;
    if (kf.getOuterStyleFromOuterName_fn("transform3d")) {
      if (!Style2D.hasShown) {
        css3kfa.dialog("Warning", "3D Transform style already set, 2D style will not be used.");
      }
      Style2D.hasShown = true;
    }
    return Style.prototype.update_fn.call(this, stylePane, innerStyleName);
  };
  function Style2D(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
    this.typeName = "Style2D";
  }
  css3kfa.Style2D = Style2D;
  StyleBackground.prototype = new StyleCombined;
  StyleBackground.prototype.constructor = StyleBackground;
  StyleBackground.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new StyleBackground(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  StyleBackground.prototype.update_fn = Style.prototype.update_fn;
  StyleBackground.prototype.interpolate_fn = Style.prototype.interpolate_fn;
  StyleBackground.prototype.setClearButtonState_fn = Style.prototype.setClearButtonState_fn;
  function StyleBackground(name, val, hasVariants, displayName, singleLine, browsers, showIcon, canInterp) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
    this.typeName = "StyleBackground";
  }
  css3kfa.StyleBackground = StyleBackground;
  StyleBackground.prototype.css = function(name) {
    var val, v, re = /(\d+)([\w%]*) *(\d*)([\w%]*)/, value = null;
    switch(name) {
      case "background-left":
        val = css3kfa.DefaultStyles_element.css("background-position");
        v = re.exec(val);
        if (v !== null && v.length > 1) {
          value = v[1] + v[2];
        }
        break;
      case "background-top":
        val = css3kfa.DefaultStyles_element.css("background-position");
        v = re.exec(val);
        if (v !== null && v.length > 3) {
          value = v[3] + v[4];
        }
        break;
      case "background-width":
        val = css3kfa.DefaultStyles_element.css("background-size");
        v = re.exec(val);
        if (v !== null && v.length > 1) {
          value = v[1] + v[2];
        }
        break;
      case "background-height":
        val = css3kfa.DefaultStyles_element.css("background-size");
        v = re.exec(val);
        if (v !== null && v.length > 3) {
          value = v[3] + v[4];
        }
        break;
    }
    return value;
  };
  StyleBackground.prototype.showHideSize = function() {
    var _this = Style.prototype, innerStyleVal = _this.getInnerStyle_fn.call(this, "background-size").valueOrDefault_fn(), w = "#" + _this.getInnerStyle_fn.call(this, "background-width").rowId, h = "#" + _this.getInnerStyle_fn.call(this, "background-height").rowId, $innerStyle1 = $(w), $innerStyle2 = $(h), $innerStyle1_input = $(w + " input"), $innerStyle1_select = $(w + " select"), $innerStyle2_input = $(h + " input"), $innerStyle2_select = $(h + " select");
    if (innerStyleVal.value === "contain" || innerStyleVal.value === "cover") {
      if ($innerStyle1.attr("rowHidden") !== true) {
        $innerStyle1.css("opacity", "0.5").attr("rowHidden", true);
        $innerStyle1_input.prop("disabled", true);
        $innerStyle1_select.prop("disabled", true);
      }
      if ($innerStyle2.attr("rowHidden") !== true) {
        $innerStyle2.css("opacity", "0.5").attr("rowHidden", true);
        $innerStyle2_input.prop("disabled", true);
        $innerStyle2_select.prop("disabled", true);
      }
    } else {
      if ($innerStyle1.attr("rowHidden") !== false) {
        $innerStyle1.css("opacity", "1").attr("rowHidden", true);
        $innerStyle1_input.prop("disabled", false);
        $innerStyle1_select.prop("disabled", false);
      }
      if ($innerStyle2.attr("rowHidden") !== false) {
        $innerStyle2.css("opacity", "1").attr("rowHidden", true);
        $innerStyle2_input.prop("disabled", false);
        $innerStyle2_select.prop("disabled", false);
      }
    }
  };
  StyleBackground.prototype.interpolate_fn = function(style2, weight) {
    return Style.prototype.interpolate_fn.call(this, style2, weight, true);
  };
  StyleBackground.prototype.update_fn = function(stylePane, innerStyleName) {
    Style.prototype.update_fn.call(this, stylePane, innerStyleName);
    if (innerStyleName === "background-size") {
      this.showHideSize();
    }
  };
  StyleBackground.prototype.setClearButtonState_fn = function(stylePane, innerStyleName) {
    var _this = Style.prototype;
    if (innerStyleName === "background-size") {
      this.showHideSize();
    }
    var clearButtonId = _this.getInnerStyle_fn.call(this, innerStyleName).clearButtonId;
    $("#" + clearButtonId).click({x:this, y:stylePane, z:innerStyleName}, function(e) {
      e.data.x.showHideSize();
    });
    _this.setClearButtonState_fn.call(this, stylePane, innerStyleName);
  };
  StyleBackground.prototype.getNameValuePairs_fn = function(arr) {
    var tmp = [];
    function pairValues(name1, name2, innerStyle, obj) {
      var i, j, x, y, value = obj.value, length = value.length;
      for (i = 0; i < length; i++) {
        x = value[i];
        if (x.value !== null && x.name === name1) {
          for (j = 0; j < length; j++) {
            y = value[j];
            if (y.value !== null && y.name === name2) {
              return x.htmlVal_fn() + " " + y.htmlVal_fn();
            }
          }
        }
      }
      for (i = 0; i < length; i++) {
        x = value[i];
        if (x.value !== null && x.name === name1) {
          for (j = 0; j < length; j++) {
            y = value[j];
            if (y.name === name2 && $.isNumeric(y.dflt)) {
              return x.htmlVal_fn() + " " + y.dflt + y.unit;
            }
          }
        }
      }
      for (i = 0; i < length; i++) {
        x = value[i];
        if (x.value !== null && x.name === name2) {
          for (j = 0; j < length; j++) {
            y = value[j];
            if (y.name === name1 && $.isNumeric(y.dflt)) {
              return y.dflt + y.unit + " " + x.htmlVal_fn();
            }
          }
        }
      }
      for (i = 0; i < length; i++) {
        x = value[i];
        if (x.name === name1 && $.isNumeric(x.dflt)) {
          for (j = 0; j < length; j++) {
            y = value[j];
            if (y.name === name2 && $.isNumeric(y.dflt)) {
              return x.dflt + x.unit + " " + y.dflt + y.unit;
            }
          }
        }
      }
      return "";
    }
    function pushVal(name, style) {
      var innerStyle = style.getInnerStyle_fn(name);
      if (innerStyle !== null && innerStyle.value !== null && innerStyle.value !== "") {
        tmp.push(innerStyle);
        return innerStyle.value;
      }
      return false;
    }
    pushVal("background-color", this);
    var i, seq = true, defaultStyle = css3kfa.timeline.defaultStyles.getInnerStyle_fn("background-left"), innerStyle = new InnerStyle("background-position", "bgposition", defaultStyle.dfltClear, defaultStyle.unit);
    innerStyle.isDflt = false;
    var s = pairValues("background-left", "background-top", innerStyle, this);
    if (s !== "") {
      innerStyle.value = s;
      tmp.push(innerStyle);
    }
    var size = this.getInnerStyle_fn("background-size");
    if (size !== null && (size.value === "contain" || size.value === "cover")) {
      tmp.push(size);
    } else {
      defaultStyle = css3kfa.timeline.defaultStyles.getInnerStyle_fn("background-width");
      innerStyle = new InnerStyle("background-size", "bgsize", defaultStyle.dfltClear, defaultStyle.unit);
      innerStyle.isDflt = false;
      innerStyle.canInterp = true;
      s = pairValues("background-width", "background-height", innerStyle, this);
      if (s !== "") {
        innerStyle.value = s;
        tmp.push(innerStyle);
      }
    }
    var repeat = pushVal("background-repeat", this);
    var clSet = pushVal("background-clip", this);
    var attach = pushVal("background-attachment", this);
    var image = pushVal("background-image", this);
    seq = false;
    var pr = this.getPrefixArray_fn();
    if (seq === true) {
      var d = "";
      for (i = 0; i < tmp.length; i++) {
        d += tmp[i].name === "background-size" ? "/" + tmp[i].htmlVal_fn() : tmp[i].htmlVal_fn();
        if (tmp.length > i + 1) {
          d += " ";
        }
      }
      this.applyPrefixArray_fn(this.name, pr, arr, d);
    } else {
      for (i = 0; i < tmp.length; i++) {
        this.applyPrefixArray_fn(tmp[i].name, pr, arr, tmp[i].htmlVal_fn());
      }
    }
  };
  StyleBoxShadow.prototype = new StyleCombined;
  StyleBoxShadow.prototype.constructor = StyleBoxShadow;
  function StyleBoxShadow(name, val, hasVariants, displayName, singleLine, showIcon, browsers, interp, canInterp) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, interp, canInterp);
    this.typeName = "StyleBoxShadow";
  }
  css3kfa.StyleBoxShadow = StyleBoxShadow;
  StyleBoxShadow.prototype.getNameValuePairs_fn = function(arr) {
    var i, last = 0;
    for (i = this.value.length - 1; i > -1; i--) {
      if (this.value[i].value != null) {
        last = i;
        break;
      }
    }
    if (last < 1) {
      last = 1;
    }
    var v, innerStyle, d = "";
    for (i = 0; i < last + 1; i++) {
      innerStyle = this.value[i];
      v = innerStyle.value === null || innerStyle.value === innerStyle.dflt ? innerStyle.dfltClear : innerStyle.format_fn();
      d += Style.formatValue_fn(v, innerStyle);
      if (i < last + 2) {
        d += " ";
      }
    }
    this.applyPrefixArray_fn(this.name, this.getPrefixArray_fn(), arr, d);
  };
  StyleBoxShadow.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new StyleBoxShadow(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  StyleTextShadow.prototype = new StyleCombined;
  StyleTextShadow.prototype.constructor = StyleTextShadow;
  function StyleTextShadow(name, val, hasVariants, displayName, singleLine, showIcon, browsers, interp, canInterp) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, interp, canInterp);
    this.typeName = "StyleTextShadow";
  }
  css3kfa.StyleTextShadow = StyleTextShadow;
  StyleTextShadow.prototype.getNameValuePairs_fn = function(arr) {
    var i, last = 0;
    for (i = this.value.length - 1; i > -1; i--) {
      if (this.value[i].value != null) {
        last = i;
        break;
      }
    }
    if (last < 1) {
      last = 1;
    }
    var v, innerStyle, d = "";
    for (i = 0; i < last + 1; i++) {
      innerStyle = this.value[i];
      v = innerStyle.value === null || innerStyle.value === innerStyle.dflt ? innerStyle.dfltClear : innerStyle.format_fn();
      d += Style.formatValue_fn(v, innerStyle);
      if (i < last + 2) {
        d += " ";
      }
    }
    this.applyPrefixArray_fn(this.name, this.getPrefixArray_fn(), arr, d);
  };
  StyleTextShadow.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new StyleTextShadow(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  StyleBorderImage.prototype = new Style;
  StyleBorderImage.prototype.constructor = StyleBorderImage;
  function StyleBorderImage(name, val, hasVariants, displayName, singleLine, showIcon, browsers, interp, canInterp) {
    Style.call(this, name, val, hasVariants, displayName, singleLine, showIcon, browsers, interp, canInterp);
    this.typeName = "StyleBorderImage";
  }
  css3kfa.StyleBorderImage = StyleBorderImage;
  StyleBorderImage.prototype.getNameValuePairs_fn = function(arr) {
    var v, i, d = "", last = 0;
    for (i = this.value.length - 1; i > -1; i--) {
      if (this.value[i].value != null) {
        last = i;
        break;
      }
    }
    if (last < 3) {
      last = 3;
    }
    for (i = 0; i < last + 1; i++) {
      v = this.value[i].value === null ? this.value[i].dflt : this.value[i].format_fn();
      d += Style.formatValue_fn(v, this.value[i]);
      d += " ";
    }
    this.applyPrefixArray_fn(this.name, this.getPrefixArray_fn(), arr, d);
  };
  StyleBorderImage.prototype.create_fn = function(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp) {
    return new StyleBorderImage(name, val, hasVariants, displayName, singleLine, showIcon, browsers, canInterp);
  };
  function InnerStyle(name, unitType, dfltClear, unit, value, canInterp, displayName, browsers) {
    if (typeof name === "object") {
      this.deserialize_fn(name);
      return;
    }
    this.parent = null;
    this.name = name;
    this.unitType = unitType;
    if (unit === undefined || unit === null) {
      this.unit = unitType === undefined || unitType === null ? "" : css3kfa.Editor_defaultUnit;
    } else {
      this.unit = unit;
    }
    this.dfltClear = dfltClear === undefined || dfltClear === null ? "initial" : dfltClear;
    this.value = value === undefined ? null : value;
    this.canInterp = canInterp === undefined ? true : canInterp;
    this.displayName = displayName === null || displayName === undefined ? name : displayName;
    this.browsers = browsers === undefined ? null : browsers;
    this.isDflt = true;
    this.open = false;
    this.inneropen = false;
  }
  css3kfa.InnerStyle = InnerStyle;
  InnerStyle.interpolate_fn = function(style1, style2, weight) {
    if (style1 === null || style2 === null) {
      return null;
    }
    var v, ret, col, unit = style1.unit, v1 = style1.value, v2 = style2.value;
    switch(style1.unitType) {
      case "pixel":
      case "pixelpositive":
      case "fontweight":
      case "numeric":
      case "degree":
      case "degrees":
      case "numericmin":
      case "decimal":
      case "decimalmax":
      case "percent":
      case "percentmax":
      case "percentzero":
        var num1 = $.isNumeric(v1);
        var num2 = $.isNumeric(v2);
        if (!num1 && !num2) {
          ret = new InnerStyle(style1.name, style1.unitType, style1.dfltClear, unit, v1, style1.canInterp, style1.displayName, style1.browsers, style1.canInterp);
          ret.dflt = style1.dflt;
          return ret;
        }
        if (!num1) {
          v1 = style1.dfltClear;
        }
        if (!num2) {
          v2 = style2.dfltClear;
        }
        var num_v1 = Number(v1);
        var num_v2 = Number(v2);
        v = Number(((num_v2 - num_v1) * weight + num_v1).toFixed(3));
        break;
      case "color":
        if (v1 === null && v2 === null) {
          ret = new InnerStyle(style1.name, style1.unitType, style1.dfltClear, unit, v1, style1.canInterp, style1.displayName, style1.browsers, style1.canInterp);
          ret.dflt = style1.dflt;
          return ret;
        }
        if (v1 === null) {
          v1 = style1.dfltClear;
        }
        if (v2 === null) {
          v2 = style2.dfltClear;
        }
        var col1, col2, c = null;
        if (/^rgb/.exec(v1) !== null) {
          col = new Color(v1);
          col1 = $.extend(col.toRgb(), {a:col._alpha});
        } else {
          c = new Color;
          col1 = $.extend(c.fromHex(v1).toRgb(), {a:1});
        }
        if (/^rgb/.exec(v2) !== null) {
          col = new Color(v2);
          col2 = $.extend(col.toRgb(), {a:col._alpha});
        } else {
          if (c === null) {
            c = new Color;
          }
          col2 = $.extend(c.fromHex(v2).toRgb(), {a:1});
        }
        v = "";
        var a1 = Number(((col2.r - col1.r) * weight + col1.r).toFixed(0)), a2 = Number(((col2.g - col1.g) * weight + col1.g).toFixed(0)), a3 = Number(((col2.b - col1.b) * weight + col1.b).toFixed(0)), a4 = Number(((col2.a - col1.a) * weight + col1.a).toFixed(1));
        if (a4 == 1) {
          var n1 = a1.toString(16), n2 = a2.toString(16), n3 = a3.toString(16);
          if (n1.length === 1) {
            n1 = "0" + a1;
          }
          if (n2.length === 1) {
            n2 = "0" + a2;
          }
          if (n3.length === 1) {
            n3 = "0" + a3;
          }
          v = "#" + n1 + n2 + n3;
        } else {
          v = "rgba(" + a1.toString() + ", " + a2.toString() + ", " + a3.toString() + ", " + a4.toString() + ")";
        }
        break;
      default:
        v = style1.value;
        break;
    }
    ret = new InnerStyle(style1.name, style1.unitType, style1.dfltClear, unit, v, style1.canInterp, style1.displayName, style1.browsers, style1.canInterp);
    ret.isDflt = false;
    return ret;
  };
  InnerStyle.prototype = {toJSON:function(key) {
    var replacement = {};
    for (var val in this) {
      switch(val) {
        case "parent":
        case "clearButtonId":
        case "rowId":
          break;
        default:
          replacement[val] = this[val];
      }
    }
    return replacement;
  }, deserialize_fn:function(obj) {
    this.name = obj.name;
    this.unitType = obj.unitType;
    this.unit = obj.unit;
    this.value = obj.value;
    this.canInterp = obj.canInterp;
    this.displayName = obj.displayName;
    this.dflt = obj.dflt;
    this.isDflt = obj.isDflt;
    this.browsers = obj.browsers;
    this.dfltClear = obj.dfltClear;
    this.isDflt = obj.isDflt;
    this.innerOpen = obj.inneropen;
    this.open = obj.open;
  }, clone_fn:function() {
    var s = new InnerStyle(this.name, this.unitType, this.dfltClear, this.unit, this.value, this.canInterp, this.displayName, this.browsers);
    s.rowId = this.rowId;
    s.clearButtonId = this.clearButtonId;
    s.isDflt = this.isDflt;
    s.dflt = this.dflt;
    s.parent = this.parent;
    return s;
  }, format_fn:function() {
    return this.value === this.dfltClear ? this.dfltClear : this.isDflt ? this.dflt : this.value;
  }, valueOrDefault_fn:function() {
    return this.isDflt === true ? {value:this.dflt, isDflt:true} : {value:this.value, isDflt:false};
  }, htmlVal_fn:function() {
    return Style.formatValue_fn(this.format_fn(), this);
  }, validate_fn:function(value) {
    switch(this.unitType) {
      case "pixel":
        break;
      case "color":
        break;
      case "decimal":
      case "decimalmax":
      case "degree":
      case "degrees":
        if (value == null) {
          return;
        }
        if (isNaN(value)) {
          value = value.replace(/[^\.0-9]/, "");
          if (isNaN(value)) {
            value = 0;
          }
        }
        break;
      case "image":
        if (value.search(/http/) === -1) {
          value = "http://" + value;
        }
        break;
    }
    return value;
  }, toDfltIfNotNull_fn:function() {
    if (this.value === null) {
      this.value = this.dflt;
      this.isDflt = true;
    }
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);

