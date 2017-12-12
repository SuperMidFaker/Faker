import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Icon, Layout, notification } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import AdaptorModal from './modal/adaptorModal';
import AdaptorDetailModal from './modal/adaptorDetailModal';
import ExcelUploader from 'client/components/ExcelUploader';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadAdaptors, loadAdaptor, showAdaptorDetailModal, delAdaptor, showAdaptorModal } from 'common/reducers/saasLineFileAdaptor';
import { loadPartners } from 'common/reducers/partner';
import messages from './message.i18n';
import { PARTNER_ROLES } from 'common/constants';

const formatMsg = format(messages);
const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
    adaptors: state.saasLineFileAdaptor.adaptors,
    customers: state.partner.partners,
  }),
  { showAdaptorModal, loadAdaptors, loadPartners, loadAdaptor, showAdaptorDetailModal, delAdaptor }
)

export default class ApiAuthList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,

  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    avatar: '',
  }
  componentWillMount() {
    this.props.loadAdaptors();
    this.props.loadPartners({
      role: PARTNER_ROLES.CUS,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values);
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleEditBtnClick = (edit) => {
    this.props.showAdaptorDetailModal();
    this.props.loadAdaptor(edit.code);
  }
  handleDel = (record) => {
    this.props.delAdaptor(record.code).then((result) => {
      if (result.error) {
        notification.error({ description: result.error.message });
      } else {
        this.props.loadAdaptors();
      }
    });
  }
  handleUploaded = () => {
    this.props.loadAdaptors();
  }
  columns = [{
    title: this.msg('适配器名称'),
    dataIndex: 'name',
    width: 200,
  }, {
    title: this.msg('适配对象'),
    width: 250,
    dataIndex: 'biz_model',
  }, {
    title: this.msg('适用范围'),
    dataIndex: 'owner_partner_id',
    render: (o) => {
      if (o) {
        return this.props.customers.find(cus => cus.id === o).name;
      } else {
        return '全局';
      }
    },
  }, {
    title: this.msg('操作'),
    width: 150,
    render: (_, record) => {
      let editDiv = null;
      if (record.active) {
        editDiv = (<PrivilegeCover module="clearance" feature="resources" action="edit">
          <RowAction icon="edit" onClick={this.handleEditBtnClick} row={record} />
        </PrivilegeCover>);
      } else {
        editDiv = (<ExcelUploader endpoint={`${API_ROOTS.default}v1/saas/line/file/upload/example`}
          formData={{ data: JSON.stringify({ code: record.code }) }} onUploaded={this.handleUploaded}
        >
          <RowAction icon="cloud-upload-o" tooltip="上传只有两行示例内容的Excel文件" />
        </ExcelUploader>);
      }
      return (<span>
        {editDiv}
        <PrivilegeCover module="clearance" feature="resources" action="delete">
          <RowAction danger confirm="确定要删除吗？" onConfirm={this.handleDel} icon="delete" row={record} />
        </PrivilegeCover>
      </span>
      );
    },
  }];

  handleAddWarehouse = () => {
    this.props.showAdaptorModal();
  }
  render() {
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="usb" /> 数据适配
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <PageHint />
            <Button type="primary" icon="plus" onClick={this.handleAddWarehouse}>
              {this.msg('create')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            columns={this.columns} dataSource={this.props.adaptors} rowKey="id"
          />
        </Content>
        <AdaptorModal />
        <AdaptorDetailModal />
      </div>
    );
  }
}
