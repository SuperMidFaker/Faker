import React from 'react';
import PropTypes from 'prop-types';
import { mount, shallow } from 'enzyme';
import { combineReducers } from 'redux';
import createReduxStore from 'common/createReduxStore';
import cwmOutbound from 'common/reducers/cwmOutbound';
import cwmContext from 'common/reducers/cwmContext';
import cwmWarehouse from 'common/reducers/cwmWarehouse';
import account from 'common/reducers/account';
import AllocatingModal from '../allocatingModal';

const reducers = combineReducers({
  cwmOutbound,
  cwmContext,
  cwmWarehouse,
  account,
});
const superagent = require('superagent');

jest.mock('client/apps/cwm/common/popover/unfreezePopover', () => () => 'unfreezePopover');
jest.mock('client/apps/cwm/common/popover/allocatedPopover', () => () => 'unfreezePopover');
jest.mock('client/apps/cwm/common/locationSelect', () => () => 'LocationSelect');
jest.mock('client/components/EditableCell', () => () => 'EditableCell');
jest.mock('client/components/trimSpan', () => () => 'trimSpan');
jest.mock('client/common/i18n/helpers', () => ({
  formati18n(messages) {
    return intl => (descriptor, values) => {
      if (!messages[descriptor]) {
        return descriptor;
      }
      return intl.formatMessage(messages[descriptor], values);
    };
  },
}));

