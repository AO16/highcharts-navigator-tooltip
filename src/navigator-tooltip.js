/* global window */

const { Highcharts: { Scroller, wrap } } = window;

(function() {
  wrap(Scroller.prototype, 'render', function(proceed, min, max, pxMin, pxMax) {
    const [, ...args] = arguments;
    proceed.call(this, ...args);

    const { chart: { renderer }, navigatorOptions: { tooltipFormatter } } = this;
    const tooltipPadding = 5;

    if (!tooltipFormatter) return;
    const range = this.xAxis.toFixedRange(this.zoomedMin, this.zoomedMax);
    const formattedTooltipText = tooltipFormatter(range.min, range.max, pxMin, pxMax);

    const renderTooltip = (side, str) => {
      this[`${side}Tooltip`] = renderer.rect(0, 0, 0, 0, 3, 2).addClass('fade-out').add(this.navigatorGroup);
      this[`${side}TooltipText`] = renderer.text(str, 5, 15).addClass('fade-out').add(this.navigatorGroup);
    };

    if (!this.tooltipRendered) {
      renderTooltip('left', formattedTooltipText.min);
      renderTooltip('right', formattedTooltipText.max);
      renderTooltip('center', `${formattedTooltipText.min} - ${formattedTooltipText.max}`);
      this.tooltipArrow = renderer.path([
        'M', 0, 0,
        'H', 10,
        'L', 5, 5,
        'L', 0, 0
      ]).addClass('fade-out').add(this.navigatorGroup);
      this.tooltipRendered = true;
    }

    if (!formattedTooltipText.min) return;

    const fadeInTooltip = (side) => {
      const tooltip = this[`${side}Tooltip`];
      const text = this[`${side}TooltipText`];
      tooltip.attr('class', 'fade-in');
      text.attr('class', 'fade-in');
      this.tooltipArrow.attr('class', 'fade-in');
    };

    const fadeOutTooltip = function(side) {
      const tooltip = this[`${side}Tooltip`];
      const text = this[`${side}TooltipText`];
      tooltip.attr('class', 'fade-out');
      text.attr('class', 'fade-out');
      this.tooltipArrow.attr('class', 'fade-out');
    }.bind(this);

    const findPosition = function(side, width) {
      const handleIndex = { left: 0, right: 1, center: 0 };
      const handle = this.handles[handleIndex[side]];
      const offset = ((width + tooltipPadding) / 2);
      let x = handle.translateX - offset;
      const arrow = {
        x: handle.translateX - 5,
        y: handle.translateY - 15
      };

      if (side === 'center') {
        x = handle.translateX + ((this.fixedWidth - width) / 2);
        arrow.x = x + (width / 2) - 5;
      }

      if (x + width > this.scrollerWidth) {
        x = this.scrollerWidth - width;
        arrow.x = this.scrollerWidth - 5;
      }

      if (x < this.scrollerLeft) {
        x = this.scrollerLeft;
        arrow.x = x;
      }

      return { x, y: handle.translateY - 20, arrow };
    }.bind(this);

    const adjustTooltip = function(side, str) {
      const tooltip = this[`${side}Tooltip`];
      const text = this[`${side}TooltipText`];
      const textWidth = text.element.clientWidth;
      const textHeight = text.element.clientHeight;
      const pos = findPosition(side, textWidth);
      const arrow = this.tooltipArrow;

      tooltip.attr({
        width: textWidth + tooltipPadding,
        height: textHeight + tooltipPadding,
        fill: '#f1eeef',
        x: pos.x,
        y: pos.y - textHeight
      });

      text.attr({
        text: str,
        x: pos.x + (tooltipPadding / 2),
        y: pos.y
      });

      arrow.attr({
        d: [
          'M', pos.arrow.x, pos.arrow.y,
          'H', pos.arrow.x + 10,
          'L', pos.arrow.x + 5, pos.arrow.y + 5,
          'L', pos.arrow.x, pos.arrow.y
        ],
        fill: '#f1eeef'
      });
    }.bind(this);

    if (this.grabbedLeft) {
      fadeInTooltip('left');
      adjustTooltip('left', formattedTooltipText.min);
      setTimeout(function() {
        fadeOutTooltip('left');
      }, 1000);
    }

    if (this.grabbedRight) {
      fadeInTooltip('right');
      adjustTooltip('right', formattedTooltipText.max);
      setTimeout(function() {
        fadeOutTooltip('right');
      }, 1000);
    }

    if (this.grabbedCenter) {
      fadeInTooltip('center');
      adjustTooltip('center', `${formattedTooltipText.min} - ${formattedTooltipText.max}`);
      setTimeout(function() {
        fadeOutTooltip('center');
      }, 1000);
    }

  });
}());
