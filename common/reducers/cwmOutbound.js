import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import { CANCEL_OUTBOUND_SUCCEED, CLOSE_OUTBOUND_SUCCEED } from './cwmShippingOrder';

const actionTypes = createActionTypes('@@welogix/cwm/outbound/', [
  'OPEN_ALLOCATING_MODAL', 'CLOSE_ALLOCATING_MODAL',
  'OPEN_PICKING_MODAL', 'CLOSE_PICKING_MODAL',
  'OPEN_SHIPPING_MODAL', 'CLOSE_SHIPPING_MODAL', 'SHOW_SPCPMODAL',
  'LOAD_OUTBOUNDS', 'LOAD_OUTBOUNDS_SUCCEED', 'LOAD_OUTBOUNDS_FAIL',
  'LOAD_OUTBOUND_HEAD', 'LOAD_OUTBOUND_HEAD_SUCCEED', 'LOAD_OUTBOUND_HEAD_FAIL',
  'LOAD_OUTBOUND_PRODUCTS', 'LOAD_OUTBOUND_PRODUCTS_SUCCEED', 'LOAD_OUTBOUND_PRODUCTS_FAIL',
  'LOAD_PRODUCT_INBOUND_DETAILS', 'LOAD_PRODUCT_INBOUND_DETAILS_SUCCEED', 'LOAD_PRODUCT_INBOUND_DETAILS_FAIL',
  'AUTO_ALLOC', 'AUTO_ALLOC_SUCCEED', 'AUTO_ALLOC_FAIL',
  'MANUAL_ALLOC', 'MANUAL_ALLOC_SUCCEED', 'MANUAL_ALLOC_FAIL',
  'CANCEL_PRDALLOC', 'CANCEL_PRDALLOC_SUCCEED', 'CANCEL_PRDALLOC_FAIL',
  'LOAD_PICK_DETAILS', 'LOAD_PICK_DETAILS_SUCCEED', 'LOAD_PICK_DETAILS_FAIL',
  'LOAD_PPICK_DETAILS', 'LOAD_PPICK_DETAILS_SUCCEED', 'LOAD_PPICK_DETAILS_FAIL',
  'LOAD_ALLOCATED_DETAILS', 'LOAD_ALLOCATED_DETAILS_SUCCEED', 'LOAD_ALLOCATED_DETAILS_FAIL',
  'OUTBOUNDS_PICK', 'OUTBOUNDS_PICK_SUCCEED', 'OUTBOUNDS_PICK_FAIL',
  'UNDO_PICKED', 'UNDO_PICKED_SUCCEED', 'UNDO_PICKED_FAIL',
  'OUTBOUNDS_SHIP', 'OUTBOUNDS_SHIP_SUCCEED', 'OUTBOUNDS_SHIP_FAIL',
  'CONFIRM_BATCHSOSHIP', 'CONFIRM_BATCHSOSHIP_SUCCEED', 'CONFIRM_BATCHSOSHIP_FAIL',
  'CANCEL_TRACE_ALLOC', 'CANCEL_TRACE_ALLOC_SUCCEED', 'CANCEL_TRACE_ALLOC_FAIL',
  'UPDATE_OUTBMODE', 'UPDATE_OUTBMODE_SUCCEED', 'UPDATE_OUTBMODE_FAIL',
  'LOAD_PACK_DETAILS', 'LOAD_PACK_DETAILS_SUCCEED', 'LOAD_PACK_DETAILS_FAIL',
  'LOAD_PACKNO_DETAILS', 'LOAD_PACKNO_DETAILS_SUCCEED', 'LOAD_PACKNO_DETAILS_FAIL',
  'LOAD_SHIP_DETAILS', 'LOAD_SHIP_DETAILS_SUCCEED', 'LOAD_SHIP_DETAILS_FAIL',
  'READ_LOGO', 'READ_LOGO_SUCCEED', 'READ_LOGO_FAIL',
  'ORDER_EXPRESS', 'ORDER_EXPRESS_SUCCEED', 'ORDER_EXPRESS_FAIL',
  'ORDER_ZD_EXPRESS', 'ORDER_ZD_EXPRESS_SUCCEED', 'ORDER_ZD_EXPRESS_FAIL',
  'SFEXPRESS_MODAL',
  'LOAD_SFEXPRESS', 'LOAD_SFEXPRESS_SUCCEED', 'LOAD_SFEXPRESS_FAIL',
  'LOAD_SFEXPRESS_CONFIG', 'LOAD_SFEXPRESS_CONFIG_SUCCEED', 'LOAD_SFEXPRESS_CONFIG_FAIL',
  'LOAD_TRACEIDALLOCD', 'LOAD_TRACEIDALLOCD_SUCCEED', 'LOAD_TRACEIDALLOCD_FAIL',
  'EXPORT_NEBSO', 'EXPORT_NEBSO_SUCCEED', 'EXPORT_NEBSO_FAIL',
]);

