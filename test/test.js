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

describe('formatChange', function () {
  it('handles negative numbers', function () {
    assert.equal('-1.50', t.formatChange(-1.5));
    assert.equal('-1.00', t.formatChange(-1.0));
    assert.equal('-1.00', t.formatChange(-1));
  });

  it('handles 0', function () {
    assert.equal('+0.00', t.formatChange(0));
    assert.equal('+0.00', t.formatChange(0.0000));
  });

  it('handles positive numbers', function () {
    assert.equal('+1.49', t.formatChange(1.49));
    assert.equal('+1.49', t.formatChange(1.4900032));
  });
});

describe('StockQuote', () => {
  describe('#applyConfig()', () => {
    it('can apply a valid config', () => {
      let app = new t.StockQuote();
      app.config = {
        symbol: symbol,
        geometry: {
          width: 1,
          height: 1,
        }
      };
      app.applyConfig().catch((error) => {
        fail(error);
      })
    });
    it('can detect an invalid config', () => {
      let failApp = new t.StockQuote();
      failApp.config = {
        symbol: 'FOOBARRR'
      }
      failApp.applyConfig().then(() => {
        fail("Should have failed.");
      }).catch((error) => {
        assert(error);
      })

    })
  });

  describe('#generateSignal(quote)', function () {
    it('generates the quote', function () {
      return buildApp().then(app => {
        const quote = require('./test-quote.json');
        const signal = app.generateSignal(quote);
        console.log(JSON.stringify(signal));
        assert.ok(signal);
        assert(signal.message.includes('AAPL'));
        assert(signal.message.includes('USD 181.94'));
        assert(signal.message.includes('Previous close: USD 178.58'));
        assert(signal.message.includes('+3.36')); // latestPrice - previousClose
        assert(signal.message.includes('+1.88%'));
      })
    })
  });

  describe('#run()', () => {
    it('can run', async function () {
      return buildApp().then(app => {
        return app.run().then((signal) => {
          assert.ok(signal);
          assert(signal.name.includes(symbol));
          assert(signal.message.includes(symbol));
          assert(signal.message.includes(companyName));
        }).catch((error) => {
          assert.fail(error)
        });
      });
    });
  });
})

const baseConfig = {
  extensionId: 'q-applet-stock-quote',
  geometry: {
    width: 1,
    height: 1,
  },
  applet: {
    user: {
      symbol: symbol
    }
  }
};

async function buildApp(config) {
  const app = new t.StockQuote();
  return app.processConfig(config || baseConfig).then(() => {
    return app;
  });
}