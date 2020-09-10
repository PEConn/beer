function alertLog(message) {
  console.log(message);
}

function trigger(sku,
    log = alertLog,
    method = 'https://beer.conn.dev') {
  if (!window.PaymentRequest) {
    log("No PaymentRequest object.");
    return;
  }

  const supportedInstruments = [{
    supportedMethods: method,
    data: {
      sku: sku
    }
  }]

  const details = {
    total: {
      label: 'Total',
      amount: { currency: 'GBP', value: '0' }
    },
  };

  const request = new PaymentRequest(supportedInstruments, details);

  if (request.canMakePayment) {
    request
      .canMakePayment()
      .then(function (result) {
        log(result ? 'Can make payment' : 'Cannot make payment');
      })
      .catch(function (e) {
        log(e.message);
      });
  }

  if (request.hasEnrolledInstrument) {
    request
      .hasEnrolledInstrument()
      .then(function (result) {
        if (result) {
          log('Has enrolled instrument');
        } else {
          log('No enrolled instrument');
        }

        // Call show even if we don't have any enrolled instruments.
        request
          .show()
          .then(handlePaymentResponse)
          .catch(function (e) {
            // log(JSON.stringify(e, undefined, 2));
            log(e);
            log("Maybe you've already purchased the item.");
          });
      })
      .catch(function (e) {
        log(e.message);

        // Also call show if hasEnrolledInstrument throws.
        request
          .show()
          .then(handlePaymentResponse)
          .catch(function (e) {
            log(JSON.stringify(e, undefined, 2));
            log(e);
          });
      })
  }

  function handlePaymentResponse(response) {
    window.setTimeout(function () {
      response
        .complete('success')
        .then(function () {
          log(`Payment done: ${JSON.stringify(response, undefined, 2)}`);
        })
        .catch(function (e) {
          log(e.message);
          log(JSON.stringify(response, undefined, 2));
        })
      // request = buildPaymentRequest();
    }, 500);
  }
}

const PAYMENT_METHOD = "https://play.google.com/billing";

async function getDetails(sku, log) {
  try {
    if (window.getDigitalGoodsService) {
      service = await window.getDigitalGoodsService(PAYMENT_METHOD);
      details = await service.getDetails([sku]);
      log(JSON.stringify(details, null, 2));
    } else {
      log("window doesn't have getDigitalGoodsService.");
    }
  } catch (error) {
    log(error);
  }
}

async function acknowledge(token, log) {
  try {
    if (window.getDigitalGoodsService) {
      service = await window.getDigitalGoodsService(PAYMENT_METHOD);
      await service.acknowledge(token, 'onetime');
      log("Purchase acknowledged.");
    } else {
      log("window doesn't have getDigitalGoodsService.");
    }
  } catch (error) {
    log(error);
  }
}