const initialState = {
  submitting: false,
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
    shipment_no: '',
  },
  allocatingModal: {
    visible: false,
    outboundNo: '',
    outboundProduct: {},
  },
  inventoryData: [],
  inventoryColumns: {
    external_lot_no: true,
    serial_no: false,
    po_no: false,
    asn_no: false,
    ftz_ent_no: false,
    cus_decl_no: false,
  },
  allocatedData: [],
  pickingModal: {
    visible: false,
    traceId: '',
    location: '',
    skuPackQty: '',
    allocQty: '',
    id: '',
  },
  shippingModal: {
    visible: false,
    id: '',
    pickedQty: '',
    skuPackQty: '',
  },
  subarPickChkModal: {
    visible: false,
  },
  outbound: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: true,
    loaded: true,
  },
  outboundFilters: { status: 'all', ownerCode: 'all' },
  outboundFormHead: { alloc_rules: [] },
  outboundProducts: [],
  outboundReload: false,
  pickDetails: [],
  packDetails: [],
  shipDetails: [],
  inventoryDataLoading: false,
  allocatedDataLoading: false,
  waybill: {},
  SFExpressModal: {
    visible: false,
    config: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_ALLOCATING_MODAL:
      return {
        ...state,
        allocatingModal: { ...state.allocatingModal, visible: true, ...action.data },
      };
    case actionTypes.CLOSE_ALLOCATING_MODAL:
      return { ...state, allocatingModal: { ...state.allocatingModal, visible: false } };
    case actionTypes.OPEN_PICKING_MODAL:
      return {
        ...state,
        pickingModal: {
          visible: true,
          traceId: action.traceId,
          location: action.location,
          allocQty: action.allcoQty,
          skuPackQty: action.skuPackQty,
          id: action.id,
        },
      };
    case actionTypes.CLOSE_PICKING_MODAL:
      return { ...state, pickingModal: { visible: false } };
    case actionTypes.OPEN_SHIPPING_MODAL:
      return {
        ...state,
        shippingModal: {
          visible: true, id: action.id, pickedQty: action.pickedQty, skuPackQty: action.skuPackQty,
        },
      };
    case actionTypes.CLOSE_SHIPPING_MODAL:
      return { ...state, shippingModal: { visible: false } };
    case actionTypes.SHOW_SPCPMODAL:
      return { ...state, subarPickChkModal: action.data };
    case actionTypes.LOAD_OUTBOUNDS:
      return {
        ...state,
        outboundFilters: JSON.parse(action.params.filters),
        outbound: { ...state.outbound, loading: true },
      };
    case actionTypes.LOAD_OUTBOUNDS_SUCCEED:
      return { ...state, outbound: { ...action.result.data, loading: false, loaded: true } };
    case actionTypes.LOAD_OUTBOUND_HEAD_SUCCEED:
      return { ...state, outboundFormHead: action.result.data, outboundReload: false };
    case actionTypes.LOAD_OUTBOUND_PRODUCTS_SUCCEED:
      return { ...state, outboundProducts: action.result.data };
    case actionTypes.LOAD_PRODUCT_INBOUND_DETAILS:
      return { ...state, inventoryDataLoading: true };
    case actionTypes.LOAD_PRODUCT_INBOUND_DETAILS_SUCCEED:
      return { ...state, inventoryData: action.result.data, inventoryDataLoading: false };
    case actionTypes.MANUAL_ALLOC:
    case actionTypes.AUTO_ALLOC:
    case actionTypes.CANCEL_TRACE_ALLOC:
    case actionTypes.CANCEL_PRDALLOC:
    case actionTypes.OUTBOUNDS_PICK:
    case actionTypes.UNDO_PICKED:
    case actionTypes.OUTBOUNDS_SHIP:
    case actionTypes.CONFIRM_BATCHSOSHIP:
      return { ...state, submitting: true };
    case actionTypes.MANUAL_ALLOC_FAIL:
    case actionTypes.AUTO_ALLOC_FAIL:
    case actionTypes.CANCEL_TRACE_ALLOC_FAIL:
    case actionTypes.CANCEL_PRDALLOC_FAIL:
    case actionTypes.OUTBOUNDS_PICK_FAIL:
    case actionTypes.UNDO_PICKED_FAIL:
    case actionTypes.OUTBOUNDS_SHIP_FAIL:
    case actionTypes.CONFIRM_BATCHSOSHIP_FAIL:
    case actionTypes.CONFIRM_BATCHSOSHIP_SUCCEED:
      return { ...state, submitting: false };
    case actionTypes.AUTO_ALLOC_SUCCEED:
    case actionTypes.MANUAL_ALLOC_SUCCEED:
    case actionTypes.CANCEL_TRACE_ALLOC_SUCCEED:
    case actionTypes.CANCEL_PRDALLOC_SUCCEED:
    case actionTypes.OUTBOUNDS_PICK_SUCCEED:
    case actionTypes.UNDO_PICKED_SUCCEED:
    case actionTypes.OUTBOUNDS_SHIP_SUCCEED:
      return { ...state, submitting: false, outboundReload: true };
    case actionTypes.LOAD_PICK_DETAILS_SUCCEED:
      return { ...state, pickDetails: action.result.data };
    case actionTypes.LOAD_ALLOCATED_DETAILS:
      return { ...state, allocatedDataLoading: true };
    case actionTypes.LOAD_ALLOCATED_DETAILS_SUCCEED:
      return { ...state, allocatedData: action.result.data, allocatedDataLoading: false };
    case actionTypes.UPDATE_OUTBMODE_SUCCEED:
      return {
        ...state,
        outboundFormHead: {
          ...state.outboundFormHead,
          shipping_mode: action.data.shippingMode,
        },
      };
    case actionTypes.LOAD_PACK_DETAILS_SUCCEED:
      return { ...state, packDetails: action.result.data };
    case actionTypes.LOAD_SHIP_DETAILS_SUCCEED:
      return { ...state, shipDetails: action.result.data };
    case CANCEL_OUTBOUND_SUCCEED:
      return { ...state, outbound: { ...state.outbound, loaded: false } };
    case CLOSE_OUTBOUND_SUCCEED:
      return { ...state, outbound: { ...state.outbound, loaded: false } };
    case actionTypes.READ_LOGO_SUCCEED:
      return { ...state, waybill: { ...state.waybill, ...action.result.data } };
    case actionTypes.SFEXPRESS_MODAL:
      return { ...state, SFExpressModal: { ...state.SFExpressModal, ...action.data } };
    default:
      return state;
  }
}

