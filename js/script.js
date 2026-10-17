"use strict";

/* =========================================================
   PETRO PINCODE FINDER
   Confirmed + Proposed Distributor Finder
========================================================= */


/* =========================================================
   GLOBAL DATA
========================================================= */

let distributorData = [];
let proposedData = [];

const DISTRIBUTOR_FILE = "distributors.json";
const PROPOSED_FILE = "proposed.json";

const LICENSE_STORAGE_KEY = "petro_license_verified";

/*
    JavaScript month zero based hota hai.
    August = 7
*/
const RENEWAL_DATE = new Date(2026, 7, 8);


/* =========================================================
   DOM CONTENT LOADED
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadAllDistributorData();

    setupPincodeEnterKey();

    setupRenewalSystem();

    setupRenewalEnterKey();

});


/* =========================================================
   LOAD DISTRIBUTOR JSON FILES
========================================================= */

async function loadAllDistributorData() {

    const inactiveScroll =
        document.getElementById("inactiveScroll");

    try {

        const results = await Promise.all([
            fetchJsonFile(DISTRIBUTOR_FILE),
            fetchJsonFile(PROPOSED_FILE)
        ]);

        distributorData = results[0];
        proposedData = results[1];

        console.log(
            "✅ Confirmed distributors loaded:",
            distributorData.length
        );

        console.log(
            "✅ Proposed distributors loaded:",
            proposedData.length
        );

        displayInactiveMessage(distributorData);

    } catch (error) {

        console.error(
            "❌ Distributor data loading error:",
            error
        );

        if (inactiveScroll) {

            inactiveScroll.innerText =
                "⚠️ Unable to load distributor data";

        }

    }

}


/* =========================================================
   FETCH JSON HELPER
========================================================= */

async function fetchJsonFile(fileName) {

    const response = await fetch(fileName, {
        cache: "no-store"
    });

    if (!response.ok) {

        throw new Error(
            `${fileName} not found. HTTP Status: ${response.status}`
        );

    }

    const data = await response.json();

    if (!Array.isArray(data)) {

        throw new Error(
            `${fileName} must contain a JSON array`
        );

    }

    return data;

}


/* =========================================================
   INACTIVE DISTRIBUTOR ALERT
========================================================= */

function displayInactiveMessage(distributors) {

    const inactiveScroll =
        document.getElementById("inactiveScroll");

    if (!inactiveScroll) {
        return;
    }


    const inactiveDistributors =
        distributors.filter(function (distributor) {

            return (
                normalizeStatus(distributor.status) ===
                "inactive"
            );

        });


    if (inactiveDistributors.length === 0) {

        inactiveScroll.innerText =
            "✅ All distributors are active";

        return;

    }


    inactiveScroll.innerText =
        inactiveDistributors
            .map(function (distributor) {

                const distributorName =
                    distributor.Distributor ||
                    "Unknown Distributor";

                const city =
                    distributor.City ||
                    "City unavailable";

                return (
                    `⚠️ ${distributorName} ` +
                    `(${city}) is currently inactive`
                );

            })
            .join(" | ");

}


/* =========================================================
   NORMALIZE GENERAL TEXT

   Example:
   "Alwar City" -> "alwarcity"
   "ALWAR-CITY" -> "alwarcity"
========================================================= */

