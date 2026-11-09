const matches = (line, id, placeId) => String(line.id) === String(id) && String(line.placeId) === String(placeId);
export function changeQuantity(cart, id, placeId, delta) {
 return cart.map(line => matches(line,id,placeId) ? {...line,qty:Math.min(99,(Number(line.qty)||1)+delta)} : line).filter(line=>line.qty>0);
}
export function changeInstruction(cart, id, placeId, value) {
 return cart.map(line => matches(line,id,placeId) ? {...line,instructions:value.slice(0,200)} : line);
}
