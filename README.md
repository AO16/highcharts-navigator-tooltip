# Highcharts Navigator Tooltip

This is a plugin that adds tooltips to the navigator as a user drags. The navigator requires that you are using Highstock.

## Prerequisites

* [Gulp](http://gulpjs.com/)
* [Sass](http://sass-lang.com/)
* [Node.js](http://nodejs.org/) (with NPM)

## Installation

`npm install highcharts`  
`npm install highcharts-navigator-tooltip`

## Watch

`gulp watch:all`

## Building

`gulp build:all`

## Example

```html
<script src="path_to_node_modules/highstock.js"></script>
<script src="path_to_node_modules/dist/navigator-tooltip.js"></script>

<div id="container" style="height: 400px; min-width: 310px"></div> 
```

```javascript
$('#container').highcharts('StockChart', {

  rangeSelector : {
      selected : 1
  },

  title : {
      text : 'AAPL Stock Price'
  },
  
  navigator: {
      tooltipFormatter: function(min, max) {
          return { left: min, right: max };
      }
  },

  series : [{
      name : 'AAPL',
      data : [
          /* May 2009 */
          [1242864000000,17.74],
          [1242950400000,17.50],
          [1243296000000,18.68],
          [1243382400000,19.01],
          [1243468800000,19.30],
          [1243555200000,19.40]
      ],
      tooltip: {
          valueDecimals: 2
      }
  }]
});
```