function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]/g, "");

}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(value) {

    return String(value || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   NORMALIZE STATE

   Example:
   UP = Uttar Pradesh
   WB = West Bengal
========================================================= */

function normalizeState(value) {

    const state = normalizeText(value);


    const stateAliases = {

        /* Uttar Pradesh */
        up: "uttarpradesh",
        uttarpradesh: "uttarpradesh",

        /* Odisha */
        odisha: "odisha",
        orissa: "odisha",

        /* Delhi */
        delhi: "delhi",
        newdelhi: "delhi",

        /* Uttarakhand */
        uttarakhand: "uttarakhand",
        uttaranchal: "uttarakhand",

        /* West Bengal */
        westbengal: "westbengal",
        wb: "westbengal",

        /* Rajasthan */
        rajasthan: "rajasthan",
        raj: "rajasthan",
        rj: "rajasthan",

        /* Haryana */
        haryana: "haryana",
        hr: "haryana",

        /* Punjab */
        punjab: "punjab",
        pb: "punjab",

        /* Bihar */
        bihar: "bihar",
        br: "bihar",

        /* Madhya Pradesh */
        madhyapradesh: "madhyapradesh",
        mp: "madhyapradesh",

        /* Gujarat */
        gujarat: "gujarat",
        gj: "gujarat",

        /* Maharashtra */
        maharashtra: "maharashtra",
        mh: "maharashtra",

        /* Chhattisgarh */
        chhattisgarh: "chhattisgarh",
        cg: "chhattisgarh",

        /* Jharkhand */
        jharkhand: "jharkhand",
        jh: "jharkhand",

        /* Chandigarh */
        chandigarh: "chandigarh",
        ch: "chandigarh",

        /* Himachal Pradesh */
        himachalpradesh: "himachalpradesh",
        hp: "himachalpradesh",

        /* Jammu Kashmir */
        jammuandkashmir: "jammuandkashmir",
        jammukashmir: "jammuandkashmir",
        jk: "jammuandkashmir",

        /* Karnataka */
        karnataka: "karnataka",
        ka: "karnataka",

        /* Tamil Nadu */
        tamilnadu: "tamilnadu",
        tn: "tamilnadu",

        /* Telangana */
        telangana: "telangana",
        tg: "telangana",

        /* Andhra Pradesh */
        andhrapradesh: "andhrapradesh",
        ap: "andhrapradesh",

        /* Kerala */
        kerala: "kerala",
        kl: "kerala",

        /* Assam */
        assam: "assam",

        /* Goa */
        goa: "goa"

    };


    return stateAliases[state] || state;

}


/* =========================================================
   SAFE DISTRIBUTOR AREA MATCHING
========================================================= */

/*
    IMPORTANT RULE:

    Distributor Area ko ONLY in values se match karenge:

    1. District
    2. Block
    3. Post Office Name

    Ye values intentionally use NAHI hongi:

    ❌ Region
    ❌ Division

    Aur substring matching bhi nahi hogi.

    Example:

    API:
    District = Alwar
    Region = Jaipur HQ Region

    Distributor Area:
    Jaipur

    Result:
    Jaipur !== Alwar

    Therefore Jaipur distributor SHOW NAHI HOGA.
*/
/* =========================================================
   STRICT DISTRICT MATCHING

   RULE:
   API District must EXACTLY exist
   inside distributor.Area

   Example:

   API District:
   Alwar

   Distributor Area:
   Jaipur, Sikar

   Result:
   NO MATCH

   Distributor Area:
   Alwar, Bharatpur

   Result:
   MATCH
========================================================= */

function distributorAreaMatches(
    distributor,
    district
) {

    // API district normalize
    const apiDistrict =
        normalizeText(district);

    if (!apiDistrict) {
        return false;
    }


    // Distributor Area can contain multiple districts:
    // "Kota, Jhalawar, Bundi"

    const distributorAreas =
        String(distributor.Area || "")
            .split(",")
            .map(function (area) {

                return normalizeText(area);

            })
            .filter(Boolean);


    if (distributorAreas.length === 0) {
        return false;
    }


    // STRICT EXACT MATCH ONLY
    return distributorAreas.includes(
        apiDistrict
    );

}

/* =========================================================
   PINCODE ENTER KEY
========================================================= */

function setupPincodeEnterKey() {

    const pincodeInput =
        document.getElementById("pincode");

    if (!pincodeInput) {
        return;
    }


    pincodeInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                getDetails();

            }

        }
    );

}


/* =========================================================
   MAIN PINCODE SEARCH
========================================================= */

