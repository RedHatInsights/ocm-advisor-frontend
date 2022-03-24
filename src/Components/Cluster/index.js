import React, { useEffect } from 'react';
import routerParams from '@redhat-cloud-services/frontend-components-utilities/RouterParams';
import { useIntl } from 'react-intl';

import { useGetClusterByIdQuery } from '../../Services/SmartProxy';
import messages from '../../Messages';
import { Cluster } from './Cluster';

export default routerParams(({ match }) => {
  const intl = useIntl();
  const cluster = useGetClusterByIdQuery({
    id: match.params.clusterId,
    includeDisabled: false,
  });

  useEffect(() => {
    cluster.refetch();
  }, [match.params.clusterId]);

  useEffect(() => {
    if (match.params.clusterId) {
      const subnav = `${match.params.clusterId} - ${intl.formatMessage(
        messages.clusters
      )}`;
      // FIXME: https://consoledot.pages.redhat.com/insights-chrome/dev/api.html#_using_updatedocumenttitle_function
      document.title = intl.formatMessage(messages.documentTitle, { subnav });
    }
  }, [match.params.clusterId]);
  return <Cluster cluster={cluster} match={match} />;
});
