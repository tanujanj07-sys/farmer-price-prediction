// ======================================================
// FARMER CURRENT MARKET RATE SYSTEM
// ======================================================


// ======================================================
// 1. DATA.GOV.IN CONFIGURATION
// ======================================================

// Get your own API key from:
// https://www.data.gov.in/
//
// IMPORTANT:
// Replace the text below with your actual API key.

const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";


// Official mandi dataset resource ID

const RESOURCE_ID =
    "9ef84268-d588-465a-a308-a864a43d0070";


// Official API URL

const API_URL =
    `https://api.data.gov.in/resource/${RESOURCE_ID}`;


// ======================================================
// 2. HTML ELEMENTS
// ======================================================

const districtSelect =
    document.getElementById("district");

const commoditySelect =
    document.getElementById("commodity");

const searchButton =
    document.getElementById("searchBtn");

const statusBox =
    document.getElementById("status");

const ratesContainer =
    document.getElementById("ratesContainer");


// ======================================================
// 3. SEARCH BUTTON
// ======================================================

searchButton.addEventListener(
    "click",
    getMarketRates
);


// ======================================================
// 4. MAIN API FUNCTION
// ======================================================

async function getMarketRates() {

    const district =
        districtSelect.value;

    const commodity =
        commoditySelect.value;


    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    if (!district || !commodity) {

        statusBox.innerHTML =
            "⚠️ Please select both district and crop.";

        ratesContainer.innerHTML = "";

        return;
    }


    // -----------------------------------------------
    // Check API key
    // -----------------------------------------------

    if (
        API_KEY === "" ||
        API_KEY === "YOUR_API_KEY_HERE"
    ) {

        statusBox.innerHTML = `
            ⚠️ API key is missing.
            <br>
            Add your data.gov.in API key
            inside <b>script.js</b>.
        `;

        ratesContainer.innerHTML = "";

        return;
    }


    // -----------------------------------------------
    // Loading
    // -----------------------------------------------

    statusBox.innerHTML =
        "⏳ Fetching latest mandi rates...";

    ratesContainer.innerHTML = "";


    // -----------------------------------------------
    // Create filters
    // -----------------------------------------------

    const filters = {

        state: "Maharashtra",

        district: district,

        commodity: commodity

    };


    // -----------------------------------------------
    // Convert filter object to URL
    // -----------------------------------------------

    const filterQuery =
        encodeURIComponent(
            JSON.stringify(filters)
        );


    // -----------------------------------------------
    // Create complete API URL
    // -----------------------------------------------

    const url =
        API_URL +
        `?api-key=${encodeURIComponent(API_KEY)}` +
        `&format=json` +
        `&limit=100` +
        `&filters=${filterQuery}`;


    console.log("API URL:", url);


    try {

        // -------------------------------------------
        // API request
        // -------------------------------------------

        const response =
            await fetch(url);


        // -------------------------------------------
        // HTTP error
        // -------------------------------------------

        if (!response.ok) {

            throw new Error(
                `HTTP Error: ${response.status}`
            );
        }


        // -------------------------------------------
        // Convert to JSON
        // -------------------------------------------

        const data =
            await response.json();


        console.log(
            "Government API Response:",
            data
        );


        // -------------------------------------------
        // Check records
        // -------------------------------------------

        if (
            !data.records ||
            data.records.length === 0
        ) {

            statusBox.innerHTML = `
                ❌ No mandi rate found.
                <br>
                Try another crop or district.
            `;

            return;
        }


        // -------------------------------------------
        // Display results
        // -------------------------------------------

        displayMarketRates(
            data.records
        );


        statusBox.innerHTML =
            `✅ ${data.records.length} latest market record(s) found.`;


    }

    catch (error) {

        console.error(
            "API Error:",
            error
        );


        statusBox.innerHTML = `
            ❌ Unable to load market data.
            <br>
            <small>
                ${escapeHTML(error.message)}
            </small>
        `;


        ratesContainer.innerHTML = `

            <div class="error-box">

                <h3>
                    ⚠️ Market Data Error
                </h3>

                <p>
                    Please check:
                </p>

                <p>
                    1. API key<br>
                    2. Internet connection<br>
                    3. data.gov.in API availability
                </p>

            </div>

        `;

    }

}


// ======================================================
// 5. DISPLAY MARKET RATES
// ======================================================

function displayMarketRates(records) {

    ratesContainer.innerHTML = "";


    records.forEach(function (record) {


        // -----------------------------------------------
        // Read API fields
        // -----------------------------------------------

        const state =
            record.state || "Maharashtra";


        const district =
            record.district || "-";


        const market =
            record.market || "-";


        const commodity =
            record.commodity || "-";


        const variety =
            record.variety || "-";


        const grade =
            record.grade || "-";


        const arrivalDate =
            record.arrival_date || "-";


        const minPrice =
            record.min_price ?? "-";


        const maxPrice =
            record.max_price ?? "-";


        const modalPrice =
            record.modal_price ?? "-";


        // -----------------------------------------------
        // Create card
        // -----------------------------------------------

        const card =
            document.createElement("div");


        card.className =
            "rate-card";


        card.innerHTML = `

            <div class="rate-header">

                <h3>
                    🌾 ${escapeHTML(commodity)}
                </h3>

                <span class="rate-date">
                    ${escapeHTML(arrivalDate)}
                </span>

            </div>


            <div class="rate-location">

                📍 ${escapeHTML(market)},
                ${escapeHTML(district)},
                ${escapeHTML(state)}

            </div>


            <p style="
                font-size:12px;
                color:#7a887d;
                margin-bottom:15px;
            ">

                Variety:
                ${escapeHTML(variety)}

                <br>

                Grade:
                ${escapeHTML(grade)}

            </p>


            <div class="price-grid">


                <div class="price-box">

                    <span>
                        Minimum
                    </span>

                    <strong>
                        ₹${formatPrice(minPrice)}
                    </strong>

                </div>


                <div class="price-box modal-price">

                    <span>
                        Modal
                    </span>

                    <strong>
                        ₹${formatPrice(modalPrice)}
                    </strong>

                </div>


                <div class="price-box">

                    <span>
                        Maximum
                    </span>

                    <strong>
                        ₹${formatPrice(maxPrice)}
                    </strong>

                </div>


            </div>


            <p style="
                margin-top:15px;
                font-size:11px;
                color:#879289;
                text-align:center;
            ">

                Price unit: ₹ per quintal

            </p>

        `;


        ratesContainer.appendChild(card);

    });

}


// ======================================================
// 6. FORMAT PRICE
// ======================================================

function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        value === "-"
    ) {

        return "-";
    }


    const number =
        Number(
            String(value)
                .replace(/,/g, "")
        );


    if (
        Number.isNaN(number)
    ) {

        return escapeHTML(value);
    }


    return number.toLocaleString(
        "en-IN"
    );

}


// ======================================================
// 7. SECURITY
// ======================================================

function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}