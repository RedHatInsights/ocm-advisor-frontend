import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const BASE_URL = '/api/insights-results-aggregator';

export const SmartProxyApi = createApi({
  reducerPath: 'smartProxy',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
  }),
  endpoints: (builder) => ({
    getClusterById: builder.query({
      query: ({ id, includeDisabled }) =>
        `v2/cluster/${id}/reports?get_disabled=${includeDisabled}`,
    }),
    // Get rule's content using id (recId = recommendation id) in the rule_plugin_name|error_key format
    getRuleById: builder.query({
      query: (recId) => `v2/rule/${recId}`,
    }),
    getAffectedClusters: builder.query({
      query: (recId) => `v2/rule/${recId}/clusters_detail`,
      transformResponse: (response) => response?.data,
    }),
    getRecs: builder.query({
      query: () => `v2/rule`,
    }),
    getClusters: builder.query({
      query: () => `v2/clusters`,
    }),
    getDisplayName: builder.query({
      query: ({ id, includeDisabled }) =>
        `v2/cluster/${id}/reports?get_disabled=${includeDisabled}`,
      transformResponse: (response) => response?.report?.meta?.cluster_name,
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetClusterByIdQuery,
  useLazyGetClusterByIdQuery,
  useGetRuleByIdQuery,
  useGetAffectedClustersQuery,
  useGetRecsQuery,
  useLazyGetRecsQuery,
  useGetClustersQuery,
  useGetDisplayNameQuery,
} = SmartProxyApi;
