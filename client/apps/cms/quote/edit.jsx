import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import withPrivilege from 'client/common/decorators/withPrivilege';
import messages from './message.i18n';
import { loadEditQuote, copyQuote, deleteQuote, loadPartners } from 'common/reducers/cmsQuote';
import { Button, Card, Collapse, message, Form, Popconfirm } from 'antd';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
import connectFetch from 'client/common/decorators/connect-fetch';
const formatMsg = format(messages);
const Panel = Collapse.Panel;

function fetchData({ params, state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadPartners(state.account.tenantId)));
  promises.push(dispatch(loadEditQuote(params.quoteno)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    quoteData: state.cmsQuote.quoteData,
    partners: state.cmsQuote.partners,
    clients: state.cmsQuote.clients,
  }),
  { copyQuote, deleteQuote }
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'quoteManage'),
  moduleName: 'clearance',
})
@Form.create()
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'edit' })
export default class QuotingEdit extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    quoteData: PropTypes.object.isRequired,
    copyQuote: PropTypes.func.isRequired,
    deleteQuote: PropTypes.func.isRequired,
    partners: PropTypes.array.isRequired,
    clients: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleCopy = () => {
    const quoteData = {
      ...this.props.quoteData,
      ...this.props.form.getFieldsValue(),
    };
    quoteData.tenantId = this.props.tenantId;
    quoteData.valid = true;
    quoteData.modifyBy = this.props.loginName;
    quoteData.modifyById = this.props.loginId;
    const prom = this.props.copyQuote(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('复制成功', 5);
        this.context.router.push(`/clearance/quote/edit/${this.props.quoteData.quote_no}`);
      }
    });
  }
  handleDeleteConfirm = () => {
    const prom = this.props.deleteQuote(
      this.props.quoteData._id,
      false,
      this.props.tenantId,
      this.props.loginName,
      this.props.loginId,
    );
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('已删除', 5);
        this.context.router.push('/clearance/quote');
      }
    });
  }
  render() {
    const { form } = this.props;
    const msg = key => formatMsg(this.props.intl, key);
    return (
      <div>
        <header className="top-bar">
          <span>{msg('editQuote')}</span>
        </header>
        <div className="top-bar-tools">
          <Button type="primary" onClick={this.handleCopy} >{msg('copy')}</Button>
          <span />
          <Popconfirm title="确认删除？" onConfirm={this.handleDeleteConfirm} >
            <Button>{msg('delete')}</Button>
          </Popconfirm>
        </div>
        <div className="main-content">
          <div className="page-body">
            <Collapse bordered={false} defaultActiveKey={['fees-form', 'fees-table']}>
              <Panel header={<span>基础信息</span>} key="fees-form">
                <FeesForm form={form} action="edit" />
              </Panel>
              <Panel header={<span>价格表</span>} key="fees-table">
                <Card bodyStyle={{ padding: 0 }}>
                  <FeesTable action="edit" editable={false} />
                </Card>
              </Panel>
            </Collapse>
          </div>
        </div>
      </div>
    );
  }
}
