import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Button, Upload, Form, Input, Select, Row, Col, notification } from 'antd';
import superagent from 'superagent';
import DockPanel from 'client/components/DockPanel';
import { compareFtzStocks } from 'common/reducers/cwmShFtz';
import { loadNormalRegMSRepos } from 'common/reducers/cwmShFtzDecl';
import { formatMsg } from './message.i18n';

const FormItem = Form.Item;
const { Option } = Select;
const { Dragger } = Upload;

@injectIntl
@connect(
  state => ({
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
    repos: state.cwmShFtzDecl.normalRegMSRepos,
  }),
  { compareFtzStocks, loadNormalRegMSRepos }
)
@Form.create()
export default class QueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    onSearch: PropTypes.func.isRequired,
    filter: PropTypes.shape({ ownerCode: PropTypes.string }),
  }
  state ={
    importPanel: {
      visible: false,
      repo_id: null,
      owner: {},
      ftz_whse_code: null,
      whse_code: null,
      fileList: [],
    },
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse !== this.props.defaultWhse) {
      this.props.form.resetFields();
    }
  }
  msg = formatMsg(this.props.intl);
  handleFormReset = () => {
    this.props.form.resetFields();
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err) => {
      if (!err) {
        const formData = this.props.form.getFieldsValue();
        this.props.onSearch(formData);
      }
    });
  }
  handleCompareTask = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const owner = this.props.owners.filter(own => own.customs_code === values.ownerCode)[0];
        const formData = {
          owner: { name: owner.name, customs_code: owner.customs_code },
          ftz_whse_code: this.props.defaultWhse.ftz_whse_code,
          whse_code: this.props.defaultWhse.code,
        };
        this.props.compareFtzStocks(formData).then((result) => {
          if (result.error) {
            if (result.error.message === 'WHSE_FTZ_UNEXIST') {
              notification.error({
                message: '操作失败',
                description: '仓库监管系统未配置',
              });
            } else {
              notification.error({
                message: '操作失败',
                description: result.error.message,
                duration: 15,
              });
            }
          } else {
            notification.success({
              message: '添加任务成功',
              description: '请至侧边栏查看任务对比进度',
            });
          }
        });
      }
    });
  }
  handleImportMatchTask = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const owner = this.props.owners.filter(own => own.customs_code === values.ownerCode)[0];
        this.props.loadNormalRegMSRepos({
          partner_id: owner.id,
          tenant_id: owner.partner_tenant_id,
        });
        const importPanel = {
          visible: true,
          owner: { name: owner.name, customs_code: owner.customs_code },
          ftz_whse_code: this.props.defaultWhse.ftz_whse_code,
          whse_code: this.props.defaultWhse.code,
          fileList: [],
        };
        this.setState({ importPanel });
      }
    });
  }
  handleImportClose = () => {
    this.setState({ importPanel: { visible: false } });
  }
  handleStockBeforeUpload = (file, fileList) => {
    const importPanel = { ...this.state.importPanel };
    importPanel.fileList = fileList;
    this.setState({ importPanel });
    return false;
  }
  handleCompareImptRepoSelect = (repoId) => {
    const { importPanel } = this.state;
    this.setState({ importPanel: { ...importPanel, repo_id: repoId } });
  }
  handleMatchTaskAction = () => {
    const { importPanel } = this.state;
    const metaData = JSON.stringify({
      owner: importPanel.owner,
      ftz_whse_code: importPanel.ftz_whse_code,
      whse_code: importPanel.whse_code,
      repo_id: importPanel.repo_id,
    });
    const request = superagent.post(`${API_ROOTS.default}v1/cwm/shftz/stock/import/matchcompare`)
      .field('data', metaData);
    importPanel.fileList.forEach((file) => {
      request.attach(file.name, file);
    });
    request.withCredentials()
      .end((err, res) => {
        if (err) {
          if (err.crossDomain) {
            notification.error({ description: '网络断开/服务异常' });
            return;
          }
          notification.error({ message: '错误', description: err.message });
        } else if (res.body.status !== 200) {
          notification.error({ message: '错误', description: res.body.msg });
        } else {
          this.handleImportClose();
          notification.success({
            message: '添加任务成功',
            description: '请至侧边栏查看任务进度',
          });
        }
      });
  }
  render() {
    const {
      form: { getFieldDecorator }, owners, repos, filter,
    } = this.props;
    const { importPanel } = this.state;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    return (
      <Form className="form-layout-compact">
        <Row gutter={16}>
          <Col span={6}>
            <FormItem {...formItemLayout} label={this.msg('owner')}>
              {getFieldDecorator('ownerCode', {
                initialValue: filter.ownerCode,
                rules: [{ required: true }],
              })(<Select showSearch optionFilterProp="children" allowClear>
                {owners.map(owner => (<Option value={owner.customs_code} key={owner.id}>
                  {owner.name}</Option>))}
              </Select>)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label={this.msg('ftzEntNo')}>
              {getFieldDecorator('entNo')(<Input />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              <Button type="primary" onClick={this.handleStockSearch}>{this.msg('inquiry')}</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>{this.msg('reset')}</Button>
              <Button type="primary" ghost icon="plus" style={{ marginLeft: 8 }} onClick={this.handleCompareTask}>发起库存对比</Button>
              <Button type="primary" ghost icon="plus" style={{ marginLeft: 8 }} onClick={this.handleImportMatchTask}>库存导入匹配</Button>
            </FormItem>
          </Col>
        </Row>
        <DockPanel
          title="库位库存监管库存导入匹配"
          size="middle"
          visible={importPanel.visible}
          className="welo-import-data-panel"
          onClose={this.handleImportClose}
        >
          <Button type="primary" onClick={this.handleMatchTaskAction}>发起匹配</Button>
          <Select
            showSearch
            allowClear
            style={{ width: '100%', marginTop: 20 }}
            placeholder="物料归类库"
            onChange={this.handleCompareImptRepoSelect}
          >
            {repos.map(rep =>
              <Option value={String(rep.id)} key={rep.owner_name}>{rep.owner_name}</Option>)}
          </Select>
          <div style={{ height: 200, marginBottom: 16, marginTop: 20 }}>
            <Dragger
              accept=".xls,.xlsx,.csv"
              beforeUpload={this.handleStockBeforeUpload}
              fileList={importPanel.fileList}
              multiple
            >
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">点击或拖拽文件至此区域上传</p>
            </Dragger>
          </div>
        </DockPanel>
      </Form>
    );
  }
}
