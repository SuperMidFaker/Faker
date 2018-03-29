import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Avatar, Button, Layout, notification, List, Card } from 'antd';
import { PARTNER_ROLES, LINE_FILE_ADAPTOR_MODELS } from 'common/constants';
import { loadPartners } from 'common/reducers/partner';
import { loadAdaptors, loadAdaptor, showAdaptorDetailModal, delAdaptor, showAdaptorModal } from 'common/reducers/hubDataAdapter';
import ExcelUploader from 'client/components/ExcelUploader';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import AdaptorModal from './modal/adaptorModal';
import AdaptorDetailModal from './modal/adaptorDetailModal';
import HubSiderMenu from '../menu';
import { formatMsg } from './message.i18n';

const { Content } = Layout;
const impModels = Object.values(LINE_FILE_ADAPTOR_MODELS);

@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
    adaptors: state.hubDataAdapter.adaptorList,
    customers: state.partner.partners,
    pageSize: state.hubDataAdapter.adaptorList.pageSize,
    current: state.hubDataAdapter.adaptorList.current,
    filter: state.hubDataAdapter.filter,
  }),
  {
    showAdaptorModal, loadAdaptors, loadPartners, loadAdaptor, showAdaptorDetailModal, delAdaptor,
  }
)

export default class LineFileAdapterList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadAdaptors('', '', this.props.pageSize, 1, this.props.filter);
    this.props.loadPartners({
      role: PARTNER_ROLES.CUS,
    });
  }
  msg = formatMsg(this.props.intl)
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
        this.handleReload();
      }
    });
  }
  handleUploaded = () => {
    this.handleReload();
  }
  handleCreateAdapter = () => {
    this.props.showAdaptorModal();
  }
  handleReload = () => {
    const { pageSize, current, filter } = this.props;
    this.props.loadAdaptors('', '', pageSize, current, filter);
  }
  handleSearch = (value) => {
    const { pageSize, current } = this.props;
    const filter = { ...this.props.filter, searchText: value };
    this.props.loadAdaptors('', '', pageSize, current, filter);
  }
  render() {
    const { adaptors, filter } = this.props;
    const pagination = {
      hideOnSinglePage: true,
      pageSize: Number(adaptors.pageSize),
      current: Number(adaptors.current),
      total: adaptors.total,
      showTotal: total => `共 ${total} 条`,
      onChange: (page, pageSize) => {
        this.props.loadAdaptors('', '', pageSize, page, filter);
      },
    };
    return (
      <Layout>
        <HubSiderMenu currentKey="adapter" />
        <Layout>
          <PageHeader title={this.msg('adapter')}>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleCreateAdapter}>
                {this.msg('create')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content layout-fixed-width" key="main">
            <Card bodyStyle={{ padding: 0 }} >
              <List
                dataSource={this.props.adaptors.data}
                header={<SearchBox placeholder={this.msg('searchTip')} onSearch={this.handleSearch} />}
                pagination={pagination}
                renderItem={(item) => {
                  let action = null;
                  if (item.active) {
                    action = <RowAction size="default" onClick={this.handleEditBtnClick} icon="setting" tooltip={this.msg('config')} row={item} />;
                  } else {
                    action = (<ExcelUploader
                      endpoint={`${API_ROOTS.default}v1/saas/line/file/upload/example`}
                      formData={{ data: JSON.stringify({ code: item.code }) }}
                      onUploaded={this.handleUploaded}
                    >
                      <RowAction size="default" icon="cloud-upload-o" tooltip="上传至少有两行示例内容的Excel文件" />
                    </ExcelUploader>);
                  }
                  const bizModel = impModels.find(model => model.key === item.biz_model);
                  return (
                    <List.Item
                      key={item.code}
                      actions={[<span>{action}<RowAction danger size="default" icon="delete" confirm="确定删除?" onConfirm={this.handleDel} row={item} /></span>]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar shape="square" icon="file-excel" style={{ backgroundColor: '#3e7b51' }} />}
                        title={item.name}
                        description={bizModel && bizModel.name}
                      />
                    </List.Item>);
                  }}
              />
            </Card>
          </Content>
          <AdaptorModal />
          <AdaptorDetailModal reload={this.handleReload} />
        </Layout>
      </Layout>
    );
  }
}
