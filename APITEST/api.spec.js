import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import { faker } from '@faker-js/faker';

function formatISODate(date) {
  return date.toISOString().split('T')[0];
}

test.describe.serial('Booking flow (create -> retrieve -> list)', () => {
  let savedBookingId;
  let savedPayload;

  test('Create booking', async ({ request }) => {
    const payloadPath = './payload/booking.json';
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

    const dynamicFirstName = process.env.FIRSTNAME || faker.person.firstName();
    const dynamicLastName = process.env.LASTNAME || faker.person.lastName();
    const dynamicAdditionalNeeds = process.env.ADDITIONALNEEDS || faker.lorem.words({ min: 2, max: 5 });

    const checkin = process.env.CHECKIN || formatISODate(new Date());
    const checkout = process.env.CHECKOUT || (function () { const d = new Date(); 
      d.setDate(d.getDate() + 7); return formatISODate(d); })();

    payload.firstname = dynamicFirstName;
    payload.lastname = dynamicLastName;
    payload.additionalneeds = dynamicAdditionalNeeds;
    if (!payload.bookingdates) payload.bookingdates = {};
    payload.bookingdates.checkin = checkin;
    payload.bookingdates.checkout = checkout;

    console.log('Using payload:', JSON.stringify(payload, null, 2));

    const response = await request.post('https://restful-booker.herokuapp.com/booking', { data: payload });
    await expect(response).toBeOK();

    const responseBody = await response.json();
    const { bookingid, booking } = responseBody;

    expect(bookingid).toBeTruthy();
    expect(booking).toMatchObject(payload);
    expect(booking.firstname).toBe(payload.firstname);

    console.log(JSON.stringify(responseBody, null, 2));

    // Save booking id + payload in-memory for chained tests
    savedBookingId = bookingid;
    savedPayload = payload;
  });

  test('Retrieve booking by id', async ({ request }) => {
    test.skip(!savedBookingId, 'No booking id available from create step');
    const getResponse = await request.get(`https://restful-booker.herokuapp.com/booking/${savedBookingId}`);
    await expect(getResponse).toBeOK();
    const bookingFromGet = await getResponse.json();

    expect(bookingFromGet).toMatchObject(savedPayload);
    expect(bookingFromGet.firstname).toBe(savedPayload.firstname);
  });

  test('List bookings contains created id', async ({ request }) => {
    test.skip(!savedBookingId, 'No booking id available from create step');
    const response = await request.get('https://restful-booker.herokuapp.com/booking');
    await expect(response).toBeOK();
    const list = await response.json();
    const found = Array.isArray(list) && list.some(item => item.bookingid === savedBookingId || item.bookingid === Number(savedBookingId));
    expect(found).toBeTruthy();
  });

  test('Generate token', async ({ request }) => {
    const payloadPath = './payload/generateToken.json';
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));

    const response = await request.post('https://restful-booker.herokuapp.com/auth', { data: payload });
    await expect(response).toBeOK();

    const body = await response.json();
    // The API returns { token: "..." }
    expect(body).toBeTruthy();
    expect(body.token).toBeTruthy();
    console.log('Generated token:', body.token);
  });
});