import React, { Component, PropTypes } from 'react';
import { Tabs, Button, Form } from 'antd';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import AgreementForm from './forms/agreement';
import RatesForm from './forms/rates';
import SurchargeForm from './forms/surcharge';
import RevisionTable from './forms/revisionTable';
import { showPublishTariffModal } from 'common/reducers/transportTariff';
import { TARIFF_KINDS } from 'common/constants';
import PublishTariffModal from './modals/publishTariffModal';

const TabPane = Tabs.TabPane;

@connect(state => ({
  tenantId: state.account.tenantId,
  selectedKey: state.transportTariff.selectedMenuItemKey,
  tariffId: state.transportTariff.tariffId,
  agreement: state.transportTariff.agreement,
}), { showPublishTariffModal })
@connectNav({
  depth: 3,
  moduleName: 'transport',
})
@Form.create()
export default class Main extends Component {
  static propTyps = {
    form: PropTypes.object.isRequired,
    tenantId: PropTypes.number.isRequired,
    showPublishTariffModal: PropTypes.func.isRequired,        // itemItem点击后执行的回调函数,
    type: PropTypes.oneOf(['create', 'edit', 'view']),
    tariffId: PropTypes.string,
    agreement: PropTypes.object.isRequired,
  }
  state = {
    selectedKey: '0',
  }
  handleMenuItemClick = (key) => {
    this.setState({ selectedKey: key });
  }

  render() {
    const { type, tariffId, agreement } = this.props;
    const { selectedKey } = this.state;
    let content = [
      <TabPane tab="协议概况" key="0"><AgreementForm form={this.props.form} type={type} /></TabPane>,
      <TabPane tab="基础费率" key="1"><RatesForm type={type} /></TabPane>,
      <TabPane tab="附加费用" key="2"><SurchargeForm type={type} /></TabPane>,
      <TabPane tab="修订历史" key="3"><RevisionTable type={type} /></TabPane>,
    ];

    if (type === 'create') {
      if (!tariffId) {
        content = [
          <TabPane tab="协议概况" key="0"><AgreementForm form={this.props.form} /></TabPane>,
        ];
      }
    } else if (type === 'view') {
      content = [
        <TabPane tab="协议概况" key="0"><AgreementForm readonly form={this.props.form} type={type} /></TabPane>,
        <TabPane tab="基础费率" key="1"><RatesForm type={type} /></TabPane>,
        <TabPane tab="附加费用" key="2"><SurchargeForm type={type} /></TabPane>,
        <TabPane tab="修订历史" key="3"><RevisionTable type={type} /></TabPane>,
      ];
    }
    let kindText = '';
    if (TARIFF_KINDS[agreement.kind]) {
      kindText = TARIFF_KINDS[agreement.kind].text;
    }
    return (
      <div>
        <header className="top-bar">
          <span>{`${agreement.quoteNo} - ${agreement.partnerName} - ${kindText}`}</span>
        </header>
        { type === 'edit' && (
          <div className="top-bar-tools">
            <Button type="primary" onClick={() => this.props.showPublishTariffModal(true)}>发布</Button>
            <span />
            <PublishTariffModal tariffForm={this.props.form} />
          </div>
        )}
        <div className="main-content">
          <div className="page-body">
            <Tabs activeKey={selectedKey} onChange={this.handleMenuItemClick}>
              {content}
            </Tabs>
          </div>

        </div>
      </div>
    );
  }
}
