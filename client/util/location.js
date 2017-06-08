export function renderLoc(location, provinceFd = 'province', cityFd = 'city', countyFd = 'district') {
  const names = [];
  if (location[cityFd] && (location[cityFd] === '市辖区' || location[cityFd] === '县') || location[cityFd] === '省直辖县市') {
    if (location[provinceFd]) {
      names.push(location[provinceFd]);
    }
    if (location[countyFd]) {
      names.push(location[countyFd]);
    }
    return names.join('-');
  } else if (location[countyFd] && (location[countyFd] === '市辖区' || location[countyFd] === '县' || location[cityFd] === '省直辖县市')) {
    return location[cityFd] || '';
  } else {
    if (location[provinceFd]) {
      names.push(location[provinceFd]);
    }
    if (location[cityFd]) {
      names.push(location[cityFd]);
    }
    if (location[countyFd]) {
      names.push(location[countyFd]);
    }
    if (names.length > 2) names.shift();
    return names.join('-');
  }
}

export function renderLocation(location, provinceFd = 'province', cityFd = 'city', countyFd = 'district', streetFd = 'street') {
  const names = [location[provinceFd]];
  if (!(location[cityFd] === '市辖区' || location[cityFd] === '县' || location[cityFd] === '省直辖县市')) {
    names.push(location[cityFd]);
  }
  if (!(location[countyFd] === '市辖区' || location[countyFd] === '县')) {
    names.push(location[countyFd]);
  }
  if (location[streetFd]) {
    names.push(location[streetFd]);
  }
  return names.join('-');
}
