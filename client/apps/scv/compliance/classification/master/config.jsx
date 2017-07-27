import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Form, Select, Alert, Row, Col } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadMasterConfig, loadRepoSlaves, renewSharees } from 'common/reducers/scvClassification';
import connectNav from 'client/common/decorators/connect-nav';
import ScvClassificationWrapper from '../wrapper';
import { formatMsg } from '../message.i18n';

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
    brokers: state.scvClassification.synclist,
  }),
  { renewSharees }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class ScvClassificationMasterConfig extends React.Component {
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
  msg = formatMsg(this.props.intl)
  handleSharesChange = (shareeIds) => {
    const { tenantId, brokers } = this.props;
    const shareeTenants = shareeIds.map(val => ({
      tenant_id: val,
      name: brokers.filter(sb => sb.broker_tenant_id === val)[0].broker_name,
    }));
    this.props.renewSharees(tenantId, tenantId, shareeTenants);
    this.setState({ value: shareeIds });
  }
  render() {
    const { brokers } = this.props;
    return (
      <ScvClassificationWrapper menuKey="master">
        <Content className="nav-content">
          <div className="panel-body table-panel table-fixed-layout">
            <Form>
              <FormItem label={this.msg('classifyShareScope')} labelCol={{ span: 4 }} wrapperCol={{ span: 18 }}>
                <Select mode="tags" value={this.state.value} style={{ width: '90%' }} onChange={this.handleSharesChange}>
                  {brokers.map(opt => <Option key={opt.broker_tenant_id} value={opt.broker_tenant_id}>{opt.broker_name}</Option>)}
                </Select>
              </FormItem>
            </Form>
            <Row>
              <Col span={8} offset={4}>
                <Alert message="如需添加新的服务商，请前往资源设置添加报关报检代理" type="info" showIcon />
              </Col>
            </Row>
          </div>
        </Content>
      </ScvClassificationWrapper>
    );
  }
}
