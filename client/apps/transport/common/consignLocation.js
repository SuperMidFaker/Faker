export function renderLoc(shipmt, provinceFd, cityFd, countyFd) {
  const names = [];
  if (shipmt[cityFd] && (shipmt[cityFd] === '市辖区' || shipmt[cityFd] === '县')) {
    if (shipmt[provinceFd]) {
      names.push(shipmt[provinceFd]);
    }
    if (shipmt[countyFd]) {
      names.push(shipmt[countyFd]);
    }
    return names.join('-');
  } else if (shipmt[countyFd] && (shipmt[countyFd] === '市辖区' || shipmt[countyFd] === '县')) {
    return shipmt[cityFd] || '';
  } else {
    if (shipmt[cityFd]) {
      names.push(shipmt[cityFd]);
    }
    if (shipmt[countyFd]) {
      names.push(shipmt[countyFd]);
    }
    return names.join('-');
  }
}
export function renderConsignLoc(shipmt, field) {
  const province = `${field}_province`;
  const city = `${field}_city`;
  const county = `${field}_district`;
  return renderLoc(shipmt, province, city, county);
}
