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

const Graph = ({ speedEvents, positionEvents }) => {
  const speedSerie = new TimeSeries({
    name: 'raw',
    events: speedEvents,
  });

  const positionSerie = new TimeSeries({
    name: 'raw',
    events: positionEvents,
  });

  // Set max Y axis
  const maxSpeedSerie = parseFloat(speedSerie.max());
  const max_speed = maxSpeedSerie > 0.5 ? maxSpeedSerie : 0.5;

  const maxPositionSerie = parseFloat(positionSerie.max());
  const max_position = maxPositionSerie > 0.5 ? maxPositionSerie : 0.5;

  let timerange = speedSerie.timerange();

  // Handle if we don't have data
  if (!timerange) {
    timerange = new TimeRange(0, 1);
  }

  // TODO add marker to show the value where the mouse is
  // https://github.com/esnet/react-timeseries-charts/blob/master/src/website/packages/charts/examples/wind/Index.js#L90
  // Same timerange for both series, assuming we always get speed and position values togheter
  return (
    <>
      <Resizable>
        <ChartContainer timeRange={timerange}>
          <ChartRow height="250">
            <YAxis
              id="y"
              label="m/s"
              min={0}
              max={max_speed}
              width="70"
              type="linear"
              format=",.1f"
            />
            <Charts>
              <LineChart axis="y" series={speedSerie} />
            </Charts>
          </ChartRow>
        </ChartContainer>
      </Resizable>
      <Resizable>
        <ChartContainer timeRange={timerange}>
          <ChartRow height="250">
            <YAxis
              id="y"
              label="m"
              min={0}
              max={max_position}
              width="70"
              type="linear"
              format=",.1f"
            />
            <Charts>
              <LineChart axis="y" series={positionSerie} />
            </Charts>
          </ChartRow>
        </ChartContainer>
      </Resizable>
    </>
  );
};

export default Graph;
