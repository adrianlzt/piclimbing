import React, { Children, isValidElement, cloneElement } from 'react';
import throttle from 'lodash.throttle';

import { ApolloProvider } from 'react-apollo';
import { Provider } from 'react-redux';
import createStore from '../../state/createStore';

import {
  EuiButton,
  // @ts-ignore
  EuiHeader,
  // @ts-ignore
  EuiHeaderSection,
  // @ts-ignore
  EuiHeaderSectionItem,
  // @ts-ignore
  EuiHeaderSectionItemButton,
  // @ts-ignore
  EuiListGroupItem,
  EuiHeaderLogo,
  EuiIcon,
  // @ts-ignore
  EuiNavDrawerGroup,
  // @ts-ignore
  EuiNavDrawer,
} from '@elastic/eui';

import { Link } from '@reach/router';
import { GoogleApi } from '@lourd/react-google-api';
import 'regenerator-runtime/runtime';
import { loadState, saveState } from '../../state/localStorage';
import { client } from './client'
require('../../themes/theme_light.scss');

export default class Chrome extends React.Component<any, any> {
  navDrawerRef: any;
  persistedState = loadState();
  store = createStore(this.persistedState);

  componentDidMount() {
    this.store.subscribe(
      throttle(() => {
        saveState(this.store.getState());
      }, 1000)
    );
  }

  constructor(props: any) {
    super(props);
    this.state = {};
  }

  renderLogo() {
    return (
      <Link to="/">
        <EuiHeaderLogo iconType="/icons/logo.svg" aria-label="Home" />
      </Link>
    );
  }

  renderMenuTrigger() {
    return (
      <EuiHeaderSectionItemButton
        aria-label="Open nav"
        onClick={() => this.navDrawerRef.toggleOpen()}>
        <EuiIcon type="apps" href="#" size="m" />
      </EuiHeaderSectionItemButton>
    );
  }

  setNavDrawerRef = (ref: any) => (this.navDrawerRef = ref);

  // TODO move the export button to the app bar?
  // Use context to "send" values from the child to here to generate the file?
  // TODO logout button not working
  render() {
    return (
      <Provider store={this.store}>
        <ApolloProvider client={client}>
          <GoogleApi
            scopes={['https://www.googleapis.com/auth/spreadsheets.readonly']}
            discoveryDocs={[
              'https://sheets.googleapis.com/$discovery/rest?version=v4',
              'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
            ]}
            clientId={process.env.GOOGLE_CLIENT_ID}
            apiKey={process.env.GOOGLE_API_KEY}>
            {({ authorize, loading: apiLoading, signout, signedIn, error }) => (
              <div>
                <EuiHeader className="chrHeader">
                  <EuiHeaderSection grow={false}>
                    <EuiHeaderSectionItem border="right">
                      {this.renderLogo()}
                    </EuiHeaderSectionItem>
                  </EuiHeaderSection>

                  <EuiHeaderSection side="right">
                    <EuiHeaderSectionItem className="chrHeader__themeSection">
                      {apiLoading ? (
                        <EuiButton
                          color="primary"
                          isDisabled
                          iconType="logoGoogleG">
                          loading...
                        </EuiButton>
                      ) : error ? (
                        <pre>{JSON.stringify(error, null, 2)}</pre>
                      ) : signedIn ? (
                        <EuiButton
                          color="primary"
                          onClick={authorize}
                          iconType="logoGoogleG">
                          LogOut
                        </EuiButton>
                      ) : (
                        <EuiButton
                          color="primary"
                          onClick={authorize}
                          iconType="logoGoogleG">
                          Authorize
                        </EuiButton>
                      )}
                    </EuiHeaderSectionItem>
                  </EuiHeaderSection>
                </EuiHeader>
                <EuiNavDrawer ref={this.setNavDrawerRef}>
                  <EuiNavDrawerGroup>
                    <Link to="strength">
                      <EuiListGroupItem
                        key="strength"
                        className="euiListGroupItem-isClickable"
                        style={{ marginBottom: '8px' }}
                        iconType="apmApp"
                        label="Strength"
                      />
                    </Link>
                    <Link to="speed">
                      <EuiListGroupItem
                        key="speed"
                        className="euiListGroupItem-isClickable"
                        style={{ marginBottom: '8px' }}
                        iconType="recentlyViewedApp"
                        label="Speed"
                      />
                    </Link>
                    <Link to="configuration">
                      <EuiListGroupItem
                        key="configuration"
                        className="euiListGroupItem-isClickable"
                        style={{ marginBottom: '8px' }}
                        iconType="gear"
                        label="Configuration"
                      />
                    </Link>
                  </EuiNavDrawerGroup>
                </EuiNavDrawer>
                <div className="chrWrap">{this.props.children}</div>
              </div>
            )}
          </GoogleApi>
        </ApolloProvider>
      </Provider>
    );
  }
}
