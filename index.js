const q = require('qbuzz');
const request = require('request-promise');

const config = q.Config();
console.log("My config", JSON.stringify(config));

const serviceUrl = 'https://www.montastic.com/checkpoints/index';

const serviceHeaders = {
  "Content-Type": "application/json",
  "X-API-KEY": config.authorization.apiKey,
}

const responseColors = {
  "0": '#FFFF00',
  "1": '#00FF00',
  "-1": '#FF0000'
}

const responseEffects = {
  "0": q.Effects.BOUNCING_LIGHT,
  "1": q.Effects.SET_COLOR,
  "-1": q.Effects.BLINK
}


class QMontastic extends q.DesktopApp {
  constructor() {
    super();
  }

  /** ping Montastic and set the signal  */
  async run() {
    return request.get({
        url: serviceUrl,
        headers: serviceHeaders,
        json: true
      }).then(function (body) {
        let points = null;
        if (config.monitors) {
          points = new Array(config.monitors.length);
        } else {
          points = [];
        }

        for (let monitor of body) {
          // extract the important values from the response
          let status = monitor.status;
          let monitorId = monitor.id;

          console.log(`For monitor ${monitorId}, got status: ${status}`);

          let point = new q.Point(responseColors[status], 
            responseEffects[status]);
          if (config.monitors) {
            let i = config.monitors.indexOf(monitorId);
            if (i >= 0) {
              points[i] = point;
            }
          } else {
            points.push(point);
          }
        }

        let signal = new q.Signal(config.extensionId, [points]);
        console.log("Sending signal: ", signal);
        q.Send(signal);
      })
      .catch(function (error) {
        console.error("Got error sending request to service:", error);
      });
  }
}


const montastic = new QMontastic();
montastic.start();