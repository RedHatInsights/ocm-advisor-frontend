import './Recommendation.scss';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
} from '@patternfly/react-core/dist/js/components/Card';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components/PageHeader';
import { Main } from '@redhat-cloud-services/frontend-components/Main';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { Label } from '@patternfly/react-core/dist/js/components/Label/Label';
import { Title } from '@patternfly/react-core/dist/js/components/Title/Title';
import { LabelGroup } from '@patternfly/react-core/dist/js/components/LabelGroup';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import { global_danger_color_100 as globalDangerColor100 } from '@patternfly/react-tokens/dist/js/global_danger_color_100';
import BellSlashIcon from '@patternfly/react-icons/dist/js/icons/bell-slash-icon';
import CaretDownIcon from '@patternfly/react-icons/dist/js/icons/caret-down-icon';
import { addNotification } from '@redhat-cloud-services/frontend-components-notifications/';
import { Button } from '@patternfly/react-core/dist/js/components/Button/Button';
import { Dropdown } from '@patternfly/react-core/dist/js/components/Dropdown/Dropdown';
import { DropdownItem } from '@patternfly/react-core/dist/js/components/Dropdown/DropdownItem';
import { DropdownToggle } from '@patternfly/react-core/dist/js/components/Dropdown/DropdownToggle';
import { Flex } from '@patternfly/react-core/dist/js/layouts/Flex/Flex';
import { FlexItem } from '@patternfly/react-core/dist/js/layouts/Flex/FlexItem';

import Breadcrumbs from '../Breadcrumbs';
import RuleLabels from '../Labels/RuleLabels';
import { FILTER_CATEGORIES, RULE_CATEGORIES } from '../../AppConstants';
import messages from '../../Messages';
import RuleDetails from './RuleDetails';
import Loading from '../Loading/Loading';
import { adjustOCPRule } from '../../Utilities/Rule';
import MessageState from '../MessageState/MessageState';
import AffectedClustersTable from '../AffectedClustersTable';
import { Delete, Post } from '../../Utilities/Api';
import { BASE_URL } from '../../Services/SmartProxy';
import DisableRule from '../Modals/DisableRule';

