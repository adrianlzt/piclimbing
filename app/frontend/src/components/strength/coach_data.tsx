import React, { useState, useEffect } from 'react';
import gql from 'graphql-tag';
import { useSubscription } from '@apollo/react-hooks';
import { EuiButton, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { connect } from 'react-redux';
import { TimeEvent } from 'pondjs';

import DataCard from '../../components/data_card';
import GoogleSheet from '../google/GoogleSheet';
import Download from '@axetroy/react-download';
import moment from 'moment';
import { AppName } from '../../settings';
import loadable from '@loadable/component'

const Graph = loadable(() => import('./graph'))

const mapStateToProps = ({
  name: config_name,
  weight: config_weight,
  google_auto_export: config_google_auto_export,

  strength_extra_weight: config_strength_extra_weight,
  strength_edge_size: config_strength_edge_size,
  strength_expected: config_strength_expected,
  strength_expected_pct: config_strength_expected_pct,
}) => {
  return {
    config_name,
    config_weight,
    config_google_auto_export,

    config_strength_extra_weight,
    config_strength_edge_size,
    config_strength_expected,
    config_strength_expected_pct,
  };
};

const View = ({
  climberStatus,
  data,
  config_name,
  config_weight,
  config_google_auto_export,
  config_strength_extra_weight,
  config_strength_edge_size,
  config_strength_expected,
  config_strength_expected_pct,
}) => {
  const [strengthValues, setStrengthValues] = useState([]);
  const [status, setStatus] = useState(false);
  const [time, setTime] = useState(0);
  const [strength, setStrength] = useState(0);
  const [avg_strength, setAvgStrength] = useState(0);
  const [max_strength, setMaxStrength] = useState(0);
  const [fti, setFti] = useState(0);
  const [rfd, setRfd] = useState(0);
  const [strengthLoss, setStrengthLoss] = useState(0);

  // TODO max_strength and MVC is the same? Currently MVC is max_strength/body_weight
  // TODO do not reset values if we are moving between screens?

  // Reset the value array when moving from paused to start
  if (climberStatus && !status) {
    setStatus(true);
    setTime(0);
    setStrengthValues([]);
    setFti(0);
    setRfd(0);
    setStrength(0);
    setAvgStrength(0);
    setMaxStrength(0);
    setStrengthLoss(0);
  } else if (!climberStatus && status) {
    setStatus(false);
  }

  // TODO selector to change to Newtons
  const unit = 'kg';

  if (data) {
    // Generate an event for the graph for each new strength value
    if (data.strength.strength) {
      const t = new Date();
      const event = new TimeEvent(t, data.strength.strength);
      strengthValues.push(event);

      if (data.strength.strength !== strength) {
        setStrength(data.strength.strength);
      }
    }

    if (data.strength.time && data.strength.time !== time) {
      setTime(data.strength.time);
    }

    if (
      data.strength.max_strength &&
      data.strength.max_strength !== max_strength
    ) {
      setMaxStrength(data.strength.max_strength);
    }

    if (
      data.strength.avg_strength &&
      data.strength.avg_strength !== avg_strength
    ) {
      setAvgStrength(data.strength.avg_strength);
    }

    if (data.strength.fti && data.strength.fti !== fti) {
      setFti(data.strength.fti);
    }

    if (data.strength.rfd && data.strength.rfd !== rfd) {
      setRfd(data.strength.rfd);
    }

    if (
      data.strength.strength_loss &&
      data.strength.strength_loss !== strengthLoss
    ) {
      setStrengthLoss(data.strength.strength_loss);
    }
  }

  //let duty_cycle = this.props.data.strength.duty_cycle
  const mvc = max_strength / config_weight;
  const fti_normalized = fti / config_weight;
  const rfd_normalized = rfd / config_weight;

  // TODO put the name of the app in the export file
  const export_file = `${AppName}_strength_${moment().format(
    'YYYY-MM-DD_HH:mm:ss'
  )}.csv`;

  // TODO generate csv from the sheetHeaders and sheetValues arrays
  // prettier-ignore
  const export_data = `date,body_weight,edge_size,time,max_strength,average_strength,expected_strength,strength_loss,MVC,FTI,RFD
${moment().format('YYYY/MM/DD HH:mm')},${config_weight},${config_strength_edge_size},${time.toFixed(3)},${max_strength.toFixed(2)},${avg_strength.toFixed(2)},${config_strength_expected},${strengthLoss.toFixed(1)},${mvc.toFixed(2)},${fti_normalized.toFixed(2)},${rfd_normalized.toFixed(2)}
`;

  // TODO homogenize columns between speed and strength
  const sheetHeaders = [
    'date',
    'body_weight',
    'edge_size',
    'time',
    'max_strength',
    'average_strength',
    'expected_strength',
    'strength_loss',
    'MVC',
    'FTI',
    'RFD',
  ];
  const sheetValues = [
    moment().format('DD/MM/YYYY HH:mm:ss'),
    config_weight,
    config_strength_edge_size,
    time.toFixed(3),
    max_strength.toFixed(2),
    avg_strength.toFixed(2),
    config_strength_expected,
    strengthLoss.toFixed(2),
    mvc.toFixed(2),
    fti_normalized.toFixed(2),
    rfd_normalized.toFixed(2),
  ];

  // TODO how to put the export button to be less anoying?
  // I like in the top bar, but data is not there
  //
  // TODO: implement auto export, with the configuration setting

  // TODO show somehow that we are actually doing the exercise, the backend has crossed the threshold and sending calculated values
  return (
    <>
      <EuiFlexGroup>
        <GoogleSheet
          sheet="Strength"
          headers={sheetHeaders}
          values={sheetValues}
        />
        <Download file={export_file} content={export_data}>
          <EuiButtonEmpty iconType="exportAction">Export</EuiButtonEmpty>
        </Download>
      </EuiFlexGroup>
      <EuiFlexGroup wrap gutterSize="l">
        <DataCard
          title="Time"
          description="Time elapsed doing strength"
          value={time.toFixed(3)}
        />
        <DataCard
          title="Strength"
          description="Current strength value"
          value={strength.toFixed(1)}
          ok={
            strength >=
              config_strength_expected *
                ((100 - config_strength_expected_pct) / 100) &&
            strength <
              config_strength_expected *
                ((100 + config_strength_expected_pct) / 100)
          }
        />
        <DataCard
          title="Max strength"
          description="Max strength value in this set"
          value={max_strength.toFixed(1)}
        />
        <DataCard
          title="Avg strength"
          description="Average strength value in this set"
          value={avg_strength.toFixed(1)}
        />
        <DataCard
          title="Strength loss"
          description="Percentage (0-100) of strength loss, min force of the set divided by max force"
          value={strengthLoss.toFixed(0)}
        />
        {/*<DataCard title="Duty cycle (%)" value={duty_cycle} />*/}
        <DataCard
          title="MVC"
          description="Maximal voluntary contraction, normalized with body weight (Newtons/kg)"
          value={mvc.toFixed(2)}
        />
        <DataCard
          title="FTI"
          description="Force-time integral, normalized with body weight (Newtons*second/kg)"
          value={fti_normalized.toFixed(2)}
        />
        <DataCard
          title="RFD"
          description="Rate of force development, normalized with body weight (Units??)"
          value={rfd_normalized.toFixed(2)}
        />
      </EuiFlexGroup>
      <EuiFlexGroup
        style={{
          marginTop: '20px',
        }}>
        <EuiFlexItem>
          <Graph events={strengthValues} unit={unit} />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

const ConnectedView = connect(mapStateToProps)(View);

const COACH_SUBSCRIPTION = gql`
  subscription {
    strength {
      time
      strength
      max_strength
      avg_strength
      rfd
      fti
      strength_loss
      duty_cycle
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
