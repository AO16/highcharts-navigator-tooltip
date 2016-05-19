const { Highcharts: { Scroller, wrap } } = window;

(function() {
  Scroller.prototype.renderTooltip = function(position, str) {
    const { chart: { renderer } } = this;
    this[`${position}Tooltip`] = renderer.rect(0, 0, 0, 0, 3, 2).addClass('fade-out').add(this.navigatorGroup);
    this[`${position}TooltipText`] = renderer.text(str, 5, 15).addClass('fade-out').add(this.navigatorGroup);
  };

  const fade = (direction) => {
    return function(position) {
      const { [`${position}Tooltip`]: tooltip, [`${position}TooltipText`]: text } = this;
      const fadeClass = `fade-${direction}`;

      tooltip.attr('class', fadeClass);
      text.attr('class', fadeClass);
      this.tooltipArrow.attr('class', fadeClass);
    };
  };

  Scroller.prototype.fadeInTooltip = fade('in');
  Scroller.prototype.fadeOutTooltip = fade('out');

  Scroller.prototype.tooltipPadding = 5;
  Scroller.prototype.findTooltipPosition = function(position, tooltipWidth) {
    const { tooltipPadding, scrollerWidth, scrollerLeft, fixedContainerWidth } = this;
    const handleIndex = { left: 0, right: 1, center: 0 };
    const handle = this.handles[handleIndex[position]];
    const offset = ((tooltipWidth + tooltipPadding) / 2);
    let x = handle.translateX - offset;
    const arrow = {
      x: handle.translateX - 5,
      y: handle.translateY - 15
    };

    if (position === 'center') {
      x = handle.translateX + ((fixedContainerWidth - tooltipWidth) / 2);
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

  Scroller.prototype.tooltipFill = '#f1eeef';
  Scroller.prototype.adjustTooltip = function(position, str) {
    const { tooltipPadding, tooltipFill, [`${position}Tooltip`]: tooltip, [`${position}TooltipText`]: text } = this;
    const textWidth = text.element.clientWidth;
    const textHeight = text.element.clientHeight;
    const { x, y, arrow: { x: arrowX, y: arrowY } } = this.findPosition(position, textWidth);
    const arrow = this.tooltipArrow;

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

  wrap(Scroller.prototype, 'render', function(proceed, min, max, pxMin, pxMax) {
    const [, ...args] = arguments;
    proceed.call(this, ...args);

    const { chart: { renderer }, navigatorOptions: { tooltipFormatter }, renderTooltip } = this;

    if (!tooltipFormatter) return;
    const range = this.xAxis.toFixedRange(this.zoomedMin, this.zoomedMax);
    const formattedTooltipText = tooltipFormatter(range.min, range.max, pxMin, pxMax);
    formattedTooltipText.center = `${formattedTooltipText.left} - ${formattedTooltipText.right}`;

    if (!this.tooltipRendered) {
      renderTooltip('left', formattedTooltipText.left);
      renderTooltip('right', formattedTooltipText.right);
      renderTooltip('center', formattedTooltipText.center);
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
        this.fadeInTooltip(position);
        this.adjustTooltip(position, formattedTooltipText[position]);
        setTimeout(() => {
          this.fadeOutTooltip(position);
        }, 1000);
      }
    });
  });
}());
