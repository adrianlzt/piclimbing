import React from 'react';
import { EuiText, EuiCard, EuiFlexItem, EuiToolTip } from '@elastic/eui';

const cardStyle = { minWidth: 200 };

const Card = ({ title, description, value, critical, ok }) => {
  let backgroundColor = '#fbfcfd';
  if (critical) {
    backgroundColor = 'rgba(189, 39, 30, 0.6);';  // red
  } else if (ok) {
    backgroundColor = 'rgba(116, 202, 52, 0.67)'; // green
  }

  return (
    <EuiFlexItem style={cardStyle}>
      <EuiToolTip position="top" content={description}>
        <EuiCard
          textAlign="center"
          title={title}
          description=""
          style={{ backgroundColor: backgroundColor }}>
          <EuiText size="m">
            <h1>{value}</h1>
          </EuiText>
        </EuiCard>
      </EuiToolTip>
    </EuiFlexItem>
  );
};

export default Card;
