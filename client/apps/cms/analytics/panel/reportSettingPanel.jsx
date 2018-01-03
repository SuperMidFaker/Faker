import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List, Switch } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { toggleReportSettingDock } from 'common/reducers/cmsAnalytics';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    visible: state.cmsAnalytics.reportSettingDock.visible,
  }),
  { toggleReportSettingDock }
)
export default class ReportSettingPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    const reports = [
      {
        id: '5a3098a3366d746064c5cd09',
        title: '按委托单位分布',
        enabled: true,
      },
      {
        id: '5a3098a3366d746064c5cd09',
        title: '按代理单位分布',
        enabled: true,
      },
      {
        id: '5a3098a3366d746064c5cd09',
        title: '日变化趋势',
        enabled: true,
      },
      {
        id: '5a3098a3366d746064c5cd09',
        title: '按报关类型分布',
        enabled: true,
      },
      {
        id: '5a3098a3366d746064c5cd09',
        title: '按运输方式分布',
        enabled: false,
      },
    ];
    return (
      <DockPanel
        size="small"
        visible={visible}
        onClose={() => this.props.toggleReportSettingDock(false)}
        title={this.msg('reportSetting')}
      >
        <List
          size="small"
          itemLayout="horizontal"
          dataSource={reports}
          renderItem={item => (
            <List.Item actions={[<Switch size="small" checked={item.enabled} />]}>
              {item.title}
            </List.Item>
          )}
        />
      </DockPanel>
    );
  }
}
