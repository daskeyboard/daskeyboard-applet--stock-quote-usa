const q = require('daskeyboard-applet');
const request = require('request-promise');
const logger = q.logger;

const apiUrl = 'https://api.iextrading.com/1.0';

async function getQuote(symbol) {
  return request.get({
    url: apiUrl + `/stock/${symbol.trim().toUpperCase()}/quote`,
    json: true
  });
}

function formatChange(number) {
  if (number >= 0) {
    return `+${number.toFixed(2)}`;
  } else {
    return `${number.toFixed(2)}`;
  }
}

class StockQuote extends q.DesktopApp {
  generateSignal(quote) {
    const symbol = quote.symbol;
    const companyName = quote.companyName;
    const previousClose = quote.previousClose;
    const latestPrice = quote.latestPrice;

    const change = formatChange((latestPrice - previousClose));
    const changePercent = formatChange((change / previousClose - 1));

    const color = (latestPrice >= previousClose) ? '#00FF00' : '#FF0000';
    return new q.Signal({
      points: [
        [new q.Point(color)]
      ],
      name: `Stock Quote: ${symbol}`,
      message: `${symbol} (${companyName}): ${latestPrice} (${change} ${changePercent}%)`
    });
  }

  async run() {
    logger.info("Running.");
    const symbol = this.config.symbol;
    if (symbol) {
      logger.info("My symbol is: " + symbol);
      return getQuote(symbol).then(quote => {
        return this.generateSignal(quote);
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
    const symbol = this.config.symbol;
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
  formatChange: formatChange,
  getQuote: getQuote,
  StockQuote: StockQuote
}

const applet = new StockQuote();