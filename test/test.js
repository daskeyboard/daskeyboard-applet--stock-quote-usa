const assert = require('assert');
const t = require('../index');
const symbol = 'AAPL';
const companyName = 'Apple Inc.';

describe('getQuote', function () {
  it('can get a quote', function () {
    t.getQuote(symbol).then((quote) => {
      assert.ok(quote, 'Quote was not truthy.');
      assert.equal(symbol, quote.symbol, 'Symbol does not match: ' + symbol);
      assert.ok(quote.open, 'quote.open was not truthy.');
      assert.ok(quote.latestPrice, 'quote.latestPrice was not truthy.');
    }).catch((error) => {
      assert.fail(error);
    })
  })
});

describe('StockQuote', () => {
  let app = new t.StockQuote();
  app.config = {
    symbol: symbol,
    geometry: {
      width: 1,
      height: 1,
    }
  };

  describe('#run()', () => {
    app.run().then((signal) => {
      console.log(signal);
      assert.ok(signal);
      assert(signal.message.includes(symbol));
      assert(signal.message.includes(companyName));
    }).catch((error) => {
      assert.fail(error)
    });
  })
})