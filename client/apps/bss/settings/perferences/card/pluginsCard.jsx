import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, List, Switch } from 'antd';
import { BSS_PLUGINS } from 'common/constants';
import { loadStatsCard } from 'common/reducers/cwmDashboard';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    statsCard: state.cwmDashboard.statsCard,
  }),
  { loadStatsCard }
)

export default class PluginsCard extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    return (
      <Card bodyStyle={{ padding: 0 }}>
        <List
          dataSource={BSS_PLUGINS}
          renderItem={plugin => (
            <List.Item
              key={plugin.key}
              actions={[<Switch checkedChildren="开启" unCheckedChildren="关闭" />]}
            >
              <List.Item.Meta
                title={plugin.name}
                description={plugin.desc}
              />
            </List.Item>
          )}
        />
      </Card>
    );
  }
}
