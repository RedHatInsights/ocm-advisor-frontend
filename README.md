[![Build Status](https://app.travis-ci.com/RedHatInsights/ocp-advisor-frontend.svg?branch=master)](https://app.travis-ci.com/RedHatInsights/ocp-advisor-frontend)

# OCP Advisor Frontend

## Running locally

1. `npm install`

2. Check whether `env` in the `dev.webpack.config.js` is set to the preferred chrome + API environment.

3. `npm run start:beta`

4. Open https://prod.foo.redhat.com:1337/beta/openshifts/insights/advisor (or whatever environment is specified). Please, make sure that OCP Advisor is temporarily not available under **non-beta** environments.

### Using insights-results-aggregator-mock

You can use the mocked version of Insights Results Aggregator (or Smart Proxy) API.

1. Clone https://github.com/RedHatInsights/insights-results-aggregator-mock.

2. Follow "How to build the service" and "How to start the service."

3. Once having IRA-mock server running locally, run the OCP Advisor with `npm run start:beta:mock`.

## Environments (local)

- https://ci.foo.redhat.com:1337/beta/openshift/insights/advisor
- https://qa.foo.redhat.com:1337/beta/openshift/insights/advisor
- https://stage.foo.redhat.com:1337/beta/openshift/insights/advisor
- https://prod.foo.redhat.com:1337/beta/openshift/insights/advisor

### Testing

- Run `npm run test` to execute unit-test suite (Jest + Cypress component testing).
- Run `npx cypress open-ct` to open Cypress in component tesing mode.

## Deploying

- The starter repo uses Travis to deploy the webpack build to another Github repo defined in `.travis.yml`
  - That Github repo has the following branches:
    - `ci-beta` (deployed by pushing to `master` or `main` on this repo)
    - `ci-stable` (deployed by pushing to `ci-stable` on this repo)
    - `qa-beta` (deployed by pushing to `qa-beta` on this repo)
    - `qa-stable` (deployed by pushing to `qa-stable` on this repo)
    - `prod-beta` (deployed by pushing to `prod-beta` on this repo)
    - `prod-stable` (deployed by pushing to `prod-stable` on this repo)
- Travis uploads results to RedHatInsight's [codecov](https://codecov.io) account. To change the account, modify CODECOV_TOKEN on https://travis-ci.com/.

## Recommendation ID examples

- `ccx_rules_ocp.external.rules.nodes_requirements_check|NODES_MINIMUM_REQUIREMENTS_NOT_MET`
- `ccx_rules_ocp.external.rules.vsphere_upi_machine_is_in_phase|VSPHERE_UPI_MACHINE_WITH_NO_RUNNING_PHASE`
- `ccx_rules_ocp.external.rules.machineconfig_stuck_by_node_taints|NODE_HAS_TAINTS_APPLIED`
- `ccx_rules_ocp.external.rules.ocp_version_end_of_life|OCP4X_EOL_APPROACHING`
- `ccx_rules_ocp.external.rules.ocp_version_end_of_life|OCP4X_BEYOND_EOL`
