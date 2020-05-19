import React, { useState } from 'react';

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageHeader,
  EuiPageHeaderSection,
  EuiTitle,
} from '@elastic/eui';

import CoachData from '../components/speed/coach_data';
import CoachCommand from '../components/speed/coach_command';

const SpeedPage = () => {
  const [climberStatus, setClimberStatus] = useState(false);

  return (
    <EuiPage restrictWidth>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Speed training</h1>
            </EuiTitle>
          </EuiPageHeaderSection>
        </EuiPageHeader>

        <EuiPageContent>
          <EuiPageContentBody>
            <CoachCommand
              climberStatus={climberStatus}
              setClimberStatus={setClimberStatus}
            />
          </EuiPageContentBody>
        </EuiPageContent>

        <EuiPageContent>
          <EuiPageContentBody>
            <CoachData climberStatus={climberStatus} />
          </EuiPageContentBody>
        </EuiPageContent>
      </EuiPageBody>
    </EuiPage>
  );
};

export default SpeedPage;
