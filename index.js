const q = require('daskeyboard-applet');
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
const logger = q.logger;

function round(number) {
  return number.toFixed(2);
}

function formatChange(number) {
  if (number >= 0) {
    return `+${round(number)}`;
  } else {
    return `${round(number)}`;
  }
}

class StockQuote extends q.DesktopApp {

  constructor() {
    super();
    // run every 30 min
    this.pollingInterval = 30 * 60 * 1000;
  }

  async getQuote(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol.trim().toUpperCase());
      return quote;
    } catch (error) {
      throw new Error(`Failed to fetch stock data for ${symbol}: ${error.message}`);
    }
  }

  generateSignal(quote) {
    const symbol = quote.symbol;
    const companyName = quote.longName || symbol;
    const previousClose = quote.regularMarketPreviousClose;
    const latestPrice = quote.regularMarketPrice;

    const change = formatChange(latestPrice - previousClose);
    const changePercent = formatChange((latestPrice - previousClose) / previousClose * 100);

    const color = (latestPrice >= previousClose) ? '#00FF00' : '#FF0000';

    return new q.Signal({
      points: [
        [new q.Point(color)]
      ],
      link: {
        url: `https://finance.yahoo.com/quote/${symbol}`,
        label: 'Show in Yahoo Finance',
      },
      name: `Stock Quote: ${symbol}`,
      message: `${symbol} (${companyName}): ` +
        `USD ${round(latestPrice)} (${change} ${changePercent}%)` +
        `<br/>Previous close: USD ${round(previousClose)}`
    });
  }

  async run() {
    logger.info("Stock quote USA running.");
    const symbol = this.config.symbol;
    if (symbol) {
      logger.info("My symbol is: " + symbol);
      return this.getQuote(symbol).then(quote => {
        return this.generateSignal(quote);
      }).catch((error) => {
        logger.error("Error while getting stock quote USA:" + error);
        return q.Signal.error([`The Stock Quote USA service returned an error. Detail: ${error}`]);
      });
    } else {
      logger.info("No symbol configured.");
      return null;
    }
  }

  async applyConfig() {
    const symbol = this.config.symbol;

    if (symbol) {
      return this.getQuote(symbol).then((response) => {
        return true;
      }).catch((error) => {
        throw new Error("Error validating symbol: " + symbol, error);
      });
    }
  }
}

module.exports = {
  formatChange: formatChange,
  StockQuote: StockQuote
};

const applet = new StockQuote();
