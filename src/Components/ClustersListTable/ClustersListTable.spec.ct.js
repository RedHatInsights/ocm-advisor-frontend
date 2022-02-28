import React from 'react';
import { mount } from '@cypress/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { Intl } from '../../Utilities/intlHelper';
import getStore from '../../Store';
import { ClustersListTable } from './ClustersListTable';
import props from '../../../cypress/fixtures/ClustersListTable/data.json';
import '@patternfly/patternfly/patternfly.scss';

describe('clusters list table', () => {
  const CLUSTERS_LIST_TABLE = 'div[id=clusters-list-table]';
  const TBODY = 'tbody[role=rowgroup]';
  const CHIP_GROUP = '.pf-c-chip-group__main';
  const TOOLBAR_FILTER = '.ins-c-primary-toolbar__filter';
  const PAGINATION = '.pf-c-pagination';

  Cypress.Commands.add('getTotalClusters', () =>
    cy.get('.pf-c-options-menu__toggle-text').find('b').eq(1)
  );
  Cypress.Commands.add('getFirstRow', () => cy.get(TBODY).children().eq(0));
  Cypress.Commands.add('getLastRow', () => cy.get(TBODY).children().eq(28));

  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/clusters']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: props,
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders table', () => {
    cy.get(CLUSTERS_LIST_TABLE).should('have.length', 1);
  });

  it('shows 29 clusters as a total number', () => {
    cy.getTotalClusters().should('have.text', 29);
  });

  it('pagination default is set to 20', () => {
    cy.get(TBODY).children().should('have.length', 20);
    cy.get('.pf-c-options-menu__toggle-text')
      .find('b')
      .eq(0)
      .should('have.text', '1 - 20');
  });

  it('applies one total risk filter as a default', () => {
    cy.get(CHIP_GROUP)
      .find('.pf-c-chip-group__label')
      .should('have.text', 'Total risk');
    cy.get(CHIP_GROUP)
      .find('.pf-c-chip__text')
      .should('have.length', 1)
      .should('have.text', 'All clusters');
  });

  it('can filter out only hitting clusters', () => {
    // initially there are 29 clusters
    cy.getTotalClusters().should('have.text', 29);
    // open filter toolbar
    cy.get('.ins-c-primary-toolbar__filter button').click();
    //change the filter toolbar item
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    // remove "All clusters" filter value
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    // open pagination
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu__toggle-button')
      .click({ force: true });
    // set to 50 clusters per page
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu')
      .find('li')
      .eq(2)
      .find('button')
      .click({ force: true });
    cy.getTotalClusters().should('have.text', 26);
    // check all shown clusters have recommendations > 0
    cy.get('TBODY')
      .find('td[data-label=Recommendations]')
      .each((r) => {
        cy.wrap(r).should('not.have.value', 0);
      });
  });

  it('can filter clusters by the total risk critical', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(1)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(2).click();
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 1);
    cy.get('.pf-c-table__sort').eq(2).click();
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 4);
  });

  it('can filter clusters by the total risk Important', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(2)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(3).click();
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 1);
    cy.get('.pf-c-table__sort').eq(3).click();
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 9);
  });

  it('can filter clusters by the total risk Moderate', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(3)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(4).click();
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 3);
    cy.get('.pf-c-table__sort').eq(4).click();
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 19);
  });

  it('can filter clusters by the total risk Low', () => {
    cy.get('.ins-c-primary-toolbar__filter button').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-dropdown__menu')
      .find('li')
      .eq(1)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER).find('.pf-c-select__toggle').click();
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(0)
      .click({ force: true });
    cy.get(TOOLBAR_FILTER)
      .find('.pf-c-select__menu')
      .find('input')
      .eq(4)
      .click({ force: true });
    cy.get('.pf-c-table__sort').eq(5).click();
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 1);
    cy.get('.pf-c-table__sort').eq(5).click();
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 14);
  });

  it('can filter by name', () => {
    // search by "cc" search input
    cy.get(TOOLBAR_FILTER).find('.pf-c-form-control').type('cc');
    // should be 4 clusters left
    cy.get(TBODY)
      .children()
      .should('have.length', 4)
      .each((r) => {
        cy.wrap(r).contains('cc');
      });
  });

  it('can sort by columns', () => {
    // check initial state
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .should('have.text', 'gvgubed6h jzcmr99ojh');
    // click on the Name sorting button
    cy.get('.pf-c-table__sort').eq(0).click();
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .should('have.text', '1ghhxwjfoi 5b5hbyv07');
    // click on the Recommendations sorting button
    cy.get('.pf-c-table__sort').eq(1).click();
    // the first cluster has 0 recommendations
    cy.getFirstRow()
      .find('td[data-label=Recommendations]')
      .should('have.text', 0);
  });

  it('some rows have cluster names instead uuids', () => {
    /* the cluster with uuid "fc603601-0ff8-45e4-b0f3-c7f76d2ef36b"
       has a display name "gsbq8pthf xah3olxhz" */
    cy.get(TBODY)
      .children()
      .eq(4)
      .find('td[data-label=Name]')
      .should('have.text', '5uq3oy111 ufq7fnxcd');
  });

  it('names of rows are links', () => {
    cy.getFirstRow()
      .find('td[data-label=Name]')
      .find('a[href="/clusters/e488c993-821c-4915-bd08-5a51ed7aa3a2"]')
      .should('have.text', 'gvgubed6h jzcmr99ojh');
  });

  it('sorts N/A in last seen correctly', () => {
    cy.get('.pf-c-table__sort').eq(6).click();
    cy.getFirstRow().find('span').should('have.text', 'N/A');
    cy.get('.pf-c-table__sort').eq(6).click();
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu__toggle-button')
      .click({ force: true });
    cy.get(PAGINATION)
      .eq(0)
      .find('.pf-c-options-menu')
      .find('li')
      .eq(2)
      .find('button')
      .click({ force: true });
    cy.getLastRow().find('span').should('have.text', 'N/A');
  });

  it('shows correct amount of each type of the rule hits', () => {
    cy.getFirstRow().find('td[data-label=Critical]').should('have.text', 4);
    cy.getFirstRow().find('td[data-label=Important]').should('have.text', 9);
    cy.getFirstRow().find('td[data-label=Moderate]').should('have.text', 16);
    cy.getFirstRow().find('td[data-label=Low]').should('have.text', 8);
  });
});

describe('cluster list Empty state rendering', () => {
  beforeEach(() => {
    mount(
      <MemoryRouter initialEntries={['/clusters']} initialIndex={0}>
        <Intl>
          <Provider store={getStore()}>
            <ClustersListTable
              query={{
                isError: false,
                isFetching: false,
                isUninitialized: false,
                isSuccess: true,
                data: [],
              }}
            />
          </Provider>
        </Intl>
      </MemoryRouter>
    );
  });

  it('renders the Empty State component', () => {
    cy.get('div[class=pf-c-empty-state__content]')
      .should('have.length', 1)
      .find('h2')
      .should('have.text', 'No clusters yet');
    cy.get('div[class=pf-c-empty-state__body]').should(
      'have.text',
      'To get started, create or register your cluster to get recommendations from Insights Advisor.'
    );
    cy.get('div[class=pf-c-empty-state__content]')
      .children()
      .eq(3)
      .should('have.text', 'Create cluster');
    cy.get('div[class=pf-c-empty-state__secondary]')
      .children()
      .eq(0)
      .should('have.text', 'Register cluster');
    cy.get('div[class=pf-c-empty-state__secondary]')
      .children()
      .eq(1)
      .should('have.text', 'Assisted Installer clusters');
  });
});