const Recommendation = ({ rule, ack, match }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const notify = (data) => dispatch(addNotification(data));
  const recId = match.params.recommendationId;
  const [disableRuleModalOpen, setDisableRuleModalOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);

  const {
    isError,
    isUninitialized,
    isLoading,
    isFetching,
    isSuccess,
    data,
    refetch,
  } = rule;

  const {
    data: recAck = {},
    isFetching: recAckIsFetching,
    refetch: recAckRefetch,
  } = ack;

  const content = isSuccess ? adjustOCPRule(data.content, recId) : undefined;

  const afterDisableFn = async () => {
    refetch();
    recAckRefetch();
  };

  const handleModalToggle = (disableRuleModalOpen) => {
    setDisableRuleModalOpen(disableRuleModalOpen);
  };

  const enableRule = async (rule) => {
    try {
      await Delete(`${BASE_URL}/ack/${rule.rule_id}/`);
      notify({
        variant: 'success',
        timeout: true,
        dismissable: true,
        title: intl.formatMessage(messages.recSuccessfullyEnabled),
      });
      refetch();
    } catch (error) {
      handleModalToggle(false);
      notify({
        variant: 'danger',
        dismissable: true,
        title: intl.formatMessage(messages.error),
        description: `${error}`,
      });
    }
  };

  return (
    <React.Fragment>
      {disableRuleModalOpen && (
        <DisableRule
          handleModalToggle={handleModalToggle}
          isModalOpen={disableRuleModalOpen}
          rule={content}
          afterFn={afterDisableFn}
        />
      )}
      <PageHeader className="pageHeaderOverride">
        <Breadcrumbs current={content?.description || recId} />
      </PageHeader>
      {(isUninitialized || isLoading || isFetching) && (
        <Main>
          <Loading />
        </Main>
      )}
      {isError && (
        <Main>
          <MessageState
            title={intl.formatMessage(messages.unableToConnect)}
            text={intl.formatMessage(messages.unableToConnectDesc)}
            icon={ExclamationCircleIcon}
            iconStyle={{ color: globalDangerColor100.value }}
          />
        </Main>
      )}
      {!(isUninitialized || isLoading || isFetching) && isSuccess && (
        <React.Fragment>
          <Main className="pf-m-light pf-u-pt-sm">
            <RuleDetails
              isOpenShift
              isDetailsPage
              rule={content}
              header={
                <React.Fragment>
                  <PageHeaderTitle
                    title={
                      <React.Fragment>
                        {content.description} <RuleLabels rule={content} />
                      </React.Fragment>
                    }
                  />
                  <p>
                    {intl.formatMessage(messages.rulesDetailsPubishdate, {
                      date: (
                        <DateFormat
                          date={new Date(content.publish_date)}
                          type="onlyDate"
                        />
                      ),
                    })}
                    {content.tags &&
                      (Array.isArray(content.tags) ? (
                        <LabelGroup className="categoryLabels" numLabels={1}>
                          {content.tags.reduce((labels, tag) => {
                            if (RULE_CATEGORIES[tag]) {
                              labels.push(
                                <Label key={`label-${tag}`} color="blue">
                                  {
                                    FILTER_CATEGORIES.category.values[
                                      RULE_CATEGORIES[tag] - 1
                                    ].label
                                  }
                                </Label>
                              );
                            }
                            return labels;
                          }, [])}
                        </LabelGroup>
                      ) : (
                        <Label>{content.tags}</Label>
                      ))}
                  </p>
                </React.Fragment>
              }
              onFeedbackChanged={async (rule, rating) =>
                await Post(`${BASE_URL}/v2/rating`, {}, { rule, rating })
              }
            >
              <Flex>
                <FlexItem align={{ default: 'alignRight' }}>
                  <Dropdown
                    className="ins-c-rec-details__actions_dropdown"
                    onSelect={() =>
                      setActionsDropdownOpen(!actionsDropdownOpen)
                    }
                    position="right"
                    ouiaId="actions"
                    toggle={
                      <DropdownToggle
                        onToggle={(actionsDropdownOpen) =>
                          setActionsDropdownOpen(actionsDropdownOpen)
                        }
                        toggleIndicator={CaretDownIcon}
                      >
                        {intl.formatMessage(messages.actions)}
                      </DropdownToggle>
                    }
                    isOpen={actionsDropdownOpen}
                    dropdownItems={
                      content?.disabled
                        ? [
                            <DropdownItem
                              key="link"
                              ouiaId="enable"
                              onClick={() => {
                                enableRule(rule);
                              }}
                            >
                              {intl.formatMessage(messages.enableRule)}
                            </DropdownItem>,
                          ]
                        : [
                            <DropdownItem
                              key="link"
                              ouiaId="disable"
                              onClick={() => {
                                handleModalToggle(true);
                              }}
                            >
                              {intl.formatMessage(messages.disableRule)}
                            </DropdownItem>,
                          ]
                    }
                  />
                </FlexItem>
              </Flex>
            </RuleDetails>
          </Main>
          <Main>
            <React.Fragment>
              {content?.disabled && (
                <Card className="cardOverride">
                  <CardHeader>
                    <Title headingLevel="h4" size="xl">
                      <BellSlashIcon size="sm" />
                      &nbsp;
                      {intl.formatMessage(messages.ruleIsDisabled)}
                    </Title>
                  </CardHeader>
                  <CardBody>
                    {!recAckIsFetching && (
                      <React.Fragment>
                        {intl.formatMessage(
                          messages.ruleIsDisabledJustification
                        )}
                        <i>
                          {recAck.justification ||
                            intl.formatMessage(messages.none)}
                        </i>
                        {(recAck.updated_at || recAck.created_at) && (
                          <span>
                            &nbsp;
                            <DateFormat
                              date={
                                new Date(recAck.updated_at || recAck.created_at)
                              }
                              type="onlyDate"
                            />
                          </span>
                        )}
                      </React.Fragment>
                    )}
                  </CardBody>
                  <CardFooter>
                    <Button
                      isInline
                      variant="link"
                      onClick={() => enableRule(rule)}
                      ouiaId="rule"
                    >
                      {intl.formatMessage(messages.enableRule)}
                    </Button>
                  </CardFooter>
                </Card>
              )}
              {!content?.disabled && (
                <React.Fragment>
                  <Title className="titleOverride" headingLevel="h3" size="2xl">
                    {intl.formatMessage(messages.affectedClusters)}
                  </Title>
                  <AffectedClustersTable />
                </React.Fragment>
              )}
              {content?.disabled && (
                <MessageState
                  icon={BellSlashIcon}
                  title={intl.formatMessage(messages.ruleIsDisabled)}
                  text={intl.formatMessage(messages.ruleIsDisabledBody)}
                />
              )}
            </React.Fragment>
          </Main>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

Recommendation.propTypes = {
  rule: PropTypes.object.isRequired,
  ack: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export { Recommendation };
