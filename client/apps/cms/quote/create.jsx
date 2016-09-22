import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { submitQuotes } from 'common/reducers/cmsQuote';
import { Button, message, Form } from 'antd';
import FeesTable from './feesTable';
import FeesForm from './feesForm';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    quoteData: state.cmsQuote.quoteData,
  }),
  { submitQuotes }
)
@connectNav({
  depth: 3,
  text: props => formatMsg(props.intl, 'newPrice'),
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'quote', action: 'create' })
@Form.create()
export default class QuotingCreate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    quoteData: PropTypes.object.isRequired,
    submitQuotes: PropTypes.func.isRequired,
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
    const prom = this.props.submitQuotes(quoteData);
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
          <span>新建报价</span>
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
