const q = require('daskeyboard-applet');
const request = require('request-promise');
const logger = q.logger;

const apiUrl = 'https://cloud.iexapis.com/v1';

async function getQuote(symbol) {
  return request.get({
    url: apiUrl + `/stock/${symbol.trim().toUpperCase()}/quote?token=pk_998533ff36864bd3a75f4494a3c92bfa`,
    json: true
  });
}

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
    // run every 10 min
    this.pollingInterval = 10 * 60 * 1000;
  }

  generateSignal(quote) {
    const symbol = quote.symbol;
    const companyName = quote.companyName;
    const previousClose = quote.previousClose * 1;
    const latestPrice = quote.latestPrice * 1;

    const change = formatChange((latestPrice - previousClose));
    const changePercent = formatChange(change / previousClose * 100);

    const color = (latestPrice >= previousClose) ? '#00FF00' : '#FF0000';
    
    return new q.Signal({
      points: [
        [new q.Point(color)]
      ],
      link: {
        url: 'https://iextrading.com/apps/stocks/'+`${symbol}`,
        label: 'Show in IEX',
      },
      name: `Stock Quote: ${symbol}`,
      message: `${symbol} (${companyName}): ` + 
        `USD ${latestPrice} (${change} ${changePercent}%)` +
        `<br/>Previous close: USD ${previousClose}`
    });
  }

  async run() {
    logger.info("Stock quote USA running.");
    const symbol = this.config.symbol;
    if (symbol) {
      logger.info("My symbol is: " + symbol);
      return getQuote(symbol).then(quote => {
        return this.generateSignal(quote);
      }).catch((error) => {
        logger.error("Error while getting stock quote USA:" + error);
        if(`${error.message}`.includes("getaddrinfo")){
          // Do not signal
          // return q.Signal.error(
          //   'The Stock Quote USA service returned an error. <b>Please check your internet connection</b>.'
          // );
        }else{
          return q.Signal.error([`The Stock Quote USA service returned an error. Detail: ${error}`]);
        }
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