import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { List } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import { hideDeclLog, loadDeclLogs } from 'common/reducers/cmsDeclare';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    visible: state.cmsDeclare.declLogPanel.visible,
  }),
  { hideDeclLog, loadDeclLogs }
)
export default class CusDeclLogsPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    preEntrySeqNo: PropTypes.string,
  }
  state = {
    logs: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible && nextProps.visible) {
      this.props.loadDeclLogs(nextProps.preEntrySeqNo).then((result) => {
        if (!result.error) {
          this.setState({
            logs: result.data,
          });
        }
      });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    const { logs } = this.state;
    return (
      <DockPanel
        size="small"
        visible={visible}
        onClose={this.props.hideDeclLog}
        title={<span>操作记录</span>}
      >
        <List
          itemLayout="horizontal"
          dataSource={logs}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={<a>{item.op_behavior}</a>}
                description={item.created_date && moment(item.created_date).format('YYYY-MM-DD hh:mm')}
              />
              <div>{item.op_content}</div>
            </List.Item>
          )}
        />
      </DockPanel>
    );
  }
}
