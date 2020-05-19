import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
  EuiFieldNumber,
  EuiCheckbox,
} from '@elastic/eui';
import { EuiForm } from '@elastic/eui';
import { EuiFormRow } from '@elastic/eui';
import { EuiFieldText } from '@elastic/eui';
import { EuiSwitch } from '@elastic/eui';
import { EuiDescribedFormGroup } from '@elastic/eui';
import { EuiText } from '@elastic/eui';

const Name = ({ name, changeName }) => (
  <EuiFormRow label="Name" style={{ marginTop: '16px' }}>
    <EuiFieldText value={name} onChange={changeName} />
  </EuiFormRow>
);
Name.propTypes = {
  name: PropTypes.string.isRequired,
  changeName: PropTypes.func.isRequired,
};

const Weight = ({ weight, changeWeight }) => (
  <EuiFormRow
    label="Weight"
    style={{ marginTop: '16px' }}>
    <EuiFieldNumber value={weight} onChange={changeWeight}
      append={<EuiText>kg</EuiText>}
     />
  </EuiFormRow>
);
Weight.propTypes = {
  weight: PropTypes.number.isRequired,
  changeWeight: PropTypes.func.isRequired,
};

const GoogleAutoExport = ({ google_auto_export, changeGoogleAutoExport }) => (
  <EuiFormRow label="Autoexport" style={{ marginTop: '16px' }} fullWidth>
    <EuiSwitch
      checked={google_auto_export}
      onChange={changeGoogleAutoExport}
      label="Export data to Google Sheets automatically at the end of each exercise"
    />
  </EuiFormRow>
);
GoogleAutoExport.propTypes = {
  google_auto_export: PropTypes.bool.isRequired,
  changeGoogleAutoExport: PropTypes.func.isRequired,
};

// SPEED
const SpeedExtraWeight = ({ speed_extra_weight, changeSpeedExtraWeight }) => (
  <EuiFormRow
    label="Extra weight"
    helpText="Added weight"
    style={{ marginTop: '16px' }}>
    <EuiFieldNumber
      value={speed_extra_weight}
      onChange={changeSpeedExtraWeight}
      append={<EuiText>kg</EuiText>}
    />
  </EuiFormRow>
);
SpeedExtraWeight.propTypes = {
  speed_extra_weight: PropTypes.number.isRequired,
  changeSpeedExtraWeight: PropTypes.func.isRequired,
};

const SpeedLoss = ({ speed_loss, changeSpeedLoss }) => (
  <EuiFormRow
    label="Speed loss"
    helpText="Generate a warning if the speed is reduced by this percentage"
    style={{ marginTop: '16px' }}>
    <EuiFieldNumber
      value={speed_loss}
      onChange={changeSpeedLoss}
      append={<EuiText>%</EuiText>}
    />
  </EuiFormRow>
);
SpeedLoss.propTypes = {
  speed_loss: PropTypes.number.isRequired,
  changeSpeedLoss: PropTypes.func.isRequired,
};

const OneRM = ({ speed_onerm, changeSpeedOneRM}) => (
  <EuiFormRow label="1-RM" style={{ marginTop: '16px' }}
      helpText="Max extra weight for one repetition"
  >
    <EuiFieldNumber value={speed_onerm} onChange={changeSpeedOneRM}
      append={<EuiText>kg</EuiText>}
    />
  </EuiFormRow>
);
OneRM.propTypes = {
  speed_onerm: PropTypes.number.isRequired,
  changeSpeedOneRM: PropTypes.func.isRequired,
};

// Strength
const StrengthExtraWeight = ({
  strength_extra_weight,
  changeStrengthExtraWeight,
}) => (
  <EuiFormRow
    label="Extra weight"
    helpText="Added weight"
    style={{ marginTop: '16px' }}>
    <EuiFieldNumber
      value={strength_extra_weight}
      onChange={changeStrengthExtraWeight}
      append={<EuiText>kg</EuiText>}
    />
  </EuiFormRow>
);
StrengthExtraWeight.propTypes = {
  strength_extra_weight: PropTypes.number.isRequired,
  changeStrengthExtraWeight: PropTypes.func.isRequired,
};

const StrengthEdgeSize = ({ strength_edge_size, changeStrengthEdgeSize }) => (
  <EuiFormRow
    label="Edge size"
    style={{ marginTop: '16px' }}
    helpText="Size of the hold used">
    <EuiFieldNumber
      value={strength_edge_size}
      onChange={changeStrengthEdgeSize}
      append={<EuiText>mm</EuiText>}
    />
  </EuiFormRow>
);
StrengthEdgeSize.propTypes = {
  strength_edge_size: PropTypes.number.isRequired,
  changeStrengthEdgeSize: PropTypes.func.isRequired,
};

const StrengthExpected = ({ strength_expected, changeStrengthExpected}) => (
  <EuiFormRow
    label="Expected force"
    style={{ marginTop: '16px' }}
    helpText="Strength values close to this value will put the card green">
    <EuiFieldNumber
      value={strength_expected}
      onChange={changeStrengthExpected}
      append={<EuiText>kg</EuiText>}
    />
  </EuiFormRow>
);
StrengthExpected.propTypes = {
  strength_expected: PropTypes.number.isRequired,
  changeStrengthExpected: PropTypes.func.isRequired,
};

