import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Collapse, Checkbox } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import PackingListDetials from './packlistDetails';
import { formatMsg } from './message.i18n';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadInvTemplateData, loadTempParams, saveTempChange } from 'common/reducers/cmsInvoice';

const Sider = Layout.Sider;
const Panel = Collapse.Panel;

function MSCheckbox(props) {
  const { checked, field, text, onChange } = props;
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
  depth: 2,
  moduleName: 'clearance',
})
export default class PackingListContent extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    invData: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCheckChange = (field, value) => {
    this.props.saveTempChange({ [field]: value }, this.props.invData.id);
  }
  render() {
    const { invData } = this.props;
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider">
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('invoice')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {`${this.props.template.template_name}`}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <Collapse accordion defaultActiveKey="item">
              <Panel header={'Item Table'} key="item">
                <MSCheckbox field="containerno_en"
                  text={this.msg('containerNo')}
                  onChange={this.handleCheckChange} checked={invData.containerno_en}
                />
                <MSCheckbox field="eng_name_en"
                  text={this.msg('enGName')}
                  onChange={this.handleCheckChange} checked={invData.eng_name_en}
                />
              </Panel>
              <Panel header={'Total'} key="total">
                <MSCheckbox field="sub_total_en"
                  text={this.msg('subTotal')}
                  onChange={this.handleCheckChange} checked={invData.sub_total_en}
                />
              </Panel>
              <Panel header={'Footer'} key="footer">
                <MSCheckbox field="insurance_en"
                  text={this.msg('insurance')}
                  onChange={this.handleCheckChange} checked={invData.insurance_en}
                />
                <MSCheckbox field="dest_port_en"
                  text={this.msg('destPort')}
                  onChange={this.handleCheckChange} checked={invData.dest_port_en}
                />
                <MSCheckbox field="remark_en"
                  text={this.msg('remark')}
                  onChange={this.handleCheckChange} checked={invData.remark_en}
                />
              </Panel>
            </Collapse>
          </div>
        </Sider>
        <PackingListDetials />
      </Layout>
    );
  }
}
