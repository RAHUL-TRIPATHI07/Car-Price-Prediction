const form = document.getElementById("predictionForm");
const predictButton = document.getElementById("predictButton");

const resultCard = document.getElementById("resultCard");
const predictedPrice = document.getElementById("predictedPrice");

const emptyState = document.getElementById("emptyState");
const predictionContent = document.getElementById("predictionContent");

const errorMessage = document.getElementById("errorMessage");

const brandSelect = document.getElementById("brand");
const modelSelect = document.getElementById("model");

const resetButton = document.getElementById("resetButton");


// Vehicle summary elements
const summaryCarName = document.getElementById("summaryCarName");
const summaryAge = document.getElementById("summaryAge");
const summaryKm = document.getElementById("summaryKm");
const summaryFuel = document.getElementById("summaryFuel");
const summaryTransmission =
    document.getElementById("summaryTransmission");
const summaryMileage = document.getElementById("summaryMileage");
const summaryPower = document.getElementById("summaryPower");
const summarySeats = document.getElementById("summarySeats");
const summarySeller = document.getElementById("summarySeller");


/* =========================================
   LOAD BRAND / MODEL OPTIONS
========================================= */

async function loadCarOptions() {

    try {

        const response = await fetch("/car-options");

        if (!response.ok) {
            throw new Error("Failed to load car options.");
        }

        const carOptions = await response.json();


        // Add brands
        Object.keys(carOptions)
            .sort()
            .forEach(brand => {

                const option = document.createElement("option");

                option.value = brand;
                option.textContent = brand;

                brandSelect.appendChild(option);
            });


        // Store mapping for later use
        brandSelect.carOptions = carOptions;

    }

    catch (error) {

        console.error(
            "Could not load car options:",
            error
        );

        errorMessage.textContent =
            "Unable to load vehicle brands. Please refresh the page.";

        errorMessage.hidden = false;
    }
}


/* =========================================
   BRAND → MODEL DROPDOWN
========================================= */

brandSelect.addEventListener("change", function () {

    const selectedBrand = brandSelect.value;


    // Reset model dropdown
    modelSelect.innerHTML =
        '<option value="">Select model</option>';


    if (!selectedBrand) {

        modelSelect.disabled = true;

        return;
    }


    const models =
        brandSelect.carOptions[selectedBrand] || [];


    models.forEach(model => {

        const option = document.createElement("option");

        option.value = model;
        option.textContent = model;

        modelSelect.appendChild(option);
    });


    modelSelect.disabled = false;
});


/* =========================================
   DISPLAY VEHICLE SUMMARY
========================================= */

function displayVehicleSummary(data) {

    summaryCarName.textContent =
        `${data.brand} ${data.model}`;


    summaryAge.textContent =
        `${data.vehicle_age} years`;


    summaryKm.textContent =
        `${Number(data.km_driven).toLocaleString("en-IN")} km`;


    summaryFuel.textContent =
        data.fuel_type;


    summaryTransmission.textContent =
        data.transmission_type;


    summaryMileage.textContent =
        `${data.mileage} km/l`;


    summaryPower.textContent =
        `${data.max_power} bhp`;


    summarySeats.textContent =
        data.seats;


    summarySeller.textContent =
        data.seller_type;
}


/* =========================================
   FORM SUBMISSION
========================================= */

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // Hide previous messages
    errorMessage.hidden = true;


    // Disable button while prediction is running
    predictButton.disabled = true;
    predictButton.textContent = "Estimating...";


    const data = {

        brand:
            document.getElementById("brand").value,

        model:
            document.getElementById("model").value,


        vehicle_age:
            Number(
                document.getElementById("vehicle_age").value
            ),


        km_driven:
            Number(
                document.getElementById("km_driven").value
            ),


        seller_type:
            document.getElementById("seller_type").value,


        fuel_type:
            document.getElementById("fuel_type").value,


        transmission_type:
            document.getElementById("transmission_type").value,


        mileage:
            Number(
                document.getElementById("mileage").value
            ),


        max_power:
            Number(
                document.getElementById("max_power").value
            ),


        seats:
            Number(
                document.getElementById("seats").value
            )
    };


    try {

        const response = await fetch("/predict", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.error || "Prediction failed."
            );
        }


        /* -------------------------
           PRICE
        ------------------------- */

        const price =
            Number(result.predicted_price);


        predictedPrice.textContent =
            "₹" + price.toLocaleString("en-IN");


        /* -------------------------
           VEHICLE SUMMARY
        ------------------------- */

        displayVehicleSummary(data);


        /* -------------------------
           SHOW RESULT
        ------------------------- */

        emptyState.hidden = true;

        predictionContent.hidden = false;

        // Restart result animation
       resultCard.classList.remove("show-result");

       void resultCard.offsetWidth;

       resultCard.classList.add("show-result");

    }


    catch (error) {

        errorMessage.textContent =
            error.message;

        errorMessage.hidden = false;

    }


    finally {

        predictButton.disabled = false;

        predictButton.textContent =
            "Estimate Price";
    }

});

/* =========================================
   RESET PREDICTION
========================================= */

resetButton.addEventListener("click", function () {

    // Reset all form fields
    form.reset();


    // Reset model dropdown
    modelSelect.innerHTML =
        '<option value="">Select brand first</option>';

    modelSelect.disabled = true;


    // Hide prediction
    predictionContent.hidden = true;


    // Show empty state
    emptyState.hidden = false;


    // Hide error
    errorMessage.hidden = true;


    // Remove result animation
    resultCard.classList.remove("show-result");
});

/* =========================================
   INITIALIZE
========================================= */

loadCarOptions();