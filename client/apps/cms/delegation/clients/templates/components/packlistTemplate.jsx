import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Collapse, Checkbox, Form, Input } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PackinglistContent from './packlistContent';
import { formatMsg } from './message.i18n';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadInvTemplateData, loadTempParams, saveTempChange } from 'common/reducers/cmsInvoice';

const Sider = Layout.Sider;
const Panel = Collapse.Panel;
const FormItem = Form.Item;

function MSCheckbox(props) {
  const {
    checked, field, text, onChange,
  } = props;
  function handleChange(ev) {
    onChange(field, ev.target.checked);
  }
  return (
    <div>
      <Checkbox style={{ 'font-size': 14 }} onChange={handleChange} checked={checked}>
        {text}
      </Checkbox>
    </div>
  );
}

MSCheckbox.propTypes = {
  field: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  checked: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

function fetchData({ dispatch, state, params }) {
  const promises = [];
  promises.push(dispatch(loadTempParams({
    tenantId: state.account.tenantId,
  })));
  promises.push(dispatch(loadInvTemplateData(params.id)));
  return Promise.all(promises);
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    template: state.cmsInvoice.template,
    invData: state.cmsInvoice.invData,
  }),
  { saveTempChange }
)
@connectNav({
  depth: 3,
  moduleName: 'clearance',
})
export default class PackinglistTemplate extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    invData: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCheckChange = (field, value) => {
    if (value !== '') {
      this.props.saveTempChange({ [field]: value }, this.props.invData.id);
    }
  }
  render() {
    const { invData } = this.props;
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider">
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                {`${this.props.template.template_name}`}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <Collapse accordion defaultActiveKey="header">
              <Panel header="Header" key="header">
                <FormItem label="发票日期：" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Input value={invData.days_ago} addonBefore="生成发票前" addonAfter="天" onChange={ev => this.handleCheckChange('days_ago', ev.target.value)} />
                </FormItem>
              </Panel>
              <Panel header="Item Table" key="item">
                <MSCheckbox
                  field="containerno_en"
                  text={this.msg('containerNo')}
                  onChange={this.handleCheckChange}
                  checked={invData.containerno_en}
                />
                <MSCheckbox
                  field="eng_name_en"
                  text={this.msg('enGName')}
                  onChange={this.handleCheckChange}
                  checked={invData.eng_name_en}
                />
              </Panel>
              <Panel header="Total" key="total">
                <MSCheckbox
                  field="sub_total_en"
                  text={this.msg('subTotal')}
                  onChange={this.handleCheckChange}
                  checked={invData.sub_total_en}
                />
              </Panel>
              <Panel header="Footer" key="footer">
                <MSCheckbox
                  field="insurance_en"
                  text={this.msg('insurance')}
                  onChange={this.handleCheckChange}
                  checked={invData.insurance_en}
                />
                <MSCheckbox
                  field="dest_port_en"
                  text={this.msg('destPort')}
                  onChange={this.handleCheckChange}
                  checked={invData.dest_port_en}
                />
                <MSCheckbox
                  field="remark_en"
                  text={this.msg('remark')}
                  onChange={this.handleCheckChange}
                  checked={invData.remark_en}
                />
              </Panel>
            </Collapse>
          </div>
        </Sider>
        <PackinglistContent />
      </Layout>
    );
  }
}
