import React, { useState } from 'react';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';
import { EuiButtonEmpty, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { connect } from 'react-redux';
import { TimeEvent } from 'pondjs';

import GoogleSheet from '../google/GoogleSheet';
import DataCard from '../../components/data_card';
import Download from '@axetroy/react-download';
import moment from 'moment';
import { AppName } from '../../settings';

import loadable from '@loadable/component'

const Graph = loadable(() => import('./graph'))


const mapStateToProps = ({
  name: config_name,
  weight: config_weight,
  google_auto_export: config_google_auto_export,

  speed_extra_weight: config_speed_extra_weight,
  speed_loss: config_speed_loss,
  speed_onerm: config_speed_onerm,
}) => {
  return {
    config_name,
    config_weight,
    config_google_auto_export,

    config_speed_extra_weight,
    config_speed_loss,
    config_speed_onerm,
  };
};

const View = ({
  climberStatus,
  data,
  config_name,
  config_weight,
  config_google_auto_export,
  config_speed_extra_weight,
  config_speed_loss,
  config_speed_onerm,
}) => {
  const [speedEvents, setSpeedEvents] = useState([]);
  const [positionEvents, setPositionEvents] = useState([]);
  // Identifiers start on 0
  const [id, setId] = useState(-1);
  const [status, setStatus] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [position, setPosition] = useState(0);
  const [pullups, setPullups] = useState(0);
  const [max_speed, setMaxSpeed] = useState(0);
  const [lastSpeed, setLastSpeed] = useState(0);
  const [lastSpeedValues, setLastSpeedValues] = useState([]);
  const [speedLoss, setSpeedLoss] = useState(0);
  // TODO add average speed?

  // Reset the value array when moving from paused to start
  if (climberStatus && !status) {
    setStatus(true);
    setSpeedEvents([]);
    setPositionEvents([]);
    setSpeed(0);
    setMaxSpeed(0);
    setSpeedLoss(0);
    setPosition(0);
    setPullups(0);
    setLastSpeed(0);
    setLastSpeedValues([]);
  } else if (!climberStatus && status) {
    setStatus(false);
  }

  // TODO parametrize 1-RM
  // TODO Create a page to measure 1RM?
  // TODO where can be used? Panel with how close we are to the 1RM?
  const onerm = 1;

  // Skip if we have already seen that data
  if (data && data.speed.Id !== id) {
    setId(data.speed.Id);

    // Generate an event for the graph for each new speed value
    if (data.speed.speed) {
      const t = new Date();
      const eventSpeed = new TimeEvent(t, data.speed.speed);
      speedEvents.push(eventSpeed);

      if (data.speed.speed !== speed) {
        setSpeed(data.speed.speed);
      }
    }

    if (data.speed.position) {
      const t = new Date();
      const eventPosition = new TimeEvent(t, data.speed.position);
      positionEvents.push(eventPosition);

      if (data.speed.position !== position) {
        setPosition(data.speed.position);
      }
    }

    if (data.speed.max_speed && data.speed.max_speed !== max_speed) {
      setMaxSpeed(data.speed.max_speed);
    }

    if (data.speed.pull_ups && data.speed.pull_ups !== pullups) {
      setPullups(data.speed.pull_ups);
      // For each new pullup, store the speed for that one
      if (data.speed.pull_ups !== 0) {
        setLastSpeedValues([...lastSpeedValues, data.speed.last_speed]);
      }
    }

    if (data.speed.speed_loss && data.speed.speed_loss !== speedLoss) {
      setSpeedLoss(data.speed.speed_loss);
    }
  }

  // TODO put the name of the app in the export file
  const export_file = `${AppName}_speed_${moment().format(
    'YYYY-MM-DD_HH:mm:ss'
  )}.csv`;

  // prettier-ignore
  const export_data = `date,body_weight,pullups,extra_weight,max_speed,speed_loss,${lastSpeedValues.map((v,i) => 'speed_pullup_'+i)}
${moment().format('YYYY/MM/DD HH:mm')},${config_weight},${config_speed_extra_weight},${pullups.toFixed(0)},${max_speed.toFixed(2)},${speedLoss.toFixed(2)},${lastSpeedValues.map((v,_) => v.toFixed(2))}
`;

  const sheetHeaders = [
    'date',
    'body_weight',
    'pullups',
    'extra_weight',
    'max_speed',
    'speed_loss',
    ...Array(50).fill(1).map( (_,i) => `speed_pullup_${i+1}` ),
  ];
  const sheetValues = [
    moment().format('DD/MM/YYYY HH:mm:ss'),
    config_weight,
    pullups.toFixed(0),
    config_speed_extra_weight,
    max_speed.toFixed(2),
    speedLoss.toFixed(2),
    ...lastSpeedValues.map((v,_) => v.toFixed(2)),
  ];

  // TODO how to put the export button to be less anoying?
  // I like in the top bar, but data is not there. Use redux?
  //
  // TODO: implement auto export, with the configuration setting

  // TODO mark the speed panel red if the speed loss is lower than a predefined threshold
  //
  // TODO create a setting to automatically export data after the end of an exercise

  return (
    <>
      <EuiFlexGroup wrap>
        <GoogleSheet
          sheet="Speed"
          headers={sheetHeaders}
          values={sheetValues}
        />
        <Download file={export_file} content={export_data}>
          <EuiButtonEmpty iconType="exportAction">Export file</EuiButtonEmpty>
        </Download>
      </EuiFlexGroup>
      <EuiFlexGroup wrap gutterSize="l">
        <DataCard
          title="Speed"
          description="Current speed value"
          value={speed.toFixed(2)}
        />
        {/*
        <DataCard
          title="Position"
          description="Current position value"
          value={position.toFixed(2)}
        />
          */}
        <DataCard
          title="Max speed"
          description="Max speed value in this set"
          value={max_speed.toFixed(2)}
        />
        <DataCard
          title="Pull-Ups"
          description="Numer the pull-ups clompleted in this set"
          value={pullups.toFixed(0)}
        />
        <DataCard
          title="Speed loss"
          description="Percentage (0-100) of speed loss, last speed divided by max speed"
          value={(100 * speedLoss).toFixed(0)}
          critical={100*speedLoss > config_speed_loss}
        />
      </EuiFlexGroup>
      <EuiFlexGroup wrap gutterSize="l">
        {/* TODO show pct speed loss in each card */}
        {lastSpeedValues.map((v, i) => (
          <DataCard
            title={`Speed pullup ${i + 1}`}
            description="Speed of each of the pullups"
            value={v.toFixed(2)}
          />
        ))}
      </EuiFlexGroup>
      <EuiFlexGroup
        style={{
          marginTop: '20px',
        }}>
        <EuiFlexItem>
          <Graph speedEvents={speedEvents} positionEvents={positionEvents} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

const ConnectedView = connect(mapStateToProps)(View);

const COACH_SUBSCRIPTION = gql`
  subscription {
    speed {
      Id
      position
      speed
      pull_ups
      speed_loss
      last_speed
      max_speed
    }
  }
`;

const CoachData = ({ climberStatus }) => {
  const { data, error, loading } = useSubscription(COACH_SUBSCRIPTION);

  if (loading) {
    console.log('USE Coach subscription loading');
    //return <p>Press start...</p>;
  }

  if (error) {
    // TODO show a toast message https://elastic.github.io/eui/#/display/toast
    console.log('USE Coach subscription error', error);
    return <p>Error: {error.message}</p>;
  }

  return <ConnectedView climberStatus={climberStatus} data={data} />;
};

export default CoachData;
