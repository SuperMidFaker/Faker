import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Collapse, Button, Breadcrumb, Table, Select, Icon, Form, message } from 'antd';
import ButtonToggle from 'client/components/ButtonToggle';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTempParams, loadDocuDatas, loadDocuBody, loadInvTemplates, updateDocuTemplate, setDocu } from 'common/reducers/cmsInvoice';
import InvoiceDetails from './invoiceDetails';
import ContractDetails from './contractDetails';
import PacklistDetails from './packlistDetails';
import { CMS_DOCU_TYPE } from 'common/constants';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const { Header, Content, Sider } = Layout;
const Option = Select.Option;
const OptGroup = Select.OptGroup;
const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billMeta: state.cmsManifest.billMeta,
    docuDatas: state.cmsInvoice.docuDatas,
    invTemplates: state.cmsInvoice.invTemplates,
    docu: state.cmsInvoice.docu,
  }),
  { loadTempParams, loadDocuDatas, loadDocuBody, loadInvTemplates, updateDocuTemplate, setDocu }
)

export default class DocuView extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    docuDatas: PropTypes.array.isRequired,
    invTemplates: PropTypes.array.isRequired,
    docu: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    invoices: [],
    contracts: [],
    packlists: [],
    invtemps: [],
    contemps: [],
    paktemps: [],
  }
  componentDidMount() {
    this.props.loadDocuDatas({ billSeqNo: this.props.billMeta.bill_seq_no });
    this.props.loadInvTemplates({ tenantId: this.props.tenantId, docuType: [0, 1, 2] });
    this.props.loadTempParams();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.docuDatas !== this.props.docuDatas) {
      const invoices = nextProps.docuDatas.filter(dt => dt.docu_type === 0);
      const contracts = nextProps.docuDatas.filter(dt => dt.docu_type === 1);
      const packlists = nextProps.docuDatas.filter(dt => dt.docu_type === 2);
      if (this.props.docu) {
        this.props.loadDocuBody(nextProps.docu.id);
      } else {
        const docu = invoices.length > 0 ? invoices[0] : {};
        this.props.setDocu(docu);
        this.props.loadDocuBody(docu.id);
      }
      this.setState({ invoices, contracts, packlists });
    }
    if (nextProps.invTemplates !== this.props.invTemplates) {
      const invtemps = nextProps.invTemplates.filter(tp => tp.docu_type === 0);
      const contemps = nextProps.invTemplates.filter(tp => tp.docu_type === 1);
      const paktemps = nextProps.invTemplates.filter(tp => tp.docu_type === 2);
      this.setState({ invtemps, contemps, paktemps });
    }
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleRowClick = (record) => {
    this.props.loadDocuBody(record.id);
    this.props.setDocu(record);
  }
  handleBack = () => {
    this.context.router.goBack();
  }
  handleTempSelectChange = (value) => {
    this.props.updateDocuTemplate({ tempId: value, docu: this.props.docu }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 5);
      } else {
        this.props.loadDocuDatas({ billSeqNo: this.props.billMeta.bill_seq_no });
      }
    });
  }
  handlePanelChange = (key) => {
    const { invoices, contracts, packlists } = this.state;
    if (key === 'invoice') {
      const docu = invoices.length > 0 ? invoices[0] : {};
      this.props.setDocu(docu);
    } else if (key === 'contract') {
      const docu = contracts.length > 0 ? contracts[0] : {};
      this.props.setDocu(docu);
    } else if (key === 'packlist') {
      const docu = packlists.length > 0 ? packlists[0] : {};
      this.props.setDocu(docu);
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { billMeta } = this.props;
    const { invoices, contracts, packlists, invtemps, contemps, paktemps } = this.state;
    const docu = this.props.docu ? this.props.docu : {};
    const invTempId = (docu.docu_type === 0 && docu.template_id) ? docu.template_id : null;
    const conTempId = (docu.docu_type === 1 && docu.template_id) ? docu.template_id : null;
    const pakTempId = (docu.docu_type === 2 && docu.template_id) ? docu.template_id : null;
    const docuCols = [{
      dataIndex: 'docu_code',
      key: 'docu_code',
      render: o => <div style={{ paddingLeft: 15 }}>{o}</div>,
    }];
    return (
      <Layout className="ant-layout-wrapper">
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                <a onClick={this.handleBack}>{billMeta.bill_seq_no}</a>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                随附单据
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel" >
            <Collapse accordion defaultActiveKey="invoice" onChange={this.handlePanelChange}>
              <Panel header={this.msg('invoice')} key="invoice">
                <FormItem label="模板：" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select
                    placeholder="选择发票模板"
                    optionFilterProp="search"
                    size="large"
                    onChange={this.handleTempSelectChange}
                    style={{ width: 150 }}
                    allowClear
                    value={invTempId}
                  >
                    <OptGroup>
                      {invtemps.map(data => (<Option key={data.id} value={data.id}
                        search={`${data.id}${data.template_name}`}
                      ><Icon type="file-text" /> {data.template_name}</Option>)
                        )}
                    </OptGroup>
                  </Select>
                </FormItem>
                <Table size="middle" dataSource={invoices} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
              <Panel header={this.msg('contract')} key="contract">
                <FormItem label="模板：" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select
                    placeholder="选择合同模板"
                    optionFilterProp="search"
                    size="large"
                    onChange={this.handleTempSelectChange}
                    style={{ width: 150 }}
                    allowClear
                    value={conTempId}
                  >
                    <OptGroup>
                      {contemps.map(data => (<Option key={data.id} value={data.id}
                        search={`${data.id}${data.template_name}`}
                      ><Icon type="file-text" /> {data.template_name}</Option>)
                        )}
                    </OptGroup>
                  </Select>
                </FormItem>
                <Table size="middle" dataSource={contracts} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
              <Panel header={this.msg('packingList')} key="packlist">
                <FormItem label="模板：" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                  <Select
                    placeholder="选择箱单模板"
                    optionFilterProp="search"
                    size="large"
                    onChange={this.handleTempSelectChange}
                    style={{ width: 150 }}
                    allowClear
                    value={pakTempId}
                  >
                    <OptGroup>
                      {paktemps.map(data => (<Option key={data.id} value={data.id}
                        search={`${data.id}${data.template_name}`}
                      ><Icon type="file-text" /> {data.template_name}</Option>)
                        )}
                    </OptGroup>
                  </Select>
                </FormItem>
                <Table size="middle" dataSource={packlists} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
            </Collapse>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {billMeta.bill_seq_no}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                随附单据
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {`${docu.docu_code}`}
              </Breadcrumb.Item>
            </Breadcrumb>
          }
            <ButtonToggle size="large"
              iconOn="menu-fold" iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <span />
            <div className="top-bar-tools">
              <Button icon="file-pdf" onClick={this.handleEdit}>PDF</Button>
              <Button icon="printer" onClick={this.handleEdit}>{this.msg('print')}</Button>
            </div>
          </Header>
          <Content className="main-content layout-min-width layout-min-width-large">
            {docu.docu_type === CMS_DOCU_TYPE.invoice && <InvoiceDetails invoice={docu} />}
            {docu.docu_type === CMS_DOCU_TYPE.contract && <ContractDetails invoice={docu} />}
            {docu.docu_type === CMS_DOCU_TYPE.packingList && <PacklistDetails invoice={docu} />}
          </Content>
        </Layout>
      </Layout>
    );
  }
}

