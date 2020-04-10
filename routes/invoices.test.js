process.env.NODE_ENV = "test"

const request = require('supertest')
const app = require('../app')
const db = require('../db')

let appleInvoice;

beforeEach(async function() {
  let results = await db.query(`
    INSERT INTO invoices
    (comp_code, amt)
    VALUES ('apple', 1900)
    RETURNING comp_code, amt`);
  appleInvoice = results.rows[0];
})

/** GET /invoices
 * return info on invoices: like {invoices: [{id, comp_code}, ...]} */

describe('GET / invoices', function() {
  it("Gets a list of invoices", async function() {
    const resp = await request(app).get('/invoices');
    expect(resp.statusCode).toBe(200);

    expect(resp.body.invoices[0].comp_code).toEqual("apple");
  });
});

afterAll(async function() {
  await db.end();
})