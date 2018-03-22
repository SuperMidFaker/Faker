import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Layout, List, Card, message } from 'antd';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { loadPartners } from 'common/reducers/partner';
import { loadBillTemplates, toggleNewTemplateModal } from 'common/reducers/bssBill';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg, formatGlobalMsg } from './message.i18n';
import NewTemplateModal from './modals/newTemplateModal';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    billTemplatelist: state.bssBill.billTemplatelist,
    listFilter: state.bssBill.templateListFilter,
    reload: state.bssBill.templatesReload,
  }),
  {
    toggleNewTemplateModal, loadBillTemplates, loadPartners,
  }
)

export default class BillTemplates extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.handleTemplatesLoad(1);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleTemplatesLoad();
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleCreateTemplate = () => {
    this.props.toggleNewTemplateModal(true);
    this.props.loadPartners({
      role: [PARTNER_ROLES.SUP, PARTNER_ROLES.CUS],
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
  }
  handleTemplatesLoad = (currentPage, filter) => {
    const { listFilter, billTemplatelist: { pageSize, current } } = this.props;
    this.props.loadBillTemplates({
      filter: JSON.stringify(filter || listFilter),
      pageSize,
      current: currentPage || current,
    }).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  handleSearch = (value) => {
    const filter = { ...this.props.listFilter, searchText: value };
    this.handleTemplatesLoad(1, filter);
  }
  render() {
    const { billTemplatelist, listFilter } = this.props;
    const pagination = {
      hideOnSinglePage: true,
      pageSize: Number(billTemplatelist.pageSize),
      current: Number(billTemplatelist.current),
      total: billTemplatelist.total,
      showTotal: total => `共 ${total} 条`,
      onChange: (page, pageSize) => {
        this.props.loadBillTemplates({
          pageSize,
          current: page,
          filter: JSON.stringify(listFilter),
        });
      },
    };
    return (
      <Layout>
        <Layout>
          <PageHeader title={this.msg('billTemplate')}>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.handleCreateTemplate}>
                {this.msg('newBillTemplate')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content layout-fixed-width" key="main">
            <Card bodyStyle={{ padding: 0 }} >
              <List
                dataSource={this.props.billTemplatelist.data}
                header={<SearchBox placeholder={this.msg('searchTip')} onSearch={this.handleSearch} />}
                pagination={pagination}
                renderItem={item => (
                  <List.Item
                    key={item.code}
                    actions={[
                      <span>
                        <RowAction onClick={this.handleEdit} icon="edit" row={item} />
                        <RowAction danger confirm={this.gmsg('deleteConfirm')} onConfirm={this.handleDelete} icon="delete" row={item} />
                      </span>,
                      ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={item.settle_name}
                    />
                  </List.Item>)}
              />
            </Card>
          </Content>
          <NewTemplateModal />
        </Layout>
      </Layout>
    );
  }
}
