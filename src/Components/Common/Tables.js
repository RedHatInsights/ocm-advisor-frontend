import React from 'react';
import { Link } from 'react-router-dom';
import cloneDeep from 'lodash/cloneDeep';

import { Tooltip } from '@patternfly/react-core/dist/js/components/Tooltip';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';

import {
  CLUSTER_FILTER_CATEGORIES,
  FILTER_CATEGORIES,
  intl,
  RULE_CATEGORIES,
} from '../../AppConstants';
import messages from '../../Messages';

export const passFilters = (rule, filters) =>
  Object.entries(filters).every(([filterKey, filterValue]) => {
    switch (filterKey) {
      case 'text':
        return rule.description
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      case FILTER_CATEGORIES.total_risk.urlParam:
        return filterValue.includes(String(rule.total_risk));
      case FILTER_CATEGORIES.category.urlParam:
        return rule.tags.find((c) =>
          filterValue.includes(String(RULE_CATEGORIES[c]))
        );
      case FILTER_CATEGORIES.impact.urlParam:
        return filterValue.includes(String(rule.impact));
      case FILTER_CATEGORIES.impacting.urlParam:
        return filterValue.length > 0
          ? filterValue.some((v) => {
              if (v === 'true') {
                return rule.impacted_clusters_count > 0;
              }
              if (v === 'false') {
                return rule.impacted_clusters_count === 0;
              }
            })
          : true;
      case FILTER_CATEGORIES.likelihood.urlParam:
        return filterValue.includes(String(rule.likelihood));
      case FILTER_CATEGORIES.rule_status.urlParam:
        return (
          filterValue === 'all' ||
          (filterValue === 'disabled' && rule.disabled) ||
          (filterValue === 'enabled' && !rule.disabled)
        );
      default:
        return true;
    }
  });

export const passFiltersCluster = (cluster, filters) =>
  Object.entries(filters).every(([filterKey, filterValue]) => {
    switch (filterKey) {
      case 'text':
        return (cluster.cluster_name || cluster.cluster_id)
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      case CLUSTER_FILTER_CATEGORIES.hits.urlParam:
        return (
          // clusters with at least one rule hit
          (filterValue.length === 0 && parseInt(cluster.total_hit_count) > 0) ||
          // all clusters
          filterValue.includes('all') ||
          // clusters with at least one rule hit for any of the active risk filters
          filterValue.some((v) => cluster.hits_by_total_risk[v - 1] > 0)
        );
      default:
        return true;
    }
  });

export const mapClustersToRows = (clusters) =>
  clusters.map((cluster, index) => ({
    cluster,
    cells: [
      <span key={index}>
        <Link to={`clusters/${cluster.cluster_id}`}>
          {cluster.cluster_name || cluster.cluster_id}
        </Link>
      </span>,
      cluster.total_hit_count,
      cluster.hits_by_total_risk?.[3] || 0,
      cluster.hits_by_total_risk?.[2] || 0,
      cluster.hits_by_total_risk?.[1] || 0,
      cluster.hits_by_total_risk?.[0] || 0,
      <span key={index}>
        {cluster.last_checked_at ? (
          <DateFormat
            extraTitle={`${intl.formatMessage(messages.lastSeen)}: `}
            date={cluster.last_checked_at}
            variant="relative"
          />
        ) : (
          <Tooltip
            key={index}
            content={
              <span>
                {intl.formatMessage(messages.lastSeen) + ': '}
                {intl.formatMessage(messages.nA)}
              </span>
            }
          >
            <span>{intl.formatMessage(messages.nA)}</span>
          </Tooltip>
        )}
      </span>,
    ],
  }));

export const capitalize = (string) =>
  string[0].toUpperCase() + string.substring(1);

export const pruneFilters = (localFilters, filterCategories) => {
  const prunedFilters = Object.entries(localFilters || {});
  return prunedFilters.reduce((arr, it) => {
    const [key, item] = it;
    if (filterCategories[key]) {
      const category = filterCategories[key];
      const chips = Array.isArray(item)
        ? item.map((value) => {
            const selectedCategoryValue = category.values.find(
              (values) => values.value === String(value)
            );
            return selectedCategoryValue
              ? {
                  name:
                    selectedCategoryValue.text || selectedCategoryValue.label,
                  value,
                }
              : { name: value, value };
          })
        : [
            {
              name: category.values.find(
                (values) => values.value === String(item)
              ).label,
              value: item,
            },
          ];
      return [
        ...arr,
        {
          category: capitalize(category.title),
          chips,
          urlParam: category.urlParam,
        },
      ];
    } else if (key === 'text') {
      return [
        ...arr,
        ...(item.length > 0
          ? [
              {
                category: 'Name',
                chips: [{ name: item, value: item }],
                urlParam: key,
              },
            ]
          : []),
      ];
    }
  }, []);
};

export const buildFilterChips = (filters, categories) => {
  const localFilters = cloneDeep(filters);
  delete localFilters.sortIndex;
  delete localFilters.sortDirection;
  delete localFilters.offset;
  delete localFilters.limit;
  localFilters?.hits &&
    localFilters.hits.length === 0 &&
    delete localFilters.hits;
  return pruneFilters(localFilters, categories);
};

// parses url params for use in table/filter chips
export const paramParser = (search) => {
  const searchParams = new URLSearchParams(search);
  return Array.from(searchParams).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [key]:
        key === 'text'
          ? // just copy the full value
            value
          : value === 'true' || value === 'false'
          ? // parse boolean
            JSON.parse(value)
          : // parse array of values
            value.split(','),
    }),
    {}
  );
};

export const translateSortParams = (value) => ({
  sortValue: value.substring(value.startsWith('-') ? 1 : 0),
  sortDirection: value.startsWith('-') ? 'desc' : 'asc',
});
