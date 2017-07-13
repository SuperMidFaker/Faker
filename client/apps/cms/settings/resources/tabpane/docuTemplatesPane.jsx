import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { Table, Button, Icon, Layout, Menu, Popconfirm, Popover, Upload, message } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import withPrivilege from 'client/common/decorators/withPrivilege';
import InvTemplateModal from '../templates/modals/newTemplate';
import { toggleInvTempModal, loadInvTemplates, deleteInvTemplate } from 'common/reducers/cmsInvoice';
import { CMS_DOCU_TYPE } from 'common/constants';

const formatMsg = format(messages);
const { Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
    invTemplates: state.cmsInvoice.invTemplates,
    docuType: state.cmsInvoice.docuType,
    customer: state.cmsResources.customer,
  }),
  { toggleInvTempModal, loadInvTemplates, deleteInvTemplate }
)
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@withPrivilege({ module: 'clearance', feature: 'setting', action: 'edit' })
export default class InvoiceTemplate extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    invTemplates: PropTypes.array.isRequired,
    docuType: PropTypes.number.isRequired,
    customer: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    current: JSON.stringify(this.props.docuType),
    excelTemplCount: 0,
  }
  componentDidMount() {
    if (this.props.customer.id) {
      this.handleListLoad(this.props.docuType);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customer !== this.props.customer) {
      this.props.loadInvTemplates({ tenantId: this.props.tenantId, docuType: this.props.docuType, partnerId: nextProps.customer.id });
    }
  }
  msg = key => formatMsg(this.props.intl, key);
  handleNavigationTo(to, query) {
    this.context.router.push({ pathname: to, query });
  }
  handleListLoad = (type) => {
    this.props.loadInvTemplates({ tenantId: this.props.tenantId, docuType: type, partnerId: this.props.customer.id });
  }
  handleCreateNew = () => {
    this.props.toggleInvTempModal(true);
  }
  handleEdit = (record) => {
    let type = '';
    if (record.docu_type === CMS_DOCU_TYPE.invoice) {
      type = 'invoice';
    } else if (record.docu_type === CMS_DOCU_TYPE.contract) {
      type = 'contract';
    } else if (record.docu_type === CMS_DOCU_TYPE.packingList) {
      type = 'packinglist';
    }
    this.context.router.push(`/clearance/settings/resources/templates/${type}/${record.id}`);
  }
  handleDelete = (record) => {
    this.props.deleteInvTemplate(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        this.handleListLoad(this.props.docuType);
      }
    });
  }
  handleListChange = (ev) => {
    if (ev.key === this.props.docuType) {
      return;
    }
    this.setState({
      current: ev.key,
    });
    this.handleListLoad(parseInt(ev.key, 10));
  }
  fileList = [{
    uid: -1,
    name: 'xxx.png',
    status: 'done',
    url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
  }];
  render() {
    const columns = [{
      title: '模板名称',
      dataIndex: 'template_name',
      key: 'template_name',
    }, {
      title: '修改人',
      dataIndex: 'modify_name',
      key: 'modify_name',
    }, {
      title: '最后更新时间',
      dataIndex: 'last_updated_date',
      key: 'last_updated_date',
    }, {
      title: '操作',
      key: 'opt',
      width: 100,
      render: (_, record) => (
        <span>
          <a onClick={() => this.handleEdit(record)}><Icon type="edit" /></a>
          <span className="ant-divider" />
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDelete(record)}><a><Icon type="delete" /></a></Popconfirm>
        </span>),
    }];
    const uploadProps = {
      action: '//jsonplaceholder.typicode.com/posts/',
      listType: 'text',
      defaultFileList: [...this.fileList],
    };
    const excelTemplPopover = (<div style={{ width: 300 }}>
      <Upload {...uploadProps}>
        <Button>
          <Icon type="upload" /> upload
        </Button>
      </Upload></div>);
    return (
      <Layout className="main-wrapper">
        <Sider className="nav-sider">
          <Menu
            selectedKeys={[this.state.current]}
            mode="inline"
            onClick={this.handleListChange}
          >
            <Menu.Item key={JSON.stringify(CMS_DOCU_TYPE.invoice)}>发票模板</Menu.Item>
            <Menu.Item key={JSON.stringify(CMS_DOCU_TYPE.contract)}>合同模板</Menu.Item>
            <Menu.Item key={JSON.stringify(CMS_DOCU_TYPE.packingList)}>箱单模板</Menu.Item>
          </Menu>
        </Sider>
        <Content className="nav-content">
          <div className="nav-content-head">
            <Button type="primary" onClick={this.handleCreateNew} icon="plus-circle-o">新增</Button>
            <Popover placement="bottom" content={excelTemplPopover}>
              <Button icon="file-excel">Excel数据模板 {this.state.excelTemplCount}</Button>
            </Popover>
          </div>
          <div className="panel-body table-panel">
            <Table columns={columns} dataSource={this.props.invTemplates} rowKey="id" />
            <InvTemplateModal customer={this.props.customer} />
          </div>
        </Content>
      </Layout>
    );
  }
}
