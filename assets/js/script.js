const dataInput = document.getElementById("dataInput");
const currenciesSelect = document.getElementById("currenciesSelect");
const convertButton = document.getElementById("convertButton");
const convertedResult = document.getElementById("convertedResult");
const graphSection = document.getElementById("graphSection");
const endpoint = "https://mindicador.cl/api/";

//FUNCTION TO GET API CURRENCIES DATA
async function getCurrencies() {
  try {
    const currenciesData = await fetch(endpoint);
    if (!currenciesData.ok) {
      throw new Error(
        `Error ${currenciesData.status}: ${currenciesData.statusText}`
      );
    }
    const currencies = await currenciesData.json();
    return currencies;
  } catch (error) {
    console.error("Error al obtener las divisas:", error);
  }
}
getCurrencies();

//FUNCTION TO ADD AVAILABLE CURRENCIES IN DOM
async function renderCurrenciesOptions() {
  try {
    const currenciesData = await getCurrencies();
    if (currenciesData) {
      let html = "";
      for (const key in currenciesData) {
        if (currenciesData[key].nombre) {
          html += `
            <option class="optionButton" value="${currenciesData[key].nombre}">${currenciesData[key].nombre}</option>
            `;
        }
      }
      currenciesSelect.innerHTML += html;
    }
  } catch (error) {
    console.error("Error al obtener las divisas:", error);
  }
}
renderCurrenciesOptions();

//FUNCTION TO CONVERT VALUES
async function convertCurrencies() {
  const inputValue = Number(dataInput.value);
  if (inputValue >= 0) {
    const currencyName = currenciesSelect.value;
    try {
      const currenciesData = await getCurrencies();
      if (currenciesData) {
        for (const key in currenciesData) {
          if (currenciesData[key].nombre === currencyName) {
            let currencyValue = Number(currenciesData[key].valor);
            const result = inputValue / currencyValue;
            convertedResult.innerHTML = `
            <span>Resultado:</span>
            <p id="result">${result.toFixed(2)} ${currencyName}</p>
            `;
          }
        }
      }
    } catch (error) {
      console.error("Error al obtener las divisas:", error);
    }
  } else {
    convertedResult.innerHTML = `<p id="result">Ingresa un número válido!</p>`;
  }
}

//FUNCTION TO GET CURRENCY CODE
async function getCurrencyCode() {
  const currencyName = currenciesSelect.value;
  let currencyCode = "";
  try {
    const currenciesData = await getCurrencies();
    if (currenciesData) {
      for (const key in currenciesData) {
        if (currenciesData[key].nombre === currencyName) {
          currencyCode = currenciesData[key].codigo;
          return currencyCode;
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error al obtener las divisas:", error);
  }
}

//FUNCTION TO GET HISTORICAL VALUES OF A CURRENCY
async function getCurrencyHistory() {
  let currencyCode = await getCurrencyCode();
  try {
    const dataHistoryValues = await fetch(endpoint + currencyCode);
    if (!dataHistoryValues.ok) {
      throw new Error(
        `Error ${dataHistoryValues.status}: ${dataHistoryValues.statusText}`
      );
    }
    const currencyHistoryValues = await dataHistoryValues.json();
    return currencyHistoryValues;
  } catch (error) {
    console.error("Error al obtener las divisas:", error);
  }
}

//EVENT LISTENER TO CONVERT BUTTON TO GET CURRENCY CONVERSION
convertButton.addEventListener("click", () => {
  convertCurrencies();
});

//EVENT LISTENER TO UPDATE GRAPH AND CLEAN CURRENCY CONVERSION RESULT WHEN CURRENCY IS CHANGED
currenciesSelect.addEventListener("change", () => {
  renderChartGraph();
  convertedResult.innerHTML = "";
  graphSection.innerHTML = `<canvas id="myChart"></canvas>`;
});

//FUNCTION TO CREATE VARIABLES FOR CHART CONFIGURATION
async function chartConfiguration() {
  const currencyHistoryValues = await getCurrencyHistory();
  const key = "serie";

  const chartType = "line";
  const datesInfo = currencyHistoryValues[key].map(
    (currency) => currency.fecha
  );
  const currencyDates = datesInfo.map((date) => date.substring(0, 10));
  const currencyLastDates = currencyDates.splice(0, 10);
  const currencyLastDatesReversed = currencyLastDates.reverse();

  const currencyName = currenciesSelect.value;
  const chartTitle = `${currencyName}: Valor últimos 10 días.`;
  const lineColor = "red";

  const currencyValues = currencyHistoryValues[key].map(
    (currency) => currency.valor
  );
  const currencyLastValues = currencyValues.splice(0, 10);
  const currencyLastValuesReversed = currencyLastValues.reverse();

  const chartConfig = {
    type: chartType,
    data: {
      labels: currencyLastDatesReversed,
      datasets: [
        {
          label: chartTitle,
          backgroundColor: lineColor,
          data: currencyLastValuesReversed,
        },
      ],
    },
  };
  return chartConfig;
}

//FUNCTION TO RENDER CHART IN DOM
async function renderChartGraph() {
  const chartConfig = await chartConfiguration();
  const myChart = document.getElementById("myChart");
  new Chart(myChart, chartConfig);
}
