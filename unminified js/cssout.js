(function(css3kfa, $, undefined) {
  function CSS_Out(data) {
    this.totLength = 0;
    this.formatHTML = false;
    this.minify = false;
  }
  css3kfa.CSS_Out = CSS_Out;
  CSS_Out.prototype = {getStyles:function(animType, obj, formatHTML) {
    if (formatHTML === undefined) {
      this.formatHTML = false;
    } else {
      this.formatHTML = formatHTML;
    }
    if (animType === 2) {
      return this.getStylesTrans_fn(obj);
    } else {
      return this.getStylesAnim_fn(obj);
    }
  }, getStylesTrans_fn:function(obj) {
    var html = "";
    var totFrames = this.getLength_fn(obj, 0);
    if (totFrames !== 0) {
      var totLength = this.format_fn(totFrames / obj.fps);
      this.totLength = totLength;
      var space = 2;
      html = this.writeCss_fn(0, obj.name + " {");
      if (this.hasPosition_fn(obj)) {
        html += this.writeCss_fn(space, "position:relative;");
      }
      var cnt = obj.css.length;
      var kf = cnt > 1 ? obj.css[1] : obj.css[0];
      var v, i;
      for (i = 0; i < kf.data.length; i++) {
        v = kf.data[i];
        html += this.writeCss_fn(space, v.name + ":" + v.value + ";");
      }
      if (cnt > 1) {
        html += this.getTrans_fn("-webkit-", space, obj);
        html += this.getTrans_fn("-moz-", space, obj);
        html += this.getTrans_fn("-o-", space, obj);
        html += this.getTrans_fn("", space, obj);
      }
      html += this.writeCss_fn(0, "}");
      if (cnt > 1) {
        html += this.writeCss_fn(0, obj.name + ":hover {");
        kf = obj.css[obj.css.length - 1];
        for (i = 0; i < kf.data.length; i++) {
          v = kf.data[i];
          html += this.writeCss_fn(space, v.name + ":" + v.value + ";");
        }
        html += this.writeCss_fn(0, "}");
      }
    }
    for (var p = 0; p < obj.children.length; p++) {
      html += this.getStylesTrans_fn(obj.children[p]);
    }
    html += this.writeBreak_fn();
    return html;
  }, getTrans_fn:function(prefix, spacecount, obj) {
    var anims = "";
    anims += this.writeCss_fn(spacecount, prefix + "transition-property:all;");
    anims += this.writeCss_fn(spacecount, prefix + "transition-duration:" + this.totLength + "s;");
    anims += this.writeCss_fn(spacecount, prefix + "transition-timing-function:" + obj.timingfunc + ";");
    if (obj.delay !== undefined && obj.delay != 0) {
      anims += this.writeCss_fn(spacecount, prefix + "transition-delay:" + obj.delay + "s;");
    }
    return anims;
  }, hasPosition_fn:function(obj) {
    if (obj.posType !== undefined && obj.posType === "absolute" || obj.posType === "fixed") {
      return false;
    }
    var css = obj.css;
    var data, i, p, style;
    for (i = 0; i < css.length; i++) {
      data = css[i].data;
      for (p = 0; p < data.length; p++) {
        style = data[p];
        if (style.name === "left" || style.name === "top" || style.name === "right" || style.name === "bottom") {
          return true;
        }
      }
    }
    return false;
  }, getParentName_fn:function(name) {
    var match = name.match(/(.+)(>.+)/);
    if (match !== null && match.length > 0) {
      return match[1];
    }
    return name;
  }, getStylesAnim_fn:function(obj) {
    var html = "";
    var totFrames = this.getLength_fn(obj, 0);
    if (totFrames !== 0) {
      var totLength = this.format_fn(totFrames / obj.fps);
      this.totLength = totLength;
      var space = 2;
      if (obj.transformStyle !== null && obj.transformStyle !== "") {
        html += this.writeCss_fn(0, obj.parentName + " {");
        html += this.writeCss_fn(space, "-webkit-perspective:" + obj.perspective + ";");
        html += this.writeCss_fn(space, "-moz-perspective:" + obj.perspective + ";");
        html += this.writeCss_fn(space, "perspective:" + obj.perspective + ";");
        html += this.writeCss_fn(0, "}");
      }
      html += this.writeCss_fn(0, obj.name + " {");
      if (this.hasPosition_fn(obj)) {
        html += this.writeCss_fn(space, "position:relative;");
      }
      if (obj.transformStyle !== null && obj.transformStyle !== "") {
        html += this.writeCss_fn(space, "-webkit-transform-style:" + obj.transformStyle + ";");
        html += this.writeCss_fn(space, "-moz-transform-style:" + obj.transformStyle + ";");
        html += this.writeCss_fn(space, "transform-style:" + obj.transformStyle + ";");
      }
      var kf = obj.css[0];
      var v, i;
      for (i = 0; i < kf.data.length; i++) {
        v = kf.data[i];
        html += this.writeCss_fn(space, v.name + ":" + v.value + ";");
      }
      var cnt = obj.css.length;
      if (cnt > 1) {
        html += this.getAnims_fn("-webkit-", space, obj);
        html += this.getAnims_fn("", space, obj);
      }
      html += this.writeCss_fn(0, "}");
      if (cnt > 1) {
        var pc, anims = "", last = totFrames - 1;
        kf = obj.css[1];
        if (kf.frame !== 0) {
          anims += this.writeAnim_fn(space, kf, 0);
        }
        for (i = 1; i < cnt; i++) {
          kf = obj.css[i];
          pc = this.format_fn(kf.frame / last * 100);
          anims += this.writeAnim_fn(space, kf, pc);
        }
        kf = obj.css[cnt - 1];
        if (kf.frame !== last) {
          anims += this.writeAnim_fn(space, kf, 100);
        }
        anims += this.writeCss_fn(0, "}");
        html += this.writeCss_fn(0, "@keyframes " + obj.animationName + " {") + anims;
        html += this.writeCss_fn(0, "@-webkit-keyframes " + obj.animationName + " {") + anims;
      }
    }
    for (var p = 0; p < obj.children.length; p++) {
      html += this.getStylesAnim_fn(obj.children[p]);
    }
    html += this.writeBreak_fn();
    return html;
  }, writeBreak_fn:function() {
    if (this.formatHTML === true) {
      return "<br>";
    } else {
      return "\n";
    }
  }, writeAnim_fn:function(space, kf, pc) {
    var v, i, d = this.writeCss_fn(space, pc + "% {");
    for (i = 0; i < kf.data.length; i++) {
      v = kf.data[i];
      d += this.writeCss_fn(space + 2, v.name + ":" + v.value + ";");
    }
    d += this.writeCss_fn(space, "}");
    return d;
  }, writeCss_fn:function(spaces, text) {
    var sp = "", br = "", spacer = "";
    if (this.formatHTML === true) {
      spacer = "&nbsp;";
      br = "<br>";
      text = text.replace(/</, "&lt;");
      text = text.replace(/>/, "&gt;");
      text = text.replace(/ /, "&nbsp;");
    } else {
      if (this.minify === false) {
        spacer = " ";
        br = "\n";
      }
    }
    for (var i = 0; i < spaces; i++) {
      sp += spacer;
    }
    return sp + text + br;
  }, getAnims_fn:function(prefix, spacecount, obj) {
    var anims = "";
    anims = this.writeCss_fn(spacecount, prefix + "animation-name:" + obj.animationName + ";");
    anims += this.writeCss_fn(spacecount, prefix + "animation-duration:" + this.totLength + "s;");
    if (obj.timingfunc !== "") {
      anims += this.writeCss_fn(spacecount, prefix + "animation-timing-function:" + obj.timingfunc + ";");
    }
    var d = obj.delay;
    if (d !== undefined && d !== 0) {
      anims += this.writeCss_fn(spacecount, prefix + "animation-delay:" + obj.delay + "s;");
    }
    if (obj.iterations != 1) {
      anims += this.writeCss_fn(spacecount, prefix + "animation-iteration-count:" + obj.iterations + ";");
    }
    if (obj.direction != "normal") {
      anims += this.writeCss_fn(spacecount, prefix + "animation-direction:" + obj.direction + ";");
    }
    var playstate = this.formatHTML === false ? "paused" : obj.playstate;
    anims += this.writeCss_fn(spacecount, prefix + "animation-play-state:" + playstate + ";");
    return anims;
  }, format_fn:function(l) {
    return Number(parseFloat(l).toFixed(3)).toString();
  }, getLength_fn:function(obj, l) {
    if (obj.name === "" || obj.name === "root") {
      return 0;
    }
    var c = obj.css;
    if (c.length > 0) {
      var _l = c[c.length - 1].frame + 1;
      if (_l > l) {
        l = _l;
      }
    }
    return l;
  }};
})(window.css3kfa = window.css3kfa || {}, jQuery);

