// Copyright (c) 2016 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component} from 'react';
import PropTypes from "prop-types";
import { scaleLinear } from 'd3-scale';

import { XYPlot, XAxis, YAxis, HeatmapSeries, LabelSeries, MarkSeries } from 'react-vis';
import continuousColorLegend from 'react-vis/dist/legends/continuous-color-legend';

class Heatmap extends Component {

  static propTypes = {
    heatMapJson: PropTypes.instanceOf(Array),
  };

  static defaultProps = {
    data: [],
      heatMapType: ""

  };

  constructor(props) {
    super(props);

    this.state = {
      data: props.data,
        // yArray is used for the reports Heatmaps and yArrayStudents is used for students heatmap
        // yArray: ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", ],
        yArrayStudents: ["1", "2", "3", "4", "5"]
    };
  }

  // Sets the correct range for the y-axis depending on what day the data starts on
    // This assumes the range length will always be exactly one week
  setYArrayRange(data) {
      try {
          if (data[0]["y"] === "Thu") {
              return ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", ]
          }
          else if (data[0]["y"] === "Fri") {
              return ["Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", ]
          }
          else if (data[0]["y"] === "Sat") {
              return ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", ]
          }
          else if (data[0]["y"] === "Sun") {
              return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", ]
          }
          else if (data[0]["y"] === "Mon") {
              return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", ]
          }
          else if (data[0]["y"] === "Tue") {
              return ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon",]
          }
          else if (data[0]["y"] === "Wed") {
              return ["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", ]
          }
      }
      catch(err) {
          console.log(err);
      }


  };

  scaleWidth(heatMapType, dataLength) {
    if (heatMapType === "weekly" || heatMapType === "individualStudent") {
      return 8*dataLength;
    }
    else if (heatMapType === "annual") {
      return 3.2*dataLength;
    }
  }

  scaleHeight(heatMapType) {
      if (heatMapType === "weekly" || heatMapType === "individualStudent") {
          return 350;
      }
      else if (heatMapType === "annual") {
          return 200;
      }
  }

  axisType(heatMapType) {
      return "ordinal";
  }

  colorRange(data, heatMapType) {
      for (var i=0; i<data.length; i++) {
          if ((heatMapType === "individualStudent"  && data[i]["color"] !== 0) ||
              ((heatMapType === "weekly" || heatMapType === "annual" ) && data[i]["count"] !== 0)) {
              return ["#F5FBFD", "teal"]
          }
      }
      return ["#F5FBFD", "#F5FBFD"];
  }

  // Returns the correct y-axis dependent on heatmap type, with axes label reversed
  reverseYAxis(heatMapType, yArray) {
      if (heatMapType !== "individualStudent") {
          try {
              return yArray.map(x => x).reverse();
          }
          catch (err) {
              console.log(err);
          }
      }
      else {
          return this.state.yArrayStudents.map(x=>x).reverse();
      }

  }

  render() {
    const data = this.props.data;
    const dataLength = data.length;
    const heatMapType = this.props.heatMapType;
    const yArray = this.setYArrayRange(data);
    console.log(yArray);

    return (
      <XYPlot
        width={this.scaleWidth(heatMapType, dataLength)}
        height={this.scaleHeight(heatMapType)}
        margin={{top: 30}}
        xType="ordinal"
        yType={this.axisType(heatMapType)}
        yDomain={this.reverseYAxis(heatMapType, yArray)}
        >
        <XAxis orientation='top'/>
        <YAxis orientation='left'/>

        <HeatmapSeries
            className="heatmap-series-example"
            colorRange = {this.colorRange(data, heatMapType)}
              data={data}
              style={{
                stroke: 'black',
                strokeWidth: '1px',
                rectStyle: {
                  rx: 1,
                  ry: 1
                }
              }} />

      </XYPlot>
    );
  };
}

export default Heatmap
