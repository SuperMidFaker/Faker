import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { createQuote, loadQuoteModel, loadPartners } from 'common/reducers/cmsQuote';
import { Button, message, Form } from 'antd';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
const formatMsg = format(messages);

function fetchData({ state, dispatch }) {
  const promises = [];
  promises.push(dispatch(loadPartners(state.account.tenantId)));
  promises.push(dispatch(loadQuoteModel()));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    quoteData: state.cmsQuote.quoteData,
  }),
  { createQuote }
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'quoteManage'),
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'create' })
@Form.create()
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'create' })
export default class QuotingCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    quoteData: PropTypes.object.isRequired,
    createQuote: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleSave = () => {
    const quoteData = {
      ...this.props.quoteData,
      ...this.props.form.getFieldsValue(),
    };
    quoteData.tenantId = this.props.tenantId;
    quoteData.valid = true;
    quoteData.modifyBy = this.props.loginId;
    const prom = this.props.createQuote(quoteData);
    prom.then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
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
          <span>{msg('newQuote')}</span>
          <div className="tools">
            <Button type="primary" onClick={this.handleSave} >{msg('save')}</Button>
          </div>
        </header>
        <div className="main-content">
          <FeesForm form={form} />
          <FeesTable />
        </div>
      </div>
    );
  }
}