describe('AllocatingModal', () => {
  const props = {
    editable: false,
  };
  let wrapper;
  let store;
  beforeEach(() => {
    store = createReduxStore({}, reducers);
    wrapper = shallow(
      <AllocatingModal.WrappedComponent {...props} />,
      {
        context: { store },
        // childContextTypes: {
        //   store: PropTypes.any,
        // },
      }
    ).dive();
    superagent.mockApi([{
      url: 'v1/cwm/whse/limit/locations',
      resp: [{
        location: 'JG1508', type: '', status: '1', id: 1,
      }],
      err: null,
    },
    {
      url: 'v1/cwm/warehouse/zone/load',
      resp: [{ zone_code: '1', zone_name: '2', id: 1 }],
      err: null,
    },
    {
      url: 'v1/cwm/product/inbound/details',
      resp: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }],
      err: null,
    },
    ], '');
  });
  it('render', () => {
    wrapper.setProps({ visible: true });
    expect(wrapper.find('Modal')).toHaveLength(1);
  });
  it('when visible is true componentWillRecieveProps be triggered', () => {
    wrapper.setProps({ visible: true, outboundProduct: { outbound_no: '1' } });
    expect(wrapper.state().outboundProduct).toEqual({ outbound_no: '1' });
  });
  it('when inventoryData changed componentWillRecieveProps be triggered', () => {
    wrapper.setProps({
      inventoryData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }],
      visible: true,
    });
    expect(wrapper.state().inventoryData).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
    }]);
    expect(wrapper.state().originData).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
    }]);
    expect(wrapper.find('Table').first().props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
    }]);
  });
  it('when allocatedData changed componentWillRecieveProps be triggered', () => {
    wrapper.setProps({
      allocatedData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 20,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }],
      visible: true,
    });
    expect(wrapper.state().allocatedData).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 20,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_qty: 20,
      allocated_pack_qty: 20,
      alloced: true,
    }]);
    expect(wrapper.find('Table').last().props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 20,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_qty: 20,
      allocated_pack_qty: 20,
      alloced: true,
    }]);
  });
  it('close and cancel action will clear inventoryData and allocatedData', () => {
    wrapper.setProps({
      inventoryData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
      }],
      allocatedData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
      }],
      visible: true,
    });
    wrapper.setProps({ editable: false });
    shallow(wrapper.find('Modal').props().title.props.children[1]).find('Button').simulate('click');
    expect(wrapper.state().inventoryData).toEqual([]);
    expect(wrapper.state().allocatedData).toEqual([]);
    wrapper.setProps({
      inventoryData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
      }],
      allocatedData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
      }],
    });
    wrapper.setProps({ editable: true });
    shallow(wrapper.find('Modal').props().title.props.children[1]).find('Button').first().simulate('click');
    expect(wrapper.state().inventoryData).toEqual([]);
    expect(wrapper.state().allocatedData).toEqual([]);
  });
  it('allocated and remove success', () => {
    wrapper.setProps({ editable: true, visible: true });
    wrapper.setState({
      originData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }],
      inventoryData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }],
      outboundProduct: {
        alloc_pack_qty: 0,
        alloc_qty: 0,
        external_lot_no: null,
        id: 4749,
        name: '前铲装载机轮子',
        order_pack_qty: 10,
        order_qty: 10,
        outbound_no: 'SO1804UH000154-1',
        picked_qty: 0,
        po_no: null,
        product_no: 'BG00231934',
        seq_no: '1',
        serial_no: null,
        sku_pack_qty: 1,
        supplier: null,
        unit: '007',
        virtual_whse: null,
      },
    });
    const inventoryTable = mount(wrapper.find('Table').first().get(0));
    // antd fixed 会生成两份tableRow last()只会获取fixed的内容
    inventoryTable.find('TableRow').first().find('Input').first()
      .simulate('change', { target: { value: 1 } });
    wrapper.update();
    expect(shallow(wrapper.find('Table').first().dive().props().children.props.children[1]).props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_qty: 1,
      allocated_pack_qty: 1,
    }]);
    inventoryTable.find('TableRow').last().find('Button').simulate('click');
    wrapper.update();
    expect(shallow(wrapper.find('Table').last().dive().props().children.props.children[1]).props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_qty: 1,
      allocated_pack_qty: 1,
    }]);
    const allocatedTable = mount(wrapper.find('Table').last().get(0));
    allocatedTable.find('TableRow').last().find('Button').simulate('click');
    wrapper.update();
    expect(shallow(wrapper.find('Table').first().dive().props().children.props.children[1]).props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_qty: null,
      allocated_pack_qty: null,
    }]);
  });
  it('outboundeHead is right', () => {
    wrapper.setProps({ visible: true });
    wrapper.setState({
      outboundProduct: {
        alloc_pack_qty: 0,
        alloc_qty: 0,
        external_lot_no: null,
        id: 4749,
        name: '前铲装载机轮子',
        order_pack_qty: 10,
        order_qty: 10,
        outbound_no: 'SO1804UH000154-1',
        picked_qty: 0,
        po_no: null,
        product_no: 'BG00231934',
        seq_no: '1',
        serial_no: null,
        sku_pack_qty: 1,
        supplier: null,
        unit: '007',
        virtual_whse: null,
      },
      outboundProducts: [{
        alloc_pack_qty: 0,
        alloc_qty: 0,
        external_lot_no: null,
        id: 4749,
        name: '前铲装载机轮子',
        order_pack_qty: 10,
        order_qty: 10,
        outbound_no: 'SO1804UH000154-1',
        picked_qty: 0,
        po_no: null,
        product_no: 'BG00231934',
        seq_no: '1',
        serial_no: null,
        sku_pack_qty: 1,
        supplier: null,
        unit: '007',
        virtual_whse: null,
      }],
    });
    expect(wrapper.find('Card').first().find('Select').props().value).toEqual('BG00231934');
    expect(mount(wrapper.find('Card').first().find('InfoItem').first()
      .get(0))
      .find('span').props().children[1]).toEqual('前铲装载机轮子');
    const orderInfoItem = mount(wrapper.find('Card').first().find('InfoItem').at(1)
      .props().field);
    expect(orderInfoItem.find('Input').at(0).props().value).toEqual(10);
    expect(orderInfoItem.find('Input').at(1).props().value).toEqual(10);
    const allocatedInfoItem = mount(wrapper.find('Card').first().find('InfoItem').at(2)
      .props().field);
    expect(allocatedInfoItem.find('Input').at(0).props().value).toEqual(0);
    expect(allocatedInfoItem.find('Input').at(1).props().value).toEqual(0);
  });
  it('search filters is right', () => {
    wrapper.setProps({ visible: true, outboundHead: { alloc_rules: [] } });
    const searchFrom = mount(wrapper.find('Card').at(1).props().extra, {
      context: { store },
      childContextTypes: {
        store: PropTypes.any,
      },
    });
    wrapper.setProps({
      filters: {
        location: '', startTime: '', endTime: '', searchType: 'external_lot_no',
      },
      outboundHead: {
        bonded: 0,
        alloc_rules: [],
      },
    });
    /**
     * siumlate 无法触发onSelect 在获取react实例之后调用
     */
    // mount(searchFrom.find('Search').first().props().addonBefore).simulate('select', 'asn_no')
    mount(searchFrom.find('Search').first().props().addonBefore).instance().props.onSelect('asn_no');
    expect(wrapper.state().filters).toEqual({
      location: '', startTime: '', endTime: '', searchType: 'asn_no',
    });
    expect(wrapper.state().filterInventoryColumns).toHaveLength(10);
    /**
     * TODO
     * 1.需要mock一个有支持测试的LocationSelect
     */
    // mount(searchFrom.find('LocationSelect').get(0)).props().onChange('XA0721A');
    // expect(wrapper.state().filters).toEqual({
    // location: 'XA0721A', startTime: '', endTime: '', searchType: 'asn_no' })
  });
  it('对同一条库存记录分配两次', () => {
    wrapper.setProps({ editable: true, visible: true });
    wrapper.setState({
      originData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }],
      inventoryData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }],
      outboundProduct: {
        alloc_pack_qty: 0,
        alloc_qty: 0,
        external_lot_no: null,
        id: 4749,
        name: '前铲装载机轮子',
        order_pack_qty: 10,
        order_qty: 10,
        outbound_no: 'SO1804UH000154-1',
        picked_qty: 0,
        po_no: null,
        product_no: 'BG00231934',
        seq_no: '1',
        serial_no: null,
        sku_pack_qty: 1,
        supplier: null,
        unit: '007',
        virtual_whse: null,
      },
    });
    const inventoryTable = mount(wrapper.find('Table').first().get(0));
    inventoryTable.find('TableRow').first().find('Input').first()
      .simulate('change', { target: { value: 1 } });
    inventoryTable.find('TableRow').last().find('Button').simulate('click');
    inventoryTable.find('TableRow').first().find('Input').first()
      .simulate('change', { target: { value: 1 } });
    inventoryTable.find('TableRow').last().find('Button').simulate('click');
    expect(shallow(wrapper.find('Table').first().dive().props().children.props.children[1]).props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 2,
      avail_qty: 138,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_pack_qty: null,
      allocated_qty: null,
    }]);
    wrapper.update();
    expect(shallow(wrapper.find('Table').last().dive().props().children.props.children[1]).props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_pack_qty: 2,
      allocated_qty: 2,
    }]);
  });
  it('从多条库存记录中进行分配', () => {
    wrapper.setProps({ editable: true, visible: true });
    wrapper.setState({
      originData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }, {
        trace_id: '0963I18020000013702',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809014000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 50,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 50,
        avail_pack_qty: 50,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032925',
        priority: 1,
      }],
      inventoryData: [{
        trace_id: '0963I18020000013701',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809013000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 140,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 140,
        avail_pack_qty: 140,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032927',
        priority: 1,
      }, {
        trace_id: '0963I18020000013702',
        product_no: 'BG00231934',
        product_sku: 'BG00231934',
        sku_pack_qty: 1,
        name: '前铲装载机轮子',
        location: 'XA0721A',
        virtual_whse: null,
        inbound_timestamp: 1517809014000,
        damage_level: 0,
        bonded: 0,
        ftz_ent_filed_id: null,
        portion: 0,
        ftz_ent_no: null,
        in_cus_decl_no: null,
        stock_qty: 50,
        frozen_qty: 0,
        alloc_qty: 0,
        avail_qty: 50,
        avail_pack_qty: 50,
        external_lot_no: null,
        serial_no: null,
        po_no: null,
        asn_no: 'RN1802MQ032925',
        priority: 1,
      }],
      outboundProduct: {
        alloc_pack_qty: 0,
        alloc_qty: 0,
        external_lot_no: null,
        id: 4749,
        name: '前铲装载机轮子',
        order_pack_qty: 10,
        order_qty: 10,
        outbound_no: 'SO1804UH000154-1',
        picked_qty: 0,
        po_no: null,
        product_no: 'BG00231934',
        seq_no: '1',
        serial_no: null,
        sku_pack_qty: 1,
        supplier: null,
        unit: '007',
        virtual_whse: null,
      },
    });
    const inventoryTable = mount(wrapper.find('Table').first().get(0));
    inventoryTable.find('TableRow').at(0).find('Input').first()
      .simulate('change', { target: { value: 1 } });
    inventoryTable.find('TableRow').at(2).find('Button').simulate('click');
    inventoryTable.find('TableRow').at(1).find('Input').first()
      .simulate('change', { target: { value: 1 } });
    inventoryTable.find('TableRow').at(3).find('Button').simulate('click');
    expect(shallow(wrapper.find('Table').first().dive().props().children.props.children[1]).props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 1,
      avail_qty: 139,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_pack_qty: null,
      allocated_qty: null,
    },
    {
      trace_id: '0963I18020000013702',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809014000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 50,
      frozen_qty: 0,
      alloc_qty: 1,
      avail_qty: 49,
      avail_pack_qty: 50,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032925',
      priority: 1,
      allocated_pack_qty: null,
      allocated_qty: null,
    }]);
    wrapper.update();
    expect(shallow(wrapper.find('Table').last().dive().props().children.props.children[1]).props().dataSource).toEqual([{
      trace_id: '0963I18020000013701',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809013000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 140,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 140,
      avail_pack_qty: 140,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032927',
      priority: 1,
      allocated_pack_qty: 1,
      allocated_qty: 1,
    },
    {
      trace_id: '0963I18020000013702',
      product_no: 'BG00231934',
      product_sku: 'BG00231934',
      sku_pack_qty: 1,
      name: '前铲装载机轮子',
      location: 'XA0721A',
      virtual_whse: null,
      inbound_timestamp: 1517809014000,
      damage_level: 0,
      bonded: 0,
      ftz_ent_filed_id: null,
      portion: 0,
      ftz_ent_no: null,
      in_cus_decl_no: null,
      stock_qty: 50,
      frozen_qty: 0,
      alloc_qty: 0,
      avail_qty: 50,
      avail_pack_qty: 50,
      external_lot_no: null,
      serial_no: null,
      po_no: null,
      asn_no: 'RN1802MQ032925',
      priority: 1,
      allocated_pack_qty: 1,
      allocated_qty: 1,
    }]);
  });
});
