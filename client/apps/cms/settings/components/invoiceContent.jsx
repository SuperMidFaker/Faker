import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Layout, Collapse, Checkbox } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import InvoiceDetials from './invoiceDetials';
import { formatMsg } from './message.i18n';

const Sider = Layout.Sider;
const Panel = Collapse.Panel;

function MSCheckbox(props) {
  const { state, field, text, onChange } = props;
  function handleChange(ev) {
    onChange(field, ev.target.checked);
  }
  return (
    <div>
      <Checkbox style={{ 'font-size': 14 }} onChange={handleChange} checked={state[field]}>
        {text}
      </Checkbox>
    </div>
  );
}

MSCheckbox.propTypes = {
  field: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  })
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
export default class InvoiceContent extends React.Component {
  static defaultProps ={

  }
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  state = {
    industry_en: false,
    eng_name_en: false,
    unit_price_en: false,
    sub_total_en: true,
    insurance_en: false,
    dest_port_en: false,
    remark_en: false,
  }
  msg = formatMsg(this.props.intl)
  handleCheckChange = (field, value) => {
    this.setState({ [field]: value });
  }
  render() {
    const setVal = this.state;
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider">
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('invoice')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <Collapse accordion defaultActiveKey="header">
              <Panel header={'Header'} key="header">
                <MSCheckbox field="industry_en"
                  text={this.msg('industryCategory')}
                  onChange={this.handleCheckChange} state={this.state}
                />
              </Panel>
              <Panel header={'Item Table'} key="item">
                <MSCheckbox field="unit_price_en"
                  text={this.msg('unitPrice')}
                  onChange={this.handleCheckChange} state={this.state}
                />
                <MSCheckbox field="eng_name_en"
                  text={this.msg('enGName')}
                  onChange={this.handleCheckChange} state={this.state}
                />
              </Panel>
              <Panel header={'Total'} key="total">
                <MSCheckbox field="sub_total_en"
                  text={this.msg('subTotal')}
                  onChange={this.handleCheckChange} state={this.state}
                />
              </Panel>
              <Panel header={'Footer'} key="footer">
                <MSCheckbox field="insurance_en"
                  text={this.msg('insurance')}
                  onChange={this.handleCheckChange} state={this.state}
                />
                <MSCheckbox field="dest_port_en"
                  text={this.msg('destPort')}
                  onChange={this.handleCheckChange} state={this.state}
                />
                <MSCheckbox field="remark_en"
                  text={this.msg('remark')}
                  onChange={this.handleCheckChange} state={this.state}
                />
              </Panel>
            </Collapse>
          </div>
          <div style={{ margin: 10, float: 'right' }}>
            <Button type="primary" onClick={this.handleInvoiceTempSave}>{this.msg('save')}</Button>
          </div>
        </Sider>
        <InvoiceDetials invoice={{}} setVal={setVal} />
      </Layout>
    );
  }
}
