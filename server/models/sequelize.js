import Sequelize, { STRING, INTEGER, DATE } from 'sequelize';

const sequelize = new Sequelize('mysql://root:qeemo1234@192.168.0.200:3306/qm_saas', {
  define: {
    timestamps: false,
    freezeTabName: true
  }
});

const Driver = sequelize.define('tms_drivers', {
  driver_id: {
    type: INTEGER,
    primaryKey: true
  },
  name: STRING,
  phone: STRING,
  remark: STRING,
  vehicle_id: INTEGER,
  tenant_id: INTEGER,
  created_date: DATE,
  status: INTEGER
});

const Vehicle = sequelize.define('tms_vehicles', {
  vehicle_id: {
    type: INTEGER,
    primaryKey: true
  },
  plate_number: INTEGER,
  trailer_number: INTEGER,
  type: INTEGER,
  load_weight: INTEGER,
  length: INTEGER,
  load_volume: INTEGER,
  vproperty: INTEGER,
  connect_type: INTEGER,
  tenant_id: INTEGER,
  device_id: INTEGER,
  device_secret: INTEGER,
  remark: STRING,
  driver_id: INTEGER,
  status: INTEGER,
  last_location: STRING,
  last_location_lon: STRING,
  last_location_lat: STRING,
  last_location_time: STRING,
  created_date: DATE
});

Driver.findOne().then(driver => {
  console.log(driver.get());
});

Vehicle.findOne().then(vehicle => {
  console.log(vehicle.get());
});