export function openAllocatingModal(modalInfo) {
  return {
    type: actionTypes.OPEN_ALLOCATING_MODAL,
    data: modalInfo,
  };
}

export function closeAllocatingModal() {
  return {
    type: actionTypes.CLOSE_ALLOCATING_MODAL,
  };
}

export function openPickingModal(id, location, allcoQty, skuPackQty, traceId) {
  return {
    type: actionTypes.OPEN_PICKING_MODAL,
    id,
    location,
    allcoQty,
    skuPackQty,
    traceId,
  };
}

export function closePickingModal() {
  return {
    type: actionTypes.CLOSE_PICKING_MODAL,
  };
}

export function openShippingModal(id, pickedQty, skuPackQty) {
  return {
    type: actionTypes.OPEN_SHIPPING_MODAL,
    id,
    pickedQty,
    skuPackQty,
  };
}

export function closeShippingModal() {
  return {
    type: actionTypes.CLOSE_SHIPPING_MODAL,
  };
}

export function showSubarPickChkModal(data) {
  return {
    type: actionTypes.SHOW_SPCPMODAL,
    data,
  };
}

export function loadOutbounds({
  whseCode, pageSize, current, filters,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OUTBOUNDS,
        actionTypes.LOAD_OUTBOUNDS_SUCCEED,
        actionTypes.LOAD_OUTBOUNDS_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds',
      method: 'get',
      params: {
        whseCode, pageSize, current, filters: JSON.stringify(filters),
      },
    },
  };
}

