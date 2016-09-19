import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { Card, Row, Col, Form, Table } from 'antd';
import { submitSurcharges } from 'common/reducers/transportTariff';

@injectIntl
@connect(
  state => ({
    advanceChargeList: state.transportTariff.advanceChargeList,
    tariffId: state.transportTariff.tariffId,
  }),
  { submitSurcharges }
)
@Form.create()
export default class AdvanceChargeForm extends React.Component {
  static propTypes = {
    advanceChargeList: PropTypes.array.isRequired,
    submitSurcharges: PropTypes.func.isRequired,
    tariffId: PropTypes.string.isRequired,
  }

  handleSave = () => {

  }

  render() {
    const { advanceChargeList } = this.props;
    const columns = [{
      title: '总项',
      dataIndex: 'name',
    }, {
      title: '分项',
      dataIndex: 'phone',
    }, {
      title: '名称',
      dataIndex: 'nickname',
    }, {
      title: '操作',
      dataIndex: 'disabled',
      width: '10%',
      render: (text, record) => {
        return (
          <span>
            <a onClick={() => { this.props.removeNodeUser(record.id, record.login_id); }}>删除</a>
          </span>
        );
      },
    }];
    return (
        <div className="panel-body" style={{ padding: '0 16px' }}>
          <Row>
            <Col span={12}>
              <Card style={{ marginRight: 10 }}>
                <Table dataSource={advanceChargeList} columns={columns} />
              </Card>
            </Col>
            <Col span={12}>
              <Card style={{ marginLeft: 10 }}>

              </Card>
            </Col>
          </Row>
        </div>
    );
  }
}
