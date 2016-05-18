(function() {
  Highcharts.wrap(Highcharts.Scroller.prototype, 'render', function(proceed, min, max, pxMin, pxMax) {
    proceed.call(this, min, max, pxMin, pxMax);

    var formattedTooltipText;
    var renderer = this.chart.renderer;
    var tooltipFormatter = this.navigatorOptions.tooltipFormatter;
    var tooltipPadding = 5;

    if (!tooltipFormatter) return;

		var range = this.xAxis.toFixedRange(this.zoomedMin, this.zoomedMax);
    formattedTooltipText = tooltipFormatter(range.min, range.max, pxMin, pxMax);

    var renderTooltip = function(side, str) {
      this[side + 'Tooltip'] = renderer.rect(0, 0, 0, 0, 3, 2).addClass('fade-out').add(this.navigatorGroup);
      this[side + 'TooltipText'] = renderer.text(str, 5, 15).addClass('fade-out').add(this.navigatorGroup);
    }.bind(this);

    if (!this.tooltipRendered) {
      renderTooltip('left', formattedTooltipText.min);
      renderTooltip('right', formattedTooltipText.max);
      renderTooltip('center', formattedTooltipText.min + ' - ' + formattedTooltipText.max);
      this.tooltipArrow = renderer.path(['M', 0, 0, 'H', 10, 'L', 5, 5, 'L', 0, 0]).addClass('fade-out').add(this.navigatorGroup);
      this.tooltipRendered = true;
    }

    if (!formattedTooltipText.min) return;

    var fadeInTooltip = function(side) {
      var tooltip = this[side + 'Tooltip'];
      var text = this[side + 'TooltipText'];
      tooltip.attr('class', 'fade-in');
      text.attr('class', 'fade-in');
      this.tooltipArrow.attr('class', 'fade-in');
    }.bind(this);

    var fadeOutTooltip = function(side) {
      var tooltip = this[side + 'Tooltip'];
      var text = this[side + 'TooltipText'];
      tooltip.attr('class', 'fade-out');
      text.attr('class', 'fade-out');
      this.tooltipArrow.attr('class', 'fade-out');
    }.bind(this);

    var findPosition = function(side, width) {
      var handleIndex = { left: 0, right: 1, center: 0 };
      var handle = this.handles[handleIndex[side]];
      var offset = ((width + tooltipPadding)/2);
      var x = handle.translateX - offset;
      var arrow = {
        x: handle.translateX - 5,
        y: handle.translateY - 15
      };

      if (side === 'center') {
        x = handle.translateX + ((this.fixedWidth - width)/2);
        arrow.x = x + (width/2) - 5;
      }

      if (x + width > this.scrollerWidth) {
        x = this.scrollerWidth - width;
        arrow.x = this.scrollerWidth - 5;
      }

      if (x < this.scrollerLeft) {
        x = this.scrollerLeft;
        arrow.x = x;
      }

      return {
        x: x,
        y: handle.translateY - 20,
        arrow: arrow
      };
    }.bind(this);

    var adjustTooltip = function(side, str) {
      var tooltip = this[side + 'Tooltip'];
      var text = this[side + 'TooltipText'];
      var textWidth = text.element.clientWidth;
      var textHeight = text.element.clientHeight;
      var pos = findPosition(side, textWidth);
      var arrow = this.tooltipArrow;

      tooltip.attr({
        width: textWidth + tooltipPadding,
        height: textHeight + tooltipPadding,
        fill: '#f1eeef',
        x: pos.x,
        y: pos.y - textHeight
      });

      text.attr({
        text: str,
        x: pos.x + (tooltipPadding/2),
        y: pos.y
      });

      arrow.attr({
        d: ['M', pos.arrow.x, pos.arrow.y, 'H', pos.arrow.x + 10, 'L', pos.arrow.x + 5, pos.arrow.y + 5, 'L', pos.arrow.x, pos.arrow.y],
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
      adjustTooltip('center', formattedTooltipText.min + ' - ' + formattedTooltipText.max);
      setTimeout(function() {
        fadeOutTooltip('center');
      }, 1000);
    }

  });
}());
