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

import CoachData from '../components/strength/coach_data';
import CoachCommand from '../components/strength/coach_command';

const StrengthPage = ({}) => {
  const [climberStatus, setClimberStatus] = useState(false);

  return (
    <EuiPage restrictWidth>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiPageHeaderSection>
            <EuiTitle size="l">
              <h1>Strength training</h1>
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

export default StrengthPage;
