import React, { useState } from 'react';
import { EuiButtonEmpty } from '@elastic/eui';
import { GoogleApiConsumer } from '@lourd/react-google-api';
import { AppName } from '../../settings'

// Example values, for headers and values
// ['time', 'num_pullups', 'speed', 'max_speed'];
// ["31/12/2020 20:00:00", "2.33", "=1+1+1", "4"]
const GoogleSheetInsertData = ({ api, sheet, headers, values }) => {
  const [lastValues, setLastValues] = useState([]);
  const [exported, setExported] = useState(false);

  const file_name = `${AppName} climbing`

  if (!api.client || !api.signedIn) {
    return (
      <EuiButtonEmpty iconType="logoGoogleG" isDisabled>
        Export sheet
      </EuiButtonEmpty>
    );
  }

  async function insertData() {
    const request = {
      properties: {
        title: file_name,
        locale: 'en_GB', // To use dot format for numbers and DD/MM/YYYY for dates
      },
      sheets: [
        {
          properties: {
            title: 'Strength',
          },
        },
        {
          properties: {
            title: 'Speed',
          },
        },
      ]
    };

    // Enough range for any headers
    const headers_range = `${sheet}!A1:Z1`;

    // Look for an already created file
    const files = await api.client.drive.files.list({
      q: `name='${file_name}' and trashed = false`,
      orderBy: 'modifiedTime',
    });

    // Get the file id, from the search or create one
    let file_id = 0;
    if (files.result.files.length > 0) {
      file_id = files.result.files[0].id;
      //const file = await api.client.sheets.spreadsheets.get({spreadsheetId: file_id})
    } else {
      // TODO show a message to the user with the link of the created file
      // https://elastic.github.io/eui/#/display/toast
      const file = await api.client.sheets.spreadsheets.create(request);
      file_id = file.result.spreadsheetId;
    }

    // Check if the sheet have the headers
    const header = await api.client.sheets.spreadsheets.values.get({
      spreadsheetId: file_id,
      range: headers_range,
    });

    // Add headers if we don't have data in the sheet
    if (!header.result.values) {
      await api.client.sheets.spreadsheets.values.append({
        spreadsheetId: file_id,
        range: headers_range,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [headers],
        },
      });
    }

    // Append values
    await api.client.sheets.spreadsheets.values.append({
      spreadsheetId: file_id,
      range: headers_range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [values],
      },
    });

    setExported(true);
    setLastValues(values);
  }

  const newValues = values !== lastValues;

  // TODO don't rerender the icon, useMemo
  const ExportButton = () => {
    if (newValues && !exported) {
      return (
        <EuiButtonEmpty iconType="logoGoogleG" onClick={insertData}>
          Export sheet
        </EuiButtonEmpty>
      );
    }

    return (
      <EuiButtonEmpty iconType="logoGoogleG" isDisabled>
        Exported
      </EuiButtonEmpty>
    );
  };

  // TODO: handle errors, return error if has one
  return <ExportButton />;
};

const GoogleSheet = props => {
  return (
    <GoogleApiConsumer>
      {api => <GoogleSheetInsertData api={api} {...props} />}
    </GoogleApiConsumer>
  );
};

export default GoogleSheet;
