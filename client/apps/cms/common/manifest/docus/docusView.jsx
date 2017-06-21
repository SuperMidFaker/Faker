import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Collapse, Button, Breadcrumb, Table } from 'antd';
import ButtonToggle from 'client/components/ButtonToggle';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { loadTempParams, loadDocuDatas, loadDocuBody } from 'common/reducers/cmsInvoice';
import InvoiceDetails from './invoiceDetails';
import ContractDetails from './contractDetails';
import PacklistDetails from './packlistDetails';
import { CMS_DOCU_TYPE } from 'common/constants';

const formatMsg = format(messages);
const Panel = Collapse.Panel;
const { Header, Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    billMeta: state.cmsManifest.billMeta,
    docuDatas: state.cmsInvoice.docuDatas,
  }),
  { loadTempParams, loadDocuDatas, loadDocuBody }
)

export default class DocuView extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    docuDatas: PropTypes.array.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    collapsed: false,
    docu: {},
    invoices: [],
    contracts: [],
    packlists: [],
  }
  componentDidMount() {
    this.props.loadDocuDatas({ billSeqNo: this.props.billMeta.bill_seq_no });
    this.props.loadTempParams();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.docuDatas !== this.props.docuDatas) {
      const invoices = nextProps.docuDatas.filter(dt => dt.docu_type === 0);
      const contracts = nextProps.docuDatas.filter(dt => dt.docu_type === 1);
      const packlists = nextProps.docuDatas.filter(dt => dt.docu_type === 2);
      const docu = invoices.length > 0 ? invoices[0] : {};
      this.props.loadDocuBody(docu.id);
      this.setState({ invoices, contracts, packlists, docu });
    }
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleRowClick = (record) => {
    this.props.loadDocuBody(record.id);
    this.setState({ docu: record });
  }
  handleBack = () => {
    this.context.router.goBack();
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { billMeta } = this.props;
    const { docu, invoices, contracts, packlists } = this.state;
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
            <Collapse accordion defaultActiveKey="invoice">
              <Panel header={this.msg('invoice')} key="invoice">
                <Table size="middle" dataSource={invoices} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
              <Panel header={this.msg('contract')} key="contract">
                <Table size="middle" dataSource={contracts} columns={docuCols} showHeader={false} onRowClick={this.handleRowClick}
                  rowKey="id" pagination={false} rowClassName={record => record.id === docu.id ? 'table-row-selected' : ''}
                />
              </Panel>
              <Panel header={this.msg('packingList')} key="packlist">
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

