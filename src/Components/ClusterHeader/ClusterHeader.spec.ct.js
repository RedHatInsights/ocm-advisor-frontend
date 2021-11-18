import React from 'react';
import { mount } from '@cypress/react';

import { Intl } from '../../Utilities/intlHelper';
import { ClusterHeader } from './ClusterHeader';

describe('cluster page header', () => {
  // selectors
  const HEADER_TITLE = '#cluster-header-title';
  const UUID_FIELD = '#cluster-header-uuid > :nth-child(2)';
  const LAST_SEEN_FIELD = '#cluster-header-last-seen > :nth-child(2)';
  let props;

  beforeEach(() => {
    props = {
      clusterId: 'foobar',
      displayName: {
        isError: false,
        isUninitialized: false,
        isLoading: false,
        isFetching: false,
        isSuccess: true,
        data: 'Cluster with issues',
      },
      lastSeen: '2021-07-24T14:22:36.109Z',
    };
  });
  it('cluster page header with the display name available', () => {
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    // check title
    cy.get(HEADER_TITLE).should('have.text', 'Cluster with issues');
    // check uuid text
    cy.get(UUID_FIELD).should('have.text', 'foobar');
    // check last seen text
    cy.get(LAST_SEEN_FIELD).should('have.text', '2021-07-24T14:22:36.109Z');
  });
  it('show spinner when in the loading state', () => {
    props = {
      ...props,
      displayName: {
        ...props.displayName,
        isSuccess: false,
        isLoading: true,
        data: undefined,
      },
    };
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    // check title
    cy.get(HEADER_TITLE).should('have.length', 0);
    cy.get('.ins-c-skeleton').should('have.length', 1);
    // check uuid text
    cy.get(UUID_FIELD).should('have.text', 'foobar');
    // check uuid text
    cy.get(LAST_SEEN_FIELD).should('have.text', '2021-07-24T14:22:36.109Z');
  });
  it('show UUID when display name is unavailable', () => {
    props.displayName.data = undefined;
    mount(
      <Intl>
        <ClusterHeader {...props} />
      </Intl>
    );
    // check title
    cy.get(HEADER_TITLE).should('have.text', 'foobar');
    // check uuid text
    cy.get(UUID_FIELD).should('have.text', 'foobar');
  });
});