export function loadOutboundHead(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OUTBOUND_HEAD,
        actionTypes.LOAD_OUTBOUND_HEAD_SUCCEED,
        actionTypes.LOAD_OUTBOUND_HEAD_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/head',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function loadOutboundProductDetails(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OUTBOUND_PRODUCTS,
        actionTypes.LOAD_OUTBOUND_PRODUCTS_SUCCEED,
        actionTypes.LOAD_OUTBOUND_PRODUCTS_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/products',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function loadProductInboundDetail(productNo, whseCode, ownerPartnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PRODUCT_INBOUND_DETAILS,
        actionTypes.LOAD_PRODUCT_INBOUND_DETAILS_SUCCEED,
        actionTypes.LOAD_PRODUCT_INBOUND_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/details/byproduct',
      method: 'get',
      params: {
        productNo, whseCode, ownerPartnerId,
      },
    },
  };
}

export function loadAllocatedDetails(outboundNo, seqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ALLOCATED_DETAILS,
        actionTypes.LOAD_ALLOCATED_DETAILS_SUCCEED,
        actionTypes.LOAD_ALLOCATED_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/allocated/details',
      method: 'get',
      params: { outboundNo, seqNo },
    },
  };
}

export function batchAutoAlloc(outboundNo, seqNos, loginId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.AUTO_ALLOC,
        actionTypes.AUTO_ALLOC_SUCCEED,
        actionTypes.AUTO_ALLOC_FAIL,
      ],
      endpoint: 'v1/cwm/outbound/autoalloc/batch',
      method: 'post',
      data: {
        outbound_no: outboundNo,
        seq_nos: seqNos,
        login_id: loginId,
        login_name: loginName,
      },
    },
  };
}

export function manualAlloc(outboundNo, seqNo, allocs, loginId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MANUAL_ALLOC,
        actionTypes.MANUAL_ALLOC_SUCCEED,
        actionTypes.MANUAL_ALLOC_FAIL,
      ],
      endpoint: 'v1/cwm/outbound/alloc/manual',
      method: 'post',
      data: {
        outbound_no: outboundNo,
        seq_no: seqNo,
        allocs,
        login_id: loginId,
        login_name: loginName,
      },
    },
  };
}

export function cancelProductsAlloc(outboundNo, seqNos, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_PRDALLOC,
        actionTypes.CANCEL_PRDALLOC_SUCCEED,
        actionTypes.CANCEL_PRDALLOC_FAIL,
      ],
      endpoint: 'v1/cwm/outbound/undo/products/alloc',
      method: 'post',
      data: {
        outbound_no: outboundNo,
        seq_nos: seqNos,
        login_id: loginId,
      },
    },
  };
}

export function cancelTraceAlloc(outboundNo, ids, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_TRACE_ALLOC,
        actionTypes.CANCEL_TRACE_ALLOC_SUCCEED,
        actionTypes.CANCEL_TRACE_ALLOC_FAIL,
      ],
      endpoint: 'v1/cwm/outbound/undo/trace/alloc',
      method: 'post',
      data: {
        outbound_no: outboundNo,
        detail_ids: ids,
        login_id: loginId,
      },
    },
  };
}

export function loadPickDetails(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PICK_DETAILS,
        actionTypes.LOAD_PICK_DETAILS_SUCCEED,
        actionTypes.LOAD_PICK_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/pick/details/load',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function loadPrintPickDetails(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PPICK_DETAILS,
        actionTypes.LOAD_PPICK_DETAILS_SUCCEED,
        actionTypes.LOAD_PPICK_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/pick/print/details',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function pickConfirm(outboundNo, skulist, pickedBy, pickedDate, packedNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.OUTBOUNDS_PICK,
        actionTypes.OUTBOUNDS_PICK_SUCCEED,
        actionTypes.OUTBOUNDS_PICK_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds/pick',
      method: 'post',
      data: {
        outboundNo, skulist, pickedBy, pickedDate, packedNo,
      },
    },
  };
}

