import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import {
  SortByDirection,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { Card, CardBody } from '@patternfly/react-core/dist/js/components/Card';
import {
  Pagination,
  PaginationVariant,
} from '@patternfly/react-core/dist/js/components/Pagination';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar/PrimaryToolbar';

import {
  CLUSTERS_LIST_INITIAL_STATE,
  updateClustersListFilters,
} from '../../Services/Filters';
import {
  CLUSTERS_LIST_COLUMNS,
  CLUSTER_FILTER_CATEGORIES,
} from '../../AppConstants';
import {
  buildFilterChips,
  mapClustersToRows,
  passFiltersCluster,
} from '../Common/Tables';
import Loading from '../Loading/Loading';
import messages from '../../Messages';
import { ErrorState, NoMatchingClusters } from '../MessageState/EmptyStates';

const ClustersListTable = ({ query }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const updateFilters = (payload) =>
    dispatch(updateClustersListFilters(payload));
  const filters = useSelector(({ filters }) => filters.clustersListState);

  const { isError, isUninitialized, isFetching, isSuccess, data, refetch } =
    query;
  const clusters = data?.data || [];
  const page = filters.offset / filters.limit + 1;

  const [filteredRows, setFilteredRows] = useState([]);
  const [displayedRows, setDisplayedRows] = useState([]);

  useEffect(() => {
    setDisplayedRows(
      buildDisplayedRows(filteredRows, filters.sortIndex, filters.sortDirection)
    );
  }, [
    filteredRows,
    filters.limit,
    filters.offset,
    filters.sortIndex,
    filters.sortDirection,
  ]);

  useEffect(() => {
    setFilteredRows(buildFilteredRows(clusters, filters));
  }, [data, filters]);

  const buildFilteredRows = (allRows, filters) => {
    return mapClustersToRows(
      allRows.filter((cluster) => passFiltersCluster(cluster, filters))
    );
  };

  const buildDisplayedRows = (rows, index, direction) => {
    const sorted = [...rows].sort((a, b) => {
      const fst = a.cells[index],
        snd = b.cells[index];
      return fst > snd ? 1 : snd > fst ? -1 : 0;
    });
    if (direction === SortByDirection.desc) {
      sorted.reverse();
    }
    return sorted.slice(
      filters.limit * (page - 1),
      filters.limit * (page - 1) + filters.limit
    );
  };

  const removeFilterParam = (param) => {
    const filter = { ...filters, offset: 0 };
    delete filter[param];
    updateFilters({
      ...filter,
      ...(param === 'text'
        ? { text: '' }
        : param === 'hits'
        ? { hits: [] }
        : {}),
    });
  };

  // TODO: update URL when filters changed
  const addFilterParam = (param, values) => {
    values.length > 0
      ? updateFilters({ ...filters, offset: 0, ...{ [param]: values } })
      : removeFilterParam(param);
  };

  const filterConfigItems = [
    {
      label: intl.formatMessage(messages.name).toLowerCase(),
      filterValues: {
        key: 'text-filter',
        onChange: (_event, value) => updateFilters({ ...filters, text: value }),
        value: filters.text,
        placeholder: intl.formatMessage(messages.filterBy),
      },
    },
    {
      label: CLUSTER_FILTER_CATEGORIES.hits.title,
      type: CLUSTER_FILTER_CATEGORIES.hits.type,
      id: CLUSTER_FILTER_CATEGORIES.hits.urlParam,
      value: `checkbox-${CLUSTER_FILTER_CATEGORIES.hits.urlParam}`,
      filterValues: {
        key: `${CLUSTER_FILTER_CATEGORIES.hits.urlParam}-filter`,
        onChange: (_event, values) =>
          addFilterParam(CLUSTER_FILTER_CATEGORIES.hits.urlParam, values),
        value: filters.hits,
        items: CLUSTER_FILTER_CATEGORIES.hits.values,
      },
    },
  ];

  const activeFiltersConfig = {
    deleteTitle: intl.formatMessage(messages.resetFilters),
    // TODO: utilize buildFilterChips in RecsListTable
    filters: buildFilterChips(filters, CLUSTER_FILTER_CATEGORIES),
    onDelete: (_event, itemsToRemove, isAll) => {
      if (isAll) {
        dispatch(updateFilters(CLUSTERS_LIST_INITIAL_STATE));
      } else {
        itemsToRemove.map((item) => {
          const newFilter = {
            [item.urlParam]: Array.isArray(filters[item.urlParam])
              ? filters[item.urlParam].filter(
                  (value) => String(value) !== String(item.chips[0].value)
                )
              : '',
          };
          newFilter[item.urlParam].length > 0
            ? dispatch(updateFilters({ ...filters, ...newFilter }))
            : removeFilterParam(item.urlParam);
        });
      }
    },
  };

  const onSort = (_e, index, direction) => {
    updateFilters({ ...filters, sortIndex: index, sortDirection: direction });
  };

  return (
    <div id="clusters-list-table">
      <PrimaryToolbar
        pagination={{
          itemCount: filteredRows.length,
          page,
          perPage: Number(filters.limit),
          onSetPage: (_event, page) =>
            updateFilters({
              ...filters,
              offset: filters.limit * (page - 1),
            }),
          onPerPageSelect: (_event, perPage) =>
            updateFilters({ ...filters, limit: perPage, offset: 0 }),
          isCompact: true,
        }}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
      />
      {(isUninitialized || isFetching) && <Loading />}
      {isError && (
        <Card>
          <CardBody>
            <ErrorState />
          </CardBody>
        </Card>
      )}
      {!(isUninitialized || isFetching) && isSuccess && (
        <React.Fragment>
          <Table
            aria-label="Table of clusters"
            ouiaId="clustersListTable"
            variant={TableVariant.compact}
            cells={CLUSTERS_LIST_COLUMNS}
            rows={displayedRows}
            sortBy={{
              index: filters.sortIndex,
              direction: filters.sortDirection,
            }}
            onSort={onSort}
          >
            <TableHeader />
            <TableBody />
          </Table>
          {clusters.length > 0 && filteredRows.length === 0 && (
            <Card ouiaId={'empty-recommendations'}>
              <CardBody>
                <NoMatchingClusters />
              </CardBody>
            </Card>
          )}
        </React.Fragment>
      )}
      <Pagination
        ouiaId="clusters-list-pagination-bottom"
        itemCount={filteredRows.length}
        page={filters.offset / filters.limit + 1}
        perPage={Number(filters.limit)}
        onSetPage={(_e, page) =>
          updateFilters({
            ...filters,
            offset: filters.limit * (page - 1),
          })
        }
        onPerPageSelect={(_e, perPage) =>
          updateFilters({ ...filters, limit: perPage, offset: 0 })
        }
        widgetId={`pagination-options-menu-bottom`}
        variant={PaginationVariant.bottom}
      />
    </div>
  );
};

ClustersListTable.propTypes = {
  query: PropTypes.object.isRequired,
};

export { ClustersListTable };
