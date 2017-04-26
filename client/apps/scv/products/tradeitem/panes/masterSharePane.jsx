import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Form, Select, Alert } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadMasterConfig, loadRepoSlaves, renewSharees } from 'common/reducers/scvClassification';
import connectNav from 'client/common/decorators/connect-nav';
import messages from './../message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);
const Content = Layout.Content;
const FormItem = Form.Item;
const Option = Select.Option;
function fetchData({ state, dispatch }) {
  const proms = [
    dispatch(loadRepoSlaves(state.account.tenantId)),
    dispatch(loadMasterConfig({
      tenantId: state.account.tenantId,
    }))];
  return Promise.all(proms);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    masterConfig: state.scvClassification.master,
    brokers: state.scvClassification.slaves,
  }),
  { renewSharees }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class MasterSharePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = { value: [] }
  componentWillMount() {
    this.setState({ value: this.props.masterConfig.sharees.map(sh => sh.sharee_id) });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.masterConfig.sharees !== this.props.masterConfig.sharees) {
      this.setState({ value: nextProps.masterConfig.sharees.map(sh => sh.sharee_id) });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleSharesChange = (shareeIds) => {
    const { tenantId, brokers } = this.props;
    const shareeTenants = shareeIds.map(val => ({
      tenant_id: val,
      name: brokers.filter(sb => sb.tenant_id === val)[0].name,
    }));
    this.props.renewSharees(tenantId, shareeTenants);
    this.setState({ value: shareeIds });
  }
  render() {
    const { brokers } = this.props;
    return (
      <Content className="nav-content">
        <div className="panel-body table-panel">
          <Form>
            <FormItem label={this.msg('classifyShareScope')} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
              <Select mode="tags" value={this.state.value} style={{ width: '90%' }} onChange={this.handleSharesChange}>
                {brokers.map(opt => <Option key={opt.tenant_id} value={opt.tenant_id}>{opt.name}</Option>)}
              </Select>
            </FormItem>
          </Form>
          <Alert message="如需添加新的服务商，请前往资源设置添加清关服务商" type="info" showIcon />
        </div>
      </Content>
    );
  }
}
