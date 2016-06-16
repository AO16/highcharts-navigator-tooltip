'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _window = window;
var _window$Highcharts = _window.Highcharts;
var Scroller = _window$Highcharts.Scroller;
var wrap = _window$Highcharts.wrap;


(function () {
  /**
   * Render tooltip into navigatorGroup
   *
   * @name renderTooltip
   * @param {Scroller} scroller
   * @param {String} position: position of tooltip [left, right, center]
   * @param {String} str: string to initially display in tooltip
   * @returns {undefined}
   */
  var renderTooltip = function renderTooltip(scroller, position, str) {
    var renderer = scroller.chart.renderer;

    scroller[position + 'Tooltip'] = renderer.rect(0, 0, 0, 0, 3, 2).addClass('fade-out').add(scroller.navigatorGroup);
    scroller[position + 'TooltipText'] = renderer.text(str, 5, 15).addClass('fade-out').add(scroller.navigatorGroup);
  };

  /**
   * Fade in/out tooltip
   *
   * @name fade
   * @param {String} direction: direction of fade [in, out]
   * @returns {Function}
   */
  var fade = function fade(direction) {
    return function (scroller, position) {
      var tooltip = scroller[position + 'Tooltip'];
      var text = scroller[position + 'TooltipText'];
      var tooltipArrow = scroller.tooltipArrow;

      var fadeClass = 'fade-' + direction;

      tooltip.attr('class', fadeClass);
      text.attr('class', fadeClass);
      tooltipArrow.attr('class', fadeClass);
    };
  };

  var fadeInTooltip = fade('in');
  var fadeOutTooltip = fade('out');

  var tooltipPadding = 5;

  /**
   * Find the correct position for the tooltip and the tooltip's arrow
   *
   * @name findTooltipPosition
   * @param {Scroller} scroller
   * @param {String} position: position of tooltip [left, right, center]
   * @param {String} tooltipWidth
   * @returns {Object}
   *   @returns {Number} x
   *   @returns {Number} y
   *   @returns {Number} arrow
   *     @returns {Number} x
   *     @returns {Number} y
   */
  var findTooltipPosition = function findTooltipPosition(scroller, position, tooltipWidth) {
    var scrollerWidth = scroller.scrollerWidth;
    var scrollerLeft = scroller.scrollerLeft;
    var fixedWidth = scroller.fixedWidth;

    var handleIndex = { left: 0, right: 1, center: 0 };
    var handle = scroller.handles[handleIndex[position]];
    var offset = (tooltipWidth + tooltipPadding) / 2;
    var x = handle.translateX - offset;
    var arrow = {
      x: handle.translateX - 5,
      y: handle.translateY - 15
    };

    if (position === 'center') {
      x = handle.translateX + (fixedWidth - tooltipWidth) / 2;
      arrow.x = x + tooltipWidth / 2 - 5;
    }

    // tooltip is outside right edge of minimap
    if (x + tooltipWidth > scrollerWidth) {
      x = scrollerWidth - tooltipWidth;
      arrow.x = scrollerWidth - 5;
    }

    // tooltip is outside of left edge of minimap
    if (x < scrollerLeft) {
      x = scrollerLeft;
      arrow.x = x;
    }

    return { x: x, y: handle.translateY - 20, arrow: arrow };
  };

  var tooltipFill = '#f1eeef';

  /**
   * Adjust the position, width of the tooltip
   *
   * @name adjustTooltip
   * @param {Scroller} scroller
   * @param {String} position: position of tooltip [left, right, center]
   * @param {String} str: string to initially display in tooltip
   * @returns {undefined}
   */
  var adjustTooltip = function adjustTooltip(scroller, position, str) {
    var arrow = scroller.tooltipArrow;
    var tooltip = scroller[position + 'Tooltip'];
    var text = scroller[position + 'TooltipText'];
    var _text$element = text.element;
    var textWidth = _text$element.clientWidth;
    var textHeight = _text$element.clientHeight;

    var _findTooltipPosition = findTooltipPosition(scroller, position, textWidth);

    var x = _findTooltipPosition.x;
    var y = _findTooltipPosition.y;
    var _findTooltipPosition$ = _findTooltipPosition.arrow;
    var arrowX = _findTooltipPosition$.x;
    var arrowY = _findTooltipPosition$.y;


    tooltip.attr({
      width: textWidth + tooltipPadding,
      height: textHeight + tooltipPadding,
      fill: tooltipFill,
      x: x,
      y: y - textHeight
    });

    text.attr({ text: str, x: x + tooltipPadding / 2, y: y });

    arrow.attr({
      d: ['M', arrowX, arrowY, 'H', arrowX + 10, 'L', arrowX + 5, arrowY + 5, 'L', arrowX, arrowY],
      fill: tooltipFill
    });
  };

  /**
   * Render the scroller as it changes through interaction
   *
   * @name render
   * @param {Function} proceed: effectively `_super`
   * @param {Number} min: min xAxis value of currently represented by the navigator
   * @param {Number} max: max xAxis value of currently represented by the navigator
   * @param {Number} pxMin: min pixel position of current navigator selection
   * @param {Number} pxMax: max pixel position of current navigator selection
   * @returns {undefined}
   */
  wrap(Scroller.prototype, 'render', function (proceed, min, max, pxMin, pxMax) {
    var _this = this;

    var _arguments = Array.prototype.slice.call(arguments);

    var args = _arguments.slice(1);

    proceed.call.apply(proceed, [this].concat(_toConsumableArray(args)));

    var renderer = this.chart.renderer;
    var tooltipFormatter = this.navigatorOptions.tooltipFormatter;


    if (!tooltipFormatter) return;
    var range = this.xAxis.toFixedRange(this.zoomedMin, this.zoomedMax);
    var formattedTooltipText = tooltipFormatter(range.min, range.max, pxMin, pxMax);
    formattedTooltipText.center = formattedTooltipText.left + ' - ' + formattedTooltipText.right;

    if (!this.tooltipRendered) {
      renderTooltip(this, 'left', formattedTooltipText.left);
      renderTooltip(this, 'right', formattedTooltipText.right);
      renderTooltip(this, 'center', formattedTooltipText.center);
      this.tooltipArrow = renderer.path(['M', 0, 0, 'H', 10, 'L', 5, 5, 'L', 0, 0]).addClass('fade-out').add(this.navigatorGroup);
      this.tooltipRendered = true;
    }

    if (!formattedTooltipText.left) return;
    var positions = ['left', 'right', 'center'];
    positions.forEach(function (position) {
      var capitalizedPosition = position.charAt(0).toUpperCase() + position.slice(1);
      var grabbed = _this['grabbed' + capitalizedPosition];
      if (grabbed) {
        fadeInTooltip(_this, position);
        adjustTooltip(_this, position, formattedTooltipText[position]);
        setTimeout(function () {
          fadeOutTooltip(_this, position);
        }, 1000);
      }
    });
  });
})();