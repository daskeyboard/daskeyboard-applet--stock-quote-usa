const q = require('daskeyboard-applet');
const request = require('request-promise');
const logger = q.logger;

const apiUrl = 'https://api.iextrading.com/1.0';

async function getQuote(symbol) {
  return request.get({
    url: apiUrl + `/stock/${symbol}/quote`,
    json: true
  });
}



class StockQuote extends q.DesktopApp {
  async run() {
    logger.info("Running.");
    const symbol = this.config.symbol.trim().toUpperCase();
    if (symbol) {
      logger.info("My symbol is: " + symbol);
      return getQuote(symbol).then(quote => {
        const symbol = quote.symbol;
        const companyName = quote.companyName;
        const openPrice = quote.open;
        const latestPrice = quote.latestPrice;

        const color = (latestPrice >= openPrice) ? '#00FF00' : '#FF0000';
        return new q.Signal({
          points: [
            [new q.Point(color)]
          ],
          name: 'Stock Quote',
          message: `${symbol} (${companyName}): ${latestPrice} (${openPrice})`
        });
      }).catch((error) => {
        logger.error("Error while getting stock quote:" + error);
        return null;
      })
    } else {
      logger.info("No symbol configured.");
      return null;
    }
  }

  async applyConfig() {
    const symbol = this.config.symbol.trim().toUpperCase();
    if (symbol) {
      return getQuote(symbol).then((response) => {
        return true;
      }).catch((error) => {
        throw new Error("Error validating symbol: " + symbol, error);
      })
    }
  }
}


module.exports = {
  getQuote: getQuote,
  StockQuote: StockQuote
}

const applet = new StockQuote();