export function cancelPicked(outboundNo, skulist) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UNDO_PICKED,
        actionTypes.UNDO_PICKED_SUCCEED,
        actionTypes.UNDO_PICKED_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds/undo/pick',
      method: 'post',
      data: { outboundNo, skulist },
    },
  };
}

export function shipConfirm(outbounddata, skulist, loginName, shippedBy, shippedDate) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.OUTBOUNDS_SHIP,
        actionTypes.OUTBOUNDS_SHIP_SUCCEED,
        actionTypes.OUTBOUNDS_SHIP_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds/ship',
      method: 'post',
      data: {
        outbounddata, skulist, loginName, shippedBy, shippedDate,
      },
    },
  };
}

export function shipBatchSoConfirm(outbounddata, soNos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CONFIRM_BATCHSOSHIP,
        actionTypes.CONFIRM_BATCHSOSHIP_SUCCEED,
        actionTypes.CONFIRM_BATCHSOSHIP_FAIL,
      ],
      endpoint: 'v1/cwm/outbound/ship/byso',
      method: 'post',
      data: { outbounddata, soNos },
    },
  };
}

export function updateOutboundMode(outboundNo, shippingMode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_OUTBMODE,
        actionTypes.UPDATE_OUTBMODE_SUCCEED,
        actionTypes.UPDATE_OUTBMODE_FAIL,
      ],
      endpoint: 'v1/cwm/outbound/update/shippingmode',
      method: 'post',
      data: { outboundNo, shippingMode },
    },
  };
}

export function loadPackDetails(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PACK_DETAILS,
        actionTypes.LOAD_PACK_DETAILS_SUCCEED,
        actionTypes.LOAD_PACK_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/pack/details/load',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function loadPackedNoDetails(outboundNo, packedNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PACKNO_DETAILS,
        actionTypes.LOAD_PACKNO_DETAILS_SUCCEED,
        actionTypes.LOAD_PACKNO_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/pack/details/load',
      method: 'get',
      params: { outboundNo, packedNo },
    },
  };
}

export function loadShipDetails(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SHIP_DETAILS,
        actionTypes.LOAD_SHIP_DETAILS_SUCCEED,
        actionTypes.LOAD_SHIP_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/ship/details/load',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function readWaybillLogo() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.READ_LOGO,
        actionTypes.READ_LOGO_SUCCEED,
        actionTypes.READ_LOGO_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/waybillLogo',
      method: 'get',
    },
  };
}

export function orderExpress(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ORDER_EXPRESS,
        actionTypes.ORDER_EXPRESS_SUCCEED,
        actionTypes.ORDER_EXPRESS_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds/sfexpress/order',
      method: 'post',
      data,
    },
  };
}

export function toggleSFExpressModal(visible, config = {}) {
  return {
    type: actionTypes.SFEXPRESS_MODAL,
    data: { visible, config },
  };
}

export function loadExpressInfo(orderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SFEXPRESS,
        actionTypes.LOAD_SFEXPRESS_SUCCEED,
        actionTypes.LOAD_SFEXPRESS_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds/sfexpress',
      method: 'get',
      params: { orderNo },
    },
  };
}

export function addZD(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ORDER_ZD_EXPRESS,
        actionTypes.ORDER_ZD_EXPRESS_SUCCEED,
        actionTypes.ORDER_ZD_EXPRESS_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds/sfexpress/order/zd',
      method: 'post',
      data,
    },
  };
}

export function loadSFExpressConfig() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SFEXPRESS_CONFIG,
        actionTypes.LOAD_SFEXPRESS_CONFIG_SUCCEED,
        actionTypes.LOAD_SFEXPRESS_CONFIG_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds/sfexpress/config',
      method: 'get',
    },
  };
}

export function loadTraceIdAllocDetails(traceId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRACEIDALLOCD,
        actionTypes.LOAD_TRACEIDALLOCD_SUCCEED,
        actionTypes.LOAD_TRACEIDALLOCD_FAIL,
      ],
      endpoint: 'v1/cwm/outbound/traceid/allocdetails',
      method: 'get',
      params: { traceId },
    },
  };
}

export function exportNormalExitBySo(sonos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXPORT_NEBSO,
        actionTypes.EXPORT_NEBSO_SUCCEED,
        actionTypes.EXPORT_NEBSO_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/normal/exit/voucher/exportbyso',
      method: 'post',
      data: { sonos },
    },
  };
}
