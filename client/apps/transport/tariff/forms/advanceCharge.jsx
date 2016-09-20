import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Card, Row, Col, Form, Input, Cascader, Button, message } from 'antd';
import Table from 'client/components/remoteAntTable';
import { addAdvanceCharge, loadAdvanceCharges, removeAdvanceCharge } from 'common/reducers/transportTariff';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    advanceChargeList: state.transportTariff.advanceChargeList,
    tariffId: state.transportTariff.tariffId,
  }),
  { addAdvanceCharge, loadAdvanceCharges, removeAdvanceCharge }
)
@Form.create()
export default class AdvanceChargeForm extends React.Component {
  static propTypes = {
    advanceChargeList: PropTypes.object.isRequired,
    addAdvanceCharge: PropTypes.func.isRequired,
    loadAdvanceCharges: PropTypes.func.isRequired,
    removeAdvanceCharge: PropTypes.func.isRequired,
    tariffId: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const { tariffId, advanceChargeList: { pageSize, current } } = this.props;
    this.props.loadAdvanceCharges({
      tariffId,
      pageSize,
      current,
    });
  }
  handleSubmitAdvanceCharge = (e) => {
    e.preventDefault();
    const { tariffId, form } = this.props;
    const fieldsValue = form.getFieldsValue();
    if (!fieldsValue.category) {
      message.error('请选择类别');
    } else if (!fieldsValue.name) {
      message.error('请填写垫付费用名称');
    } else {
      this.props.addAdvanceCharge(tariffId, {
        name: fieldsValue.name,
        category1: fieldsValue.category[0],
        category2: fieldsValue.category[1],
      }).then((result) => {
        if (result.error) {
          message.error(result.error.message);
        }
      });
    }
  }
  handleRemoveAdvanceCharge = (advanceChargeId) => {
    this.props.removeAdvanceCharge(advanceChargeId).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const { tariffId, advanceChargeList: { pageSize, current } } = this.props;
        this.props.loadAdvanceCharges({ tariffId, pageSize, current });
      }
    });
  }
  render() {
    const { tariffId, form: { getFieldProps } } = this.props;
    const columns = [{
      title: '总项',
      dataIndex: 'category1',
    }, {
      title: '分项',
      dataIndex: 'category2',
    }, {
      title: '名称',
      dataIndex: 'name',
    }, {
      title: '操作',
      dataIndex: 'defaultType',
      render: (o, record) => {
        if (!o) {
          return (<a onClick={() => this.handleRemoveAdvanceCharge(record._id)}>删除</a>);
        }
        return '';
      },
    }];
    const dataSource = new Table.DataSource({
      fetcher: params => this.props.loadAdvanceCharges(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: resolve(result.totalCount, result.current, result.pageSize),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: result.pageSize,
      }),
      getParams: (pagination) => {
        const params = {
          tariffId,
          pageSize: pagination.pageSize,
          current: pagination.current,
        };
        return params;
      },
      remotes: this.props.advanceChargeList,
    });
    const options = [{
      value: '运输',
      label: '运输',
      children: [{
        value: '散货',
        label: '散货',
      }, {
        value: '集装箱',
        label: '集装箱',
      }, {
        value: '运输通用',
        label: '运输通用',
      }],
    }];

    const formItemLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 12 },
    };
    return (
        <div className="panel-body" style={{ padding: '0 16px' }}>
          <Row>
            <Col span={12}>
              <Card style={{ marginRight: 10 }}>
                <Table size="small" dataSource={dataSource} columns={columns} rowKey="_id" />
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ marginLeft: 10 }}>
                <Form onSubmit={this.handleSubmitAdvanceCharge}>
                 <FormItem
                   {...formItemLayout}
                   label="类别"
                 >
                  <Cascader options={options} placeholder="请选择类别"
                    {...getFieldProps('category')}
                  />
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="名称"
                >
                  <Input placeholder="请输入垫付费用名称"
                    {...getFieldProps('name')}
                  />
                </FormItem>
                <FormItem wrapperCol={{ span: 12, offset: 7 }}>
                  <Button htmlType="submit" type="primary">
                    添加
                  </Button>
                </FormItem>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
    );
  }
}
