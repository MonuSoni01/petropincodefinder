exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    // Customer mobile
    const customerMobile =
      body.from ||
      body.mobile ||
      body.phone ||
      "";

    // Message text (pincode)
    const messageText =
      body.message ||
      body.text ||
      body.body ||
      "";

    const pincode = String(messageText).trim();

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return response({
        ok: false,
        message: "Invalid pincode"
      });
    }

    // Fetch district & state
    const postalRes = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );

    const postalData = await postalRes.json();

    if (
      !postalData?.[0] ||
      postalData[0].Status !== "Success"
    ) {
      return response({
        ok: false,
        message: "No postal data found"
      });
    }

    const district =
      postalData[0].PostOffice[0].District || "";

    const state =
      postalData[0].PostOffice[0].State || "";

    // Load distributor data
    const distributorData =
      require("../../distributors.json");

    const proposedData =
      require("../../proposed.json");

    function normalize(str) {
      return str
        ? str.toLowerCase()
            .replace(/[^a-z]/g, "")
        : "";
    }

    const allDistributors = [
      ...distributorData,
      ...proposedData
    ];

    // Match distributor
    const matches =
      allDistributors.filter((item) => {

        const stateMatch =
          normalize(item.State)
          === normalize(state);

        const areaMatch =
          normalize(item.Area)
          .includes(normalize(district)) ||
          normalize(district)
          .includes(normalize(item.Area));

        return stateMatch && areaMatch;

      });

    // If no dealer found
    if (matches.length === 0) {

      await sendTemplate({
        to: customerMobile,
        templateName: "dealer_not_found",
        bodyValues: [district, state]
      });

      return response({
        ok: true,
        message: "No dealer found"
      });

    }

    const dealer = matches[0];

    // Send dealer details to customer

    await sendTemplate({
      to: customerMobile,
      templateName: "dealer_details",
      bodyValues: [
        dealer.Distributor || "N/A",
        dealer.City || "N/A",
        dealer.State || "N/A",
        dealer.Area || "N/A",
        dealer.contact || "N/A"
      ]
    });

    // Send lead to dealer

    if (dealer.contact) {

      await sendTemplate({
        to: dealer.contact,
        templateName: "new_lead",
        bodyValues: [
          customerMobile || "N/A",
          pincode,
          district,
          state
        ]
      });

    }

    return response({
      ok: true,
      dealer
    });

  } catch (error) {

    console.error("ERROR:", error);

    return response({
      ok: false,
      error: error.message
    }, 500);

  }
};

function response(data, status = 200) {
  return {
    statusCode: status,
    body: JSON.stringify(data)
  };
}

async function sendTemplate({
  to,
  templateName,
  bodyValues
}) {

  // 🔴 PASTE YOUR API KEY HERE

  const apiKey =
  "key_idYkYVChyB7vJeDfyp7SRZCbE5bsFNxC9ekooZsCdwamsFZD5A2biqqpYZZzguUzwTwYePgAl1b5rEcV2EDvJVNFoyAJq1FaVKNsJN4CC87D04yuLPKczllyZUPvspWy3ITty2xtGlcJFc3su3tvtnHcN4cUKO9DhviOUbYT7KUsxuMDfyrpxjpRysicxk6uBh56qCaTEty1KAmvMibayclG2TfTdIQhyuejTySIaOTKyLs8xgCOg0XIiKFV";

  const payload = {

    to,
    templateName,
    language: "en",
    body: bodyValues

  };

  const res = await fetch(
    "https://public.doubletick.io/whatsapp/message/template",
    {
      method: "POST",

      headers: {

        Authorization: apiKey,
        "Content-Type": "application/json"

      },

      body: JSON.stringify(payload)

    }
  );

  const text = await res.text();

  if (!res.ok) {

    console.error("DoubleTick Error:", text);

    throw new Error(
      `DoubleTick API failed: ${res.status}`
    );

  }

  return text;

}