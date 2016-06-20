import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Steps, Table, Tabs } from 'ant-ui';
import { SHIPMENT_TRACK_STATUS, TRACKING_POINT_FROM_TYPE } from 'common/constants';
import { renderLoc } from '../../../common/consignLocation';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);
const Step = Steps.Step;
const TabPane = Tabs.TabPane;

const timeFormat = 'YYYY-MM-DD HH:mm';

function rowKeyFn(row) {
  return row.id;
}

function StepDesc(props) {
  const texts = props.texts.filter(txt => txt);
  return texts.length > 0 ? (
    <div>
    {
    texts.map(
      (txt, i) => (
        <div key={`${txt}${i}`}>
          <span>{txt}</span>
          <br />
        </div>
      )
    )
    }
    </div>
  ) : <div style={{ marginBottom: '20px' }} />;
}

StepDesc.propTypes = {
  texts: PropTypes.array.isRequired,
};
@injectIntl
@connect(
  state => ({
    tracking: state.shipment.previewer.tracking,
  })
)
export default class PreviewPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tracking: PropTypes.object.isRequired,
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  columns = [{
    title: this.msg('trackingPoistion'),
    render: (o, record) => {
      return renderLoc(record, 'province', 'city', 'district');
    },
  }, {
    title: this.msg('poistionMode'),
    dataIndex: 'from',
    render: (o, record) => {
      if (record.from === TRACKING_POINT_FROM_TYPE.manual) {
        return this.msg('posModeManual');
      } else if (record.from === TRACKING_POINT_FROM_TYPE.app) {
        return this.msg('posModeApp');
      } else {
        return this.msg('posModeGPS');
      }
    },
  }, {
    title: this.msg('positionTime'),
    dataIndex: 'location_time',
    render: (o, record) => {
      return moment(record.location_time).format('MM-DD HH:mm');
    },
  }]
  pagination={
    current: 1,
    total: this.props.tracking.points.length,
    pageSize: 10,
    size: 'small',
  }
  render() {
    const { tracking } = this.props;
    const trackingSteps = [{
      title: this.msg('trackCreate'),
      desc: (
        <StepDesc texts={[
          tracking.creator,
          tracking.created_date && moment(tracking.created_date).format(timeFormat),
        ]}
        />
      ),
    }];
    let currentStep = 0;
    if (tracking.upstream_status >= SHIPMENT_TRACK_STATUS.unaccepted) {
      trackingSteps.push({
        title: this.msg('trackAccept'),
        desc: (
          <StepDesc texts={[
            tracking.upstream_name,
            tracking.upstream_acpt_time && moment(tracking.upstream_acpt_time).format(timeFormat),
          ]}
          />
        ),
      });
      trackingSteps.push({
        title: this.msg('trackDispatch'),
        desc: (
          <StepDesc texts={[
            tracking.upstream_name,
            tracking.upstream_disp_time && tracking.upstream_status >= SHIPMENT_TRACK_STATUS.undelivered &&
              moment(tracking.upstream_disp_time).format(timeFormat),
          ]}
          />
        ),
      });
      currentStep = tracking.upstream_status - 1;
    }
    if (tracking.downstream_status >= SHIPMENT_TRACK_STATUS.unaccepted) {
      trackingSteps.push({
        title: this.msg('trackAccept'),
        desc: (
          <StepDesc texts={[
            tracking.downstream_name,
            tracking.downstream_acpt_time && moment(tracking.downstream_acpt_time).format(timeFormat),
          ]}
          />
        ),
      });
      trackingSteps.push({
        title: this.msg('trackDispatch'),
        desc: (
          <StepDesc texts={[
            tracking.downstream_name,
            tracking.downstream_disp_time && tracking.downstream_status >= SHIPMENT_TRACK_STATUS.undelivered &&
              moment(tracking.downstream_disp_time).format(timeFormat),
          ]}
          />
        ),
      });
      if (tracking.upstream_status < SHIPMENT_TRACK_STATUS.unaccepted) {
        // 客户查看没有上游
        currentStep = tracking.downstream_status - 1;
      } else {
        currentStep = tracking.downstream_status - 1 + 2;
      }
    }
    trackingSteps.push(
     {
      title: this.msg('trackPickup'),
      desc: (
        <StepDesc texts={[
          tracking.vehicle,
          tracking.pickup_act_date && moment(tracking.pickup_act_date).format(timeFormat),
        ]}
        />
      ),
    }, {
      title: this.msg('trackDeliver'),
      desc: (
        <StepDesc texts={[
          tracking.vehicle,
          tracking.deliver_act_date && moment(tracking.deliver_act_date).format(timeFormat),
        ]}
        />
      ),
    }, {
      title: this.msg('trackPod'),
      desc: (
        <StepDesc texts={[
          tracking.poder,
          tracking.pod_recv_date && moment(tracking.pod_recv_date).format(timeFormat),
        ]}
        />
      ),
    });
    return (
      <div>
        <Tabs tabPosition="left">
          <TabPane tab={this.msg('trackingStepTitle')} key="1">
            <Steps current={currentStep} direction="vertical">
            {
              trackingSteps.map(
                (ts, i) =>
                <Step key={`${ts.title}${i}`} title={ts.title} description={ts.desc} />
              )
            }
            </Steps>
          </TabPane>
          <TabPane tab={this.msg('trackingPoistionTitle')} key="2">
            <Table size="middle" rowKey={rowKeyFn} dataSource={tracking.points} columns={this.columns}
              pagination={this.pagination}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
