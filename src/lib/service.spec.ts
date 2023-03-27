import test from 'ava';

import { Method } from './method';
import { Service } from './service';

const reserveHotelRoomMethod: Method<
  { beginDate: string; endDate: string },
  { orderId: string }
> = {
  inputDefinition: {
    type: 'object',
    properties: {
      beginDate: {
        type: 'string',
        format: 'date',
      },
      endDate: {
        type: 'string',
        format: 'date',
      },
    },
  },
  outputDefinition: {
    type: 'object',
    properties: {
      orderId: {
        type: 'string',
      },
    },
  },
  handler: async () => {
    return {
      orderId: '1234',
    };
  },
};

const hotelService = new Service('hotel', 'A service for hotels', [
  'hotel',
  'reservation',
])
  .registerMethod('reserveHotelRoom', reserveHotelRoomMethod)
  .registerMethod('reserveHotelRoom2', reserveHotelRoomMethod);

test('service', async (t) => {
  const result = await hotelService.methods.reserveHotelRoom.handler({
    beginDate: '2019-01-01',
    endDate: '2019-01-02',
  });
  t.is(result.orderId, '1234');
});