async function getDetails() {

    const pincodeInput =
        document.getElementById("pincode");

    const message =
        document.getElementById("msg");

    const table =
        document.getElementById("dataTable");

    const tableBody =
        document.getElementById("tableBody");

    const salesPersonDiv =
        document.getElementById("salesPerson");

    const loader =
        document.getElementById("loader");


    /* -----------------------------------------
       Required HTML validation
    ----------------------------------------- */

    if (
        !pincodeInput ||
        !message ||
        !table ||
        !tableBody ||
        !salesPersonDiv
    ) {

        console.error(
            "Required pincode finder HTML elements are missing"
        );

        return;

    }


    const pin =
        pincodeInput.value.trim();


    /* -----------------------------------------
       Reset old result
    ----------------------------------------- */

    message.innerHTML = "";

    tableBody.innerHTML = "";

    table.style.display = "none";

    salesPersonDiv.innerHTML = "";


    /* -----------------------------------------
       Validate pincode
    ----------------------------------------- */

    if (!/^[0-9]{6}$/.test(pin)) {

        message.innerHTML =
            "⚠️ Please enter a valid 6-digit pincode.";

        pincodeInput.focus();

        return;

    }


    if (loader) {

        loader.style.display =
            "block";

    }


    message.innerHTML =
        "⏳ Fetching pincode and distributor details...";


    try {

        /* =========================================
           Ensure distributor JSON loaded
        ========================================= */

        if (
            distributorData.length === 0 &&
            proposedData.length === 0
        ) {

            const results =
                await Promise.all([
                    fetchJsonFile(
                        DISTRIBUTOR_FILE
                    ),
                    fetchJsonFile(
                        PROPOSED_FILE
                    )
                ]);


            distributorData =
                results[0];

            proposedData =
                results[1];


            displayInactiveMessage(
                distributorData
            );

        }


        /* =========================================
           INDIA POST PINCODE API
        ========================================= */

        const response =
            await fetch(

                `https://api.postalpincode.in/pincode/${pin}`,

                {
                    cache: "no-store"
                }

            );


        if (!response.ok) {

            throw new Error(
                `India Post API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        /* =========================================
           API RESPONSE VALIDATION
        ========================================= */

        if (
            !Array.isArray(data) ||
            !data[0] ||
            data[0].Status !== "Success" ||
            !Array.isArray(
                data[0].PostOffice
            ) ||
            data[0].PostOffice.length === 0
        ) {

            message.innerHTML =
                "❌ No details found for this pincode.";

            return;

        }


        const offices =
            data[0].PostOffice;


        const firstOffice =
            offices[0];


        const district =
            firstOffice.District || "";


        const state =
            firstOffice.State || "";


        const block =
            firstOffice.Block || "";


        console.log(
            "📍 PINCODE SEARCH:",
            {
                pin: pin,
                district: district,
                state: state,
                block: block
            }
        );


        message.innerHTML = "";


        /* =========================================
           COMBINE CONFIRMED + PROPOSED
        ========================================= */

        const combinedDistributors = [

            ...distributorData.map(
                function (item) {

                    return {

                        ...item,

                        distributorType:
                            "confirmed"

                    };

                }
            ),

            ...proposedData.map(
                function (item) {

                    return {

                        ...item,

                        distributorType:
                            "proposed"

                    };

                }
            )

        ];


        /* =========================================
           FIND MATCHING DISTRIBUTORS
        ========================================= */

/* =========================================================
   FIND MATCHING DISTRIBUTORS

   STRICT RULE:

   1. State must match
   2. API District must EXACTLY exist in Area
========================================================= */

const matches =
    combinedDistributors.filter(
        function (distributor) {

            /* -----------------------------
               STATE MATCH
            ----------------------------- */

            const distributorState =
                normalizeState(
                    distributor.State
                );

            const apiState =
                normalizeState(
                    state
                );


            if (
                !distributorState ||
                !apiState ||
                distributorState !== apiState
            ) {

                return false;

            }


            /* -----------------------------
               EXACT DISTRICT MATCH
            ----------------------------- */

            return distributorAreaMatches(
                distributor,
                district
            );

        }
    );


        /* =========================================
           REMOVE DUPLICATES
        ========================================= */

        const uniqueMatches = [];

        const seenDistributors =
            new Set();


        matches.forEach(
            function (distributor) {

                const uniqueKey = [

                    normalizeText(
                        distributor.Distributor
                    ),

                    normalizePhone(
                        distributor.contact
                    ),

                    distributor.distributorType

                ].join("_");


                if (
                    seenDistributors.has(
                        uniqueKey
                    )
                ) {

                    return;

                }


                seenDistributors.add(
                    uniqueKey
                );


                uniqueMatches.push(
                    distributor
                );

            }
        );


        /* =========================================
           SEPARATE CONFIRMED / PROPOSED
        ========================================= */

        const confirmedMatches =
            uniqueMatches.filter(
                function (distributor) {

                    return (
                        distributor.distributorType ===
                        "confirmed"
                    );

                }
            );


        const proposedMatches =
            uniqueMatches.filter(
                function (distributor) {

                    return (
                        distributor.distributorType ===
                        "proposed"
                    );

                }
            );


        /* =========================================
           PROPOSED RESULT
        ========================================= */

        if (
            proposedMatches.length > 0
        ) {

            salesPersonDiv
                .insertAdjacentHTML(

                    "beforeend",

                    renderDistributorSection(

                        proposedMatches,

                        "proposed"

                    )

                );

        }


        /* =========================================
           CONFIRMED RESULT
        ========================================= */

        if (
            confirmedMatches.length > 0
        ) {

            salesPersonDiv
                .insertAdjacentHTML(

                    "beforeend",

                    renderDistributorSection(

                        confirmedMatches,

                        "confirmed"

                    )

                );

        }


        /* =========================================
           NO DISTRIBUTOR
        ========================================= */

        if (
            uniqueMatches.length === 0
        ) {

            salesPersonDiv.innerHTML = `

                <div style="
                    padding:16px;
                    border:1px solid #f1b6b6;
                    background:#fff3f3;
                    color:#8a1c1c;
                    border-radius:8px;
                    text-align:left;
                ">

                    ❌
                    <b>
                        No confirmed or proposed
                        distributor mapped.
                    </b>


                    <div style="margin-top:8px;">

                        <b>District:</b>

                        ${escapeHtml(
                            district ||
                            "Not Available"
                        )}

                    </div>


                    <div>

                        <b>State:</b>

                        ${escapeHtml(
                            state ||
                            "Not Available"
                        )}

                    </div>


                    <small style="
                        display:block;
                        margin-top:8px;
                    ">

                        Please contact Petro
                        Head Office.

                    </small>

                </div>

            `;

        }


        /* =========================================
           POST OFFICE TABLE
        ========================================= */

        renderPostalTable(
            offices
        );


        table.style.display =
            "table";


    } catch (error) {

        console.error(
            "Pincode search error:",
            error
        );


        message.innerHTML =
            "⚠️ Something went wrong. Please try again.";

    } finally {

        if (loader) {

            loader.style.display =
                "none";

        }

    }

}


/*
   HTML button:
   onclick="getDetails()"
*/

window.getDetails =
    getDetails;


/* =========================================================
   RENDER DISTRIBUTOR SECTION
========================================================= */

function renderDistributorSection(
    distributors,
    distributorType
) {

    const isProposed =
        distributorType ===
        "proposed";


    const title =
        isProposed
            ? "📦 Proposed Distributor Details"
            : "📦 Confirmed Distributor Details";


    const titleColor =
        isProposed
            ? "#d93025"
            : "#108082";


    return `

        <div style="margin-top:20px;">

            <h4 style="
                margin-bottom:12px;
                color:${titleColor};
                font-weight:700;
            ">

                ${title}

            </h4>


            ${distributors
                .map(
                    function (
                        distributor,
                        index
                    ) {

                        return renderDistributorCard(

                            distributor,

                            index,

                            distributorType

                        );

                    }
                )
                .join("")}

        </div>

    `;

}


/* =========================================================
   DISTRIBUTOR CARD
========================================================= */

function renderDistributorCard(
    distributor,
    index,
    distributorType
) {

    const isProposed =
        distributorType ===
        "proposed";


    const status =
        isProposed

            ? "Proposed"

            : (
                distributor.status ||
                "Active"
            );


    const normalizedStatus =
        normalizeStatus(
            status
        );


    const isInactive =
        normalizedStatus ===
        "inactive";


    let backgroundColor =
        "#ffffff";

    let borderColor =
        "#dfe5e7";


    if (isProposed) {

        backgroundColor =
            "#fff8f2";

        borderColor =
            "#f2b78b";

    } else if (isInactive) {

        backgroundColor =
            "#ffecec";

        borderColor =
            "#e53935";

    }


    return `

        <div style="
            border:2px solid ${borderColor};
            background:${backgroundColor};
            padding:16px;
            margin-bottom:15px;
            border-radius:10px;
            text-align:left;
            box-shadow:
                0 3px 10px
                rgba(0,0,0,0.06);
        ">


            <div style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                flex-wrap:wrap;
                gap:10px;
                margin-bottom:12px;
            ">


                <div style="
                    font-size:17px;
                    font-weight:700;
                    color:#222;
                ">

                    ${index + 1}.

                    ${escapeHtml(
                        distributor.Distributor ||
                        "Distributor name unavailable"
                    )}

                </div>


                ${getStatusBadge(
                    status
                )}

            </div>


            <div style="
                display:grid;
                grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(210px,1fr)
                    );
                gap:8px 18px;
            ">


                <div>

                    📞 <b>Contact:</b>

                    ${renderPhone(
                        distributor.contact
                    )}

                </div>


                <div>

                    🏙️ <b>City:</b>

                    ${escapeHtml(
                        distributor.City ||
                        "Not Available"
                    )}

                </div>


                <div>

                    🗺️ <b>State:</b>

                    ${escapeHtml(
                        distributor.State ||
                        "Not Available"
                    )}

                </div>


                <div>

                    👤 <b>Sales Person:</b>

                    ${escapeHtml(
                        distributor.SalesPerson ||
                        "Not Assigned"
                    )}

                </div>


                <div>

                    ☎️ <b>Sales Contact:</b>

                    ${renderPhone(
                        distributor.salesContact
                    )}

                </div>

            </div>


            <div style="
                margin-top:10px;
                padding:10px;
                background:
                    rgba(16,128,130,0.07);
                border-radius:7px;
                line-height:1.6;
            ">

                📍 <b>Mapped Area:</b>

                ${escapeHtml(
                    distributor.Area ||
                    "Not Available"
                )}

            </div>


            <div style="
                margin-top:12px;
                padding-top:12px;
                border-top:
                    1px solid #d9d9d9;
            ">


                <div style="
                    font-weight:700;
                    margin-bottom:9px;
                    color:#333;
                ">

                    Product Categories

                </div>


                <div style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(145px,1fr)
                        );
                    gap:10px;
                ">


                    <div style="
                        padding:10px;
                        background:#f8f9fa;
                        border-radius:7px;
                    ">

                        🛁
                        <b>
                            Bath Accessories
                        </b>

                        <div style="
                            margin-top:5px;
                        ">

                            ${getCategoryBadge(
                                distributor
                                    .BathAccessories
                            )}

                        </div>

                    </div>


                    <div style="
                        padding:10px;
                        background:#f8f9fa;
                        border-radius:7px;
                    ">

                        🔧
                        <b>Hardware</b>

                        <div style="
                            margin-top:5px;
                        ">

                            ${getCategoryBadge(
                                distributor.Hardware
                            )}

                        </div>

                    </div>


                    <div style="
                        padding:10px;
                        background:#f8f9fa;
                        border-radius:7px;
                    ">

                        ✨
                        <b>SS Products</b>

                        <div style="
                            margin-top:5px;
                        ">

                            ${getCategoryBadge(
                                distributor.SS
                            )}

                        </div>

                    </div>

                </div>

            </div>


            <div style="
                margin-top:12px;
                padding:10px 12px;
                background:#eaf6f6;
                border-left:
                    4px solid #108082;
                border-radius:6px;
            ">

                🧾
                <b>Last Billing Date:</b>

                ${escapeHtml(
                    distributor.LastBillingDate ||
                    "No Billing Record"
                )}

            </div>

        </div>

    `;

}


/* =========================================================
   CATEGORY BADGE
========================================================= */

function getCategoryBadge(value) {

    const categoryValue =
        String(value || "")
            .trim()
            .toUpperCase();


    if (
        categoryValue === "YES"
    ) {

        return `

            <span style="
                display:inline-block;
                background:#d9f5d0;
                color:#137333;
                padding:4px 12px;
                border-radius:20px;
                font-size:13px;
                font-weight:700;
            ">

                ✓ YES

            </span>

        `;

    }


    if (
        categoryValue === "NO"
    ) {

        return `

            <span style="
                display:inline-block;
                background:#ffdada;
                color:#c5221f;
                padding:4px 12px;
                border-radius:20px;
                font-size:13px;
                font-weight:700;
            ">

                ✕ NO

            </span>

        `;

    }


    return `

        <span style="
            display:inline-block;
            background:#eeeeee;
            color:#666666;
            padding:4px 12px;
            border-radius:20px;
            font-size:13px;
            font-weight:700;
        ">

            Not Updated

        </span>

    `;

}


/* =========================================================
   STATUS BADGE
========================================================= */

function getStatusBadge(status) {

    const normalizedStatus =
        normalizeStatus(
            status
        );


    if (
        normalizedStatus ===
        "inactive"
    ) {

        return `

            <span style="
                display:inline-block;
                background:#ffdada;
                color:#c5221f;
                padding:5px 13px;
                border-radius:20px;
                font-size:13px;
                font-weight:700;
            ">

                Inactive

            </span>

        `;

    }


    if (
        normalizedStatus ===
        "proposed"
    ) {

        return `

            <span style="
                display:inline-block;
                background:#fff0d6;
                color:#a15c00;
                padding:5px 13px;
                border-radius:20px;
                font-size:13px;
                font-weight:700;
            ">

                Proposed

            </span>

        `;

    }


    return `

        <span style="
            display:inline-block;
            background:#d9f5d0;
            color:#137333;
            padding:5px 13px;
            border-radius:20px;
            font-size:13px;
            font-weight:700;
        ">

            Active

        </span>

    `;

}


/* =========================================================
   NORMALIZE PHONE NUMBER
========================================================= */

function normalizePhone(phoneNumber) {

    let cleanPhone =
        String(phoneNumber || "")
            .replace(
                /[^0-9]/g,
                ""
            );


    /*
       If number:
       919876543210

       convert to:
       9876543210
    */

    if (
        cleanPhone.length === 12 &&
        cleanPhone.startsWith("91")
    ) {

        cleanPhone =
            cleanPhone.slice(2);

    }


    /*
       If number longer than 10 digits,
       use last 10 digits.
    */

    if (
        cleanPhone.length > 10
    ) {

        cleanPhone =
            cleanPhone.slice(-10);

    }


    return cleanPhone;

}


/* =========================================================
   PHONE LINK
========================================================= */

function renderPhone(phoneNumber) {

    const cleanPhone =
        normalizePhone(
            phoneNumber
        );


    if (!cleanPhone) {

        return `

            <span style="
                color:#777;
            ">

                Not Available

            </span>

        `;

    }


    return `

        <a
            href="tel:+91${cleanPhone}"
            style="
                color:#108082;
                font-weight:600;
                text-decoration:none;
            "
        >

            ${escapeHtml(
                phoneNumber
            )}

        </a>

    `;

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(value || "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   POSTAL TABLE
========================================================= */

function renderPostalTable(offices) {

    const tableBody =
        document.getElementById(
            "tableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML =
        "";


    const seenRows =
        new Set();


    offices.forEach(
        function (office) {

            const block =
                office.Block &&
                office.Block !== "NA"

                    ? office.Block

                    : (
                        office.Name ||
                        "Not Available"
                    );


            const district =
                office.District ||
                "Not Available";


            const state =
                office.State ||
                "Not Available";


            const rowKey =

                normalizeText(block) +

                "_" +

                normalizeText(district) +

                "_" +

                normalizeText(state);


            if (
                seenRows.has(
                    rowKey
                )
            ) {

                return;

            }


            seenRows.add(
                rowKey
            );


            tableBody.insertAdjacentHTML(

                "beforeend",

                `

                    <tr>

                        <td>
                            ${escapeHtml(
                                block
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                district
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                state
                            )}
                        </td>

                    </tr>

                `

            );

        }
    );

}


/* =========================================================
   RENEWAL SYSTEM
========================================================= */

function setupRenewalSystem() {

    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const renewalDate =
        new Date(
            RENEWAL_DATE
        );


    renewalDate.setHours(
        0,
        0,
        0,
        0
    );


    const millisecondsPerDay =
        1000 *
        60 *
        60 *
        24;


    const differenceInDays =
        Math.ceil(

            (
                renewalDate.getTime() -
                today.getTime()
            )

            /

            millisecondsPerDay

        );


    const nextRenewalDate =
        document.getElementById(
            "nextRenewalDate"
        );


    const daysLeft =
        document.getElementById(
            "daysLeft"
        );


    if (nextRenewalDate) {

        nextRenewalDate.innerText =
            renewalDate.toLocaleDateString(

                "en-IN",

                {

                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"

                }

            );

    }


    if (daysLeft) {

        if (
            differenceInDays > 0
        ) {

            daysLeft.innerText =
                `(${differenceInDays} days left)`;


            daysLeft.style.color =
                "#108082";

        }

        else if (
            differenceInDays === 0
        ) {

            daysLeft.innerText =
                "(Today)";


            daysLeft.style.color =
                "#e67e00";

        }

        else {

            daysLeft.innerText =
                "(Expired)";


            daysLeft.style.color =
                "#d93025";

        }

    }


    const licenseVerified =
        localStorage.getItem(
            LICENSE_STORAGE_KEY
        );


    /*
       Only attempt popup if modal
       actually exists in HTML.
    */

    const renewalModal =
        document.getElementById(
            "renewalModal"
        );


    if (
        differenceInDays < 0 &&
        licenseVerified !== "true" &&
        renewalModal
    ) {

        showRenewalPopup();


        window.setInterval(

            function () {

                const currentLicenseStatus =
                    localStorage.getItem(
                        LICENSE_STORAGE_KEY
                    );


                if (
                    currentLicenseStatus !==
                    "true"
                ) {

                    showRenewalPopup();

                }

            },

            60000

        );

    }

}


/* =========================================================
   SHOW RENEWAL POPUP
========================================================= */

function showRenewalPopup() {

    const modal =
        document.getElementById(
            "renewalModal"
        );


    if (!modal) {

        return;

    }


    modal.style.display =
        "flex";


    window.setTimeout(

        function () {

            const renewalInput =
                document.getElementById(
                    "renewalCode"
                );


            if (renewalInput) {

                renewalInput.focus();

            }

        },

        100

    );

}


/* =========================================================
   RENEWAL ENTER KEY
========================================================= */

function setupRenewalEnterKey() {

    const renewalInput =
        document.getElementById(
            "renewalCode"
        );


    if (!renewalInput) {

        return;

    }


    renewalInput.addEventListener(

        "keydown",

        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                verifyRenewalCode();

            }

        }

    );

}


/* =========================================================
   VERIFY LICENSE
========================================================= */

function verifyRenewalCode() {

    const renewalInput =
        document.getElementById(
            "renewalCode"
        );


    const errorMessage =
        document.getElementById(
            "errorMsg"
        );


    const modal =
        document.getElementById(
            "renewalModal"
        );


    if (!renewalInput) {

        return;

    }


    const enteredCode =
        renewalInput.value
            .trim()
            .toLowerCase();


    const validCodes = [

        "f9a4c82d7e1b5639a0d4e8c12b7f95a3",

        "a7d8f31c9b5e6240f1c8d73a9e2b6f4d",

        "4c7e91b2d8f563a0e9d1c47b5a8f32de",

        "b3d8a1f5c7e92460d1a9f8b2e6c4d731",

        "e8f2c7d4a1b96350f7d2c8a4b1e9f632",

        "9d4f2a7c1e8b5630d7c9a4f2e1b6d835"

    ];


    if (
        enteredCode === ""
    ) {

        setLicenseError(
            "⚠️ Please enter license key"
        );

        renewalInput.focus();

        return;

    }


    if (
        !validCodes.includes(
            enteredCode
        )
    ) {

        setLicenseError(
            "❌ Invalid License Key"
        );

        renewalInput.select();

        return;

    }


    localStorage.setItem(

        LICENSE_STORAGE_KEY,

        "true"

    );


    if (modal) {

        modal.style.display =
            "none";

    }


    if (errorMessage) {

        errorMessage.innerText =
            "";

    }


    renewalInput.value =
        "";


    alert(
        "✅ License Verified Successfully"
    );

}


/*
   HTML onclick support
*/

window.verifyRenewalCode =
    verifyRenewalCode;


/* =========================================================
   LICENSE ERROR
========================================================= */

function setLicenseError(message) {

    const errorMessage =
        document.getElementById(
            "errorMsg"
        );


    if (errorMessage) {

        errorMessage.innerText =
            message;

    } else {

        console.error(
            message
        );

    }

}


/* =========================================================
   RESET LICENSE
========================================================= */

function resetPetroLicense() {

    localStorage.removeItem(
        LICENSE_STORAGE_KEY
    );


    alert(
        "Petro license reset successfully"
    );


    window.location.reload();

}


window.resetPetroLicense =
    resetPetroLicense;