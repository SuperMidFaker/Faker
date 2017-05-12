export function renderLoc(shipmt, provinceFd, cityFd, countyFd) {
  const names = [];
  if (shipmt[cityFd] && (shipmt[cityFd] === '市辖区' || shipmt[cityFd] === '县') || shipmt[cityFd] === '省直辖县市') {
    if (shipmt[provinceFd]) {
      names.push(shipmt[provinceFd]);
    }
    if (shipmt[countyFd]) {
      names.push(shipmt[countyFd]);
    }
    return names.join('-');
  } else if (shipmt[countyFd] && (shipmt[countyFd] === '市辖区' || shipmt[countyFd] === '县' || shipmt[cityFd] === '省直辖县市')) {
    return shipmt[cityFd] || '';
  } else {
    if (shipmt[provinceFd]) {
      names.push(shipmt[provinceFd]);
    }
    if (shipmt[cityFd]) {
      names.push(shipmt[cityFd]);
    }
    if (shipmt[countyFd]) {
      names.push(shipmt[countyFd]);
    }
    if (names.length > 2) names.shift();
    return names.join('-');
  }
}
export function renderConsignLoc(shipmt, field) {
  const province = `${field}_province`;
  const city = `${field}_city`;
  const county = `${field}_district`;
  return renderLoc(shipmt, province, city, county);
}
export function renderCity(shipmt, field) {
  const provinceFd = `${field}_province`;
  const cityFd = `${field}_city`;
  const countyFd = `${field}_district`;
  if (shipmt[cityFd] && (shipmt[cityFd] === '市辖区' || shipmt[cityFd] === '县' || shipmt[cityFd] === '省直辖县市')) {
    return shipmt[provinceFd].replace(/市/, '');
  } else if (shipmt[countyFd] && (shipmt[countyFd] === '市辖区' || shipmt[countyFd] === '县' || shipmt[cityFd] === '省直辖县市')) {
    return shipmt[cityFd].replace(/市/, '') || '';
  } else if (shipmt[cityFd]) {
    return shipmt[cityFd].replace(/市/, '') || '';
  }
  return '';
}
