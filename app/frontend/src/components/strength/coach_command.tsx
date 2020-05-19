import React, { useState, useEffect } from 'react';
import { EuiText, EuiButton, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { useMutation, useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { setTimeout } from 'timers';

const CoachCmd = ({ climberStatus, setClimberStatus }) => {
  // TODO parametrize calibrate command. One command for both mutations
  // Allow to define the step of the calibration
  const CALIBRATE_LESS_CMD = gql`
    mutation {
      strengthCommand(params: { command: CALIBRATE, value: -1 }) {
        message
      }
    }
  `;

  const CALIBRATE_PLUS_CMD = gql`
    mutation {
      strengthCommand(params: { command: CALIBRATE, value: 1 }) {
        message
      }
    }
  `;

  const TARE_CMD = gql`
    mutation {
      strengthCommand(params: { command: TARE }) {
        message
      }
    }
  `;

  const PAUSE_CMD = gql`
    mutation {
      strengthCommand(params: { command: PAUSE }) {
        message
      }
    }
  `;

  const RESTART_CMD = gql`
    mutation {
      strengthCommand(params: { command: RESTART }) {
        message
      }
    }
  `;

  const SIMULATE_CMD = gql`
    mutation {
      strengthCommand(params: { command: SIMULATE }) {
        message
      }
    }
  `;

  const STRENGTH_BACKEND_COMMANDS_SUBSCRIPTION = gql`
    subscription {
      strengthBackendCommands {
        command
        value
      }
    }
  `;

  const [restartButton, {}] = useMutation(RESTART_CMD);
  const [pauseButton, {}] = useMutation(PAUSE_CMD);
  const [tareButton, {}] = useMutation(TARE_CMD);
  const [simulateButton, {}] = useMutation(SIMULATE_CMD);
  const [calibratePlusButton, {}] = useMutation(CALIBRATE_PLUS_CMD);
  const [calibrateLessButton, {}] = useMutation(CALIBRATE_LESS_CMD);
  const [lastStop, setLastStop] = useState(0);
  const [startButton, setStartButton] = useState('Start');

  // Give 5" to get ready
  // Start capturing data one sec before, to avoid loosing first measures
  function start() {
    setStartButton('Start ... 5');
    setTimeout(() => {
      setStartButton('Start ... 4');
    }, 1000);
    setTimeout(() => {
      setStartButton('Start ... 3');
    }, 2000);
    setTimeout(() => {
      setStartButton('Start ... 2');
    }, 3000);
    setTimeout(() => {
      setStartButton('Start ... 1');
      restartButton();
      console.log('coach cmd activar climber');
      setClimberStatus(true);
    }, 4000);
    setTimeout(() => {
      setStartButton('Go!');
    }, 5000);
  }

  function pause() {
    // Restart start button status
    setStartButton('Start');
    // Give some space to the right of the graph
    setTimeout(() => {
      console.log('coach cmd desactivar climber');
      pauseButton();
      setClimberStatus(false);
    }, 500);
  }

  function simulate() {
    simulateButton();
  }

  const { data, error, loading } = useSubscription(
    STRENGTH_BACKEND_COMMANDS_SUBSCRIPTION
  );

  if (loading) {
    console.log('USE Coach backend subscription loading');
    //return <p>Press start...</p>;
  }

  // https://reactjs.org/blog/2020/02/26/react-v16.13.0.html#warnings-for-some-updates-during-render
  useEffect(() => {
    // Each new render get the data from the last subscription message
    // Only execute pause() once
    if (
      data &&
      climberStatus &&
      data.strengthBackendCommands.command === 'end' &&
      data.strengthBackendCommands.value !== lastStop
    ) {
      pause();
      setLastStop(data.strengthBackendCommands.value);
    }
  });

  // After useEffect to avoid the problem of having renderer less hooks in the case of an error
  if (error) {
    // TODO show a toast message https://elastic.github.io/eui/#/display/toast
    console.log('USE Coach subscription backend error', error);
    return <p>Error: {error.message}</p>;
  }

  // TODO have only one Calibrate button.
  // Once pressed, show the other buttons (Tare, Calib+, Calib-, End) and start capturing data.
  // Once calibrated, press end to restore to the initial position
  return (
    <>
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiButton color="secondary" fill onClick={() => start()}>
            {startButton}
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton color="danger" onClick={() => pause()}>
            Stop
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton onClick={() => tareButton()}>Tare</EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton onClick={() => calibratePlusButton()}>
            Calibrate +
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton onClick={() => calibrateLessButton()}>
            Calibrate -
          </EuiButton>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiButton color="warning" fill onClick={() => simulate()}>
            Simulate
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};

export default CoachCmd;
