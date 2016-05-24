const { Highcharts: { Scroller, wrap } } = window;

(function() {
  /**
   * Render tooltip into navigatorGroup
   *
   * @name renderTooltip
   * @param {Scroller} scroller
   * @param {String} position: position of tooltip [left, right, center]
   * @param {String} str: string to initially display in tooltip
   * @returns {undefined}
   */
  const renderTooltip = function(scroller, position, str) {
    const { chart: { renderer } } = scroller;
    scroller[`${position}Tooltip`] = renderer.rect(0, 0, 0, 0, 3, 2).addClass('fade-out').add(this.navigatorGroup);
    scroller[`${position}TooltipText`] = renderer.text(str, 5, 15).addClass('fade-out').add(this.navigatorGroup);
  };

  /**
   * Fade in/out tooltip
   *
   * @name fade
   * @param {String} direction: direction of fade [in, out]
   * @returns {Function}
   */
  const fade = (direction) => {
    return function(scroller, position) {
      const { [`${position}Tooltip`]: tooltip, [`${position}TooltipText`]: text, tooltipArrow } = scroller;
      const fadeClass = `fade-${direction}`;

      tooltip.attr('class', fadeClass);
      text.attr('class', fadeClass);
      tooltipArrow.attr('class', fadeClass);
    };
  };

  const fadeInTooltip = fade('in');
  const fadeOutTooltip = fade('out');

  const tooltipPadding = 5;

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
  const findTooltipPosition = function(scroller, position, tooltipWidth) {
    const { scrollerWidth, scrollerLeft, fixedWidth } = scroller;
    const handleIndex = { left: 0, right: 1, center: 0 };
    const handle = scroller.handles[handleIndex[position]];
    const offset = ((tooltipWidth + tooltipPadding) / 2);
    let x = handle.translateX - offset;
    const arrow = {
      x: handle.translateX - 5,
      y: handle.translateY - 15
    };

    if (position === 'center') {
      x = handle.translateX + ((fixedWidth - tooltipWidth) / 2);
      arrow.x = x + (tooltipWidth / 2) - 5;
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

    return { x, y: handle.translateY - 20, arrow };
  };

  const tooltipFill = '#f1eeef';

  /**
   * Adjust the position, width of the tooltip
   *
   * @name adjustTooltip
   * @param {Scroller} scroller
   * @param {String} position: position of tooltip [left, right, center]
   * @param {String} str: string to initially display in tooltip
   * @returns {undefined}
   */
  const adjustTooltip = function(scroller, position, str) {
    const { tooltipArrow: arrow, [`${position}Tooltip`]: tooltip, [`${position}TooltipText`]: text } = scroller;
    const { clientWidth: textWidth, clientHeight: textHeight } = text.element;
    const { x, y, arrow: { x: arrowX, y: arrowY } } = findTooltipPosition(scroller, position, textWidth);

    tooltip.attr({
      width: textWidth + tooltipPadding,
      height: textHeight + tooltipPadding,
      fill: tooltipFill,
      x,
      y: y - textHeight
    });

    text.attr({ text: str, x: x + (tooltipPadding / 2), y });

    arrow.attr({
      d: [
        'M', arrowX, arrowY,
        'H', arrowX + 10,
        'L', arrowX + 5, arrowY + 5,
        'L', arrowX, arrowY
      ],
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
  wrap(Scroller.prototype, 'render', function(proceed, min, max, pxMin, pxMax) {
    const [, ...args] = arguments;
    proceed.call(this, ...args);

    const { chart: { renderer }, navigatorOptions: { tooltipFormatter } } = this;

    if (!tooltipFormatter) return;

    const { chart } = this;
    const { dataMin, dataMax } = chart.xAxis[0];
    const diff = dataMax - dataMin;
    const unit = diff / chart.xAxis[0].width;
    const range = { min: dataMin + (unit * this.zoomedMin), max: dataMin + (unit * this.zoomedMax) };

    const formattedTooltipText = tooltipFormatter(range.min, range.max, pxMin, pxMax);
    formattedTooltipText.center = `${formattedTooltipText.left} - ${formattedTooltipText.right}`;

    if (!this.tooltipRendered) {
      renderTooltip(this, 'left', formattedTooltipText.left);
      renderTooltip(this, 'right', formattedTooltipText.right);
      renderTooltip(this, 'center', formattedTooltipText.center);
      this.tooltipArrow = renderer.path([
        'M', 0, 0,
        'H', 10,
        'L', 5, 5,
        'L', 0, 0
      ]).addClass('fade-out').add(this.navigatorGroup);
      this.tooltipRendered = true;
    }

    if (!formattedTooltipText.left) return;
    const positions = ['left', 'right', 'center'];
    positions.forEach((position) => {
      const capitalizedPosition = position.charAt(0).toUpperCase() + position.slice(1);
      const grabbed = this[`grabbed${capitalizedPosition}`];
      if (grabbed) {
        fadeInTooltip(this, position);
        adjustTooltip(this, position, formattedTooltipText[position]);
        setTimeout(() => {
          fadeOutTooltip(this, position);
        }, 1000);
      }
    });
  });
}());
