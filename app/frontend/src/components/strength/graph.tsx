import React from 'react';
import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  Resizable,
} from 'react-timeseries-charts';
import { TimeSeries, TimeEvent, TimeRange } from 'pondjs';

const Graph = ({ events, unit }) => {
  const eventSeries = new TimeSeries({
    name: 'raw',
    events: events,
  });

  // Set max axis Y to 10 or the max value
  const maxSerie = parseInt(eventSeries.max());
  const max = maxSerie > 10 ? maxSerie : 10;

  let timerange = eventSeries.timerange();

  // Handle if we don't have data
  if (!timerange) {
    timerange = new TimeRange(0, 1);
  }

  // TODO add a line with the average value

  // TODO add marker to show the value where the mouse is
  // https://github.com/esnet/react-timeseries-charts/blob/master/src/website/packages/charts/examples/wind/Index.js#L90
  return (
    <Resizable>
      <ChartContainer timeRange={timerange}>
        <ChartRow height="250">
          <YAxis
            id="y"
            label={unit}
            min={0}
            max={max}
            width="70"
            type="linear"
          />
          <Charts>
            <LineChart axis="y" series={eventSeries} />
          </Charts>
        </ChartRow>
      </ChartContainer>
    </Resizable>
  );
};

export default Graph;