const StrengthExpectedPct = ({ strength_expected_pct, changeStrengthExpectedPct }) => (
  <EuiFormRow
    label="Expected force margin"
    style={{ marginTop: '16px' }}
    helpText="Margin to consider the strength value to be the expected">
    <EuiFieldNumber
      value={strength_expected_pct}
      onChange={changeStrengthExpectedPct}
      append={<EuiText>%</EuiText>}
    />
  </EuiFormRow>
);
StrengthExpectedPct.propTypes = {
  strength_expected_pct: PropTypes.number.isRequired,
  changeStrengthExpectedPct: PropTypes.func.isRequired,
};

const mapStateToProps = ({
  name,
  weight,
  google_auto_export,

  speed_extra_weight,
  speed_loss,
  speed_onerm,

  strength_extra_weight,
  strength_edge_size,
  strength_expected,
  strength_expected_pct,
}) => {
  return {
    name,
    weight,
    google_auto_export,

    speed_extra_weight,
    speed_loss,
    speed_onerm,

    strength_extra_weight,
    strength_edge_size,
    strength_expected,
    strength_expected_pct,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    changeName: event =>
      dispatch({ type: 'CHANGE_NAME', value: event.target.value }),
    changeWeight: event =>
      dispatch({ type: 'CHANGE_WEIGHT', value: event.target.value }),
    changeGoogleAutoExport: event =>
      dispatch({ type: 'TOGGLE_GOOGLE_AUTO_EXPORT' }),

    // SPEED
    changeSpeedExtraWeight: event =>
      dispatch({ type: 'CHANGE_SPEED_EXTRA_WEIGHT', value: event.target.value }),
    changeSpeedLoss: event =>
      dispatch({ type: 'CHANGE_SPEED_LOSS', value: event.target.value }),
    changeSpeedOneRM: event =>
      dispatch({ type: 'CHANGE_SPEED_ONE_RM', value: event.target.value }),

    // STRENGTH
    changeStrengthExtraWeight: event =>
      dispatch({ type: 'CHANGE_STRENGTH_EXTRA_WEIGHT', value: event.target.value }),
    changeStrengthEdgeSize: event =>
      dispatch({ type: 'CHANGE_STRENGTH_EDGE_SIZE', value: event.target.value }),
    changeStrengthExpected: event =>
      dispatch({ type: 'CHANGE_STRENGTH_EXPECTED', value: event.target.value }),
  };
};

const ConnectedName = connect(mapStateToProps, mapDispatchToProps)(Name);
const ConnectedWeight = connect(mapStateToProps, mapDispatchToProps)(Weight);
const ConnectedGoogleAutoExport = connect(
  mapStateToProps,
  mapDispatchToProps
)(GoogleAutoExport);

const ConnectedOneRM = connect(mapStateToProps, mapDispatchToProps)(OneRM);
const ConnectedSpeedLoss = connect(
  mapStateToProps,
  mapDispatchToProps
)(SpeedLoss);
const ConnectedSpeedExtraWeight = connect(
  mapStateToProps,
  mapDispatchToProps
)(SpeedExtraWeight);

const ConnectedStrengthEdgeSize = connect(
  mapStateToProps,
  mapDispatchToProps
)(StrengthEdgeSize);
const ConnectedStrengthExtraWeight = connect(
  mapStateToProps,
  mapDispatchToProps
)(StrengthExtraWeight);
const ConnectedStrengthExpected = connect(
  mapStateToProps,
  mapDispatchToProps
)(StrengthExpected);
const ConnectedStrengthExpectedPct = connect(
  mapStateToProps,
  mapDispatchToProps
)(StrengthExpectedPct);

const ConfigurationPage = () => {
  return (
    <EuiPage restrictWidth>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Configuration</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>

        <EuiPageContent>
          <EuiPageContentHeader>
            <EuiPageContentHeaderSection>
              <EuiTitle>
                <h2>General</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>

          <EuiForm component="form">
            <ConnectedName />
          </EuiForm>
          <EuiForm component="form">
            <ConnectedWeight />
          </EuiForm>
          <EuiForm component="form">
            <ConnectedGoogleAutoExport />
          </EuiForm>

          <EuiPageContentHeader style={{ marginTop: '40px' }}>
            <EuiPageContentHeaderSection>
              <EuiTitle>
                <h2>Speed</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiForm component="form">
            <ConnectedSpeedExtraWeight />
          </EuiForm>
          <EuiForm component="form">
            <ConnectedOneRM />
          </EuiForm>
          <EuiForm component="form">
            <ConnectedSpeedLoss />
          </EuiForm>

          <EuiPageContentHeader style={{ marginTop: '40px' }}>
            <EuiPageContentHeaderSection>
              <EuiTitle>
                <h2>Strength</h2>
              </EuiTitle>
            </EuiPageContentHeaderSection>
          </EuiPageContentHeader>
          <EuiForm component="form">
            <ConnectedStrengthExtraWeight />
          </EuiForm>
          <EuiForm component="form">
            <ConnectedStrengthEdgeSize />
          </EuiForm>
          <EuiForm component="form">
            <ConnectedStrengthExpected />
          </EuiForm>
          <EuiForm component="form">
            <ConnectedStrengthExpectedPct />
          </EuiForm>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default ConfigurationPage;
