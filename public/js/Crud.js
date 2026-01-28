
let empname = document.getElementById("empname");
let check = document.querySelector(".check");
let getEmp = document.querySelector(".getEmp");
let opt = document.querySelector(".opt");
let selectElement = document.querySelector(".sel");
let reloadEmployees = document.querySelector(".reload");
let updateBtns = document.querySelectorAll(".update");
let hasFetchedData = false;

async function fetchEmployeeData() {
  // Clear existing options and show loading message
  selectElement.innerHTML = `<option>Loading...⏳</option>`;

  try {
    const response = await fetch(`/allEmployees`, { method: "POST" });
    const data = await response.json();

    // Clear loading message
    selectElement.innerHTML = "";

    if (!data || data.length === 0) {
      // If no data received, show "No employees found" message
      selectElement.innerHTML = "<option>No employees found</option>";
      return;
    }

    // Populate the select element with employee data
    data.forEach((emp) => {
      const option = document.createElement("option");
      option.text = emp.username;
      option.value = emp.username; // Assuming each employee has a unique username
      selectElement.appendChild(option);
    });

    hasFetchedData = true; // Mark that data has been fetched successfully
  } catch (error) {
    console.error("Error fetching employee data:", error);
    selectElement.innerHTML = "<option>Error loading data</option>";
  }
}

// getEmp.addEventListener("click", (e) => {
//   if (!hasFetchedData) {
//     fetchEmployeeData();
//   }
// });

// check.addEventListener("click", (e) => {
//   const selectedUsername = selectElement.value;
//   if (selectedUsername) {
//     location.href = `/dashboard/${selectedUsername}`;
//   }
// });
// reloadEmployees.addEventListener("click", (e) => {
// fetchEmployeeData()
// });




function loading() {
  
  let timerInterval;
  Swal.fire({
    title: "تحميل البيانات...",
    html: "يتم الان تحميل بيانات المنتج...",
    timer: 99999,
    timerProgressBar: false,
    didOpen: () => {
      Swal.showLoading();
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log("I was closed by the timer");
    }
  });
}




  const scannerContainer = document.querySelector("#scanner-container");
  const barcodeResult = document.querySelector("#barcode");
  const barcodeContainer = document.querySelector("#barcodeContainer");
  const start = document.querySelector(".start.add");
  const search = document.querySelector(".search");
  const stopScanning = document.querySelector(".stop");
  const reset = document.querySelector(".reset");
  let firstScan = true;
  let videoTrack = null;
  let flashEnabled = true;
  let quaggaInitialized = true;
  const audio = new Audio('../scanner.mp3');
  let currentScannerMode = "";

  function startScanner(mode) {
    currentScannerMode = mode;
    if (start.style.display !== "none") {
      start.style.display = "none";
      // search.style.display = "none";
      stopScanning.style.display = "block";
      reset.style.display = "block";
      barcodeResult.style.display = "block";
      // barcodeContainer.style.display = "block";
      scannerContainer.style.display = "block";
      Quagga.init({
        inputStream: {
          type: "LiveStream",
          target: document.querySelector("#scanner-container"),
        },
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "code_39_reader",
          ],
        },
      }, (err) => {
        if (err) {
          console.error(err);
          Quagga.stop();
          return;
        }
        Quagga.start();
        quaggaInitialized = true;
      });
    }
  }

  Quagga.onDetected((result) => {
    const detectedCode = result.codeResult.code;
    if (currentScannerMode === "search") {
      if (/^\d{12,13}$/.test(detectedCode)) {
        audio.play();
        console.log("Barcode detected:", detectedCode);
        firstScan = false;
        barcodeResult.disabled = false;
        barcodeResult.value = detectedCode;
      sendPostRequest(detectedCode);
      } else {
        console.warn("Invalid barcode detected:", detectedCode);
        return;
      }
    } else if (currentScannerMode === "add") {
      if (/^\d{12,13}$/.test(detectedCode)) {
        audio.play();
        console.log("Barcode detected:", detectedCode);
        firstScan = false;
        barcodeResult.disabled = false;
        barcodeResult.value = detectedCode;
      } else {
        console.warn("Invalid barcode detected:", detectedCode);
        return;
      }
    }
    stopScanner();
  });
stopScanning.addEventListener("click", () =>{
  stopScanner()
});

reset.addEventListener("click", async () => {
  let current = currentScannerMode;
  await stopScanner(); 
  startScanner(current); 
});

  async function sendPostRequest(barcode) {
    if (!barcode) {
      alert("Please provide a valid barcode.");
      return;
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/search";
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "barcode";
    input.value = barcode;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  async function stopScanner() {
    if (quaggaInitialized) {
      await Quagga.stop();
      quaggaInitialized = false;
    }
    videoTrack = null;
    stopScanning.style.display = "none";
    reset.style.display = "none";
    start.style.display = "inline";
    // search.style.display = "block";
    scannerContainer.style.display = "none";
    currentScannerMode = "";
  }

  document.querySelector(".start.add").addEventListener("click", (e) => {
    console.log(e)
     if(currentScannerMode === ''){
      startScanner("add");
    }
  });

  // document.querySelector(".search").addEventListener("click", () => {
  //   if(currentScannerMode === ''){
  //     startScanner("search");
  //   }
  // });



  
const costPrice = document.querySelector("#costPrice");
const price = document.querySelector("#price"); // صححت الـ ID لأنه في HTML بتاعك اسمه sellPrice
const profit = document.querySelector("#profit");

// حدث لكل تغيير في السعر أو تكلفة الشراء
function updateProfit() {
  const cost = parseFloat(costPrice.value) || 0; // لو فاضي اعتبره 0
  const selling = parseFloat(price.value) || 0;
  if(selling > cost){
    const calculatedProfit = selling - cost;
  profit.value = calculatedProfit.toFixed(2) + " جنيه"; // يظهر مع وحده وجنيه
  } else {
    profit.value = 0 + " جنيه"
  }

}

// استمع لتغير القيمة في أي مكان
costPrice.addEventListener("input", updateProfit);
price.addEventListener("input", updateProfit);

const totalQuantity = document.querySelector("#totalQuantity");
const displayedQuantity = document.querySelector("#displayedQuantity");
const storedQuantity = document.querySelector("#storedQuantity");

function updateQuantity() {
  const total = parseInt(totalQuantity.value) || 0;
  const displayed = parseInt(displayedQuantity.value) || 0;

  const calculatedQuantity = total - displayed;
  
  storedQuantity.value = calculatedQuantity >= 0 ? calculatedQuantity : 0; // منع السالب
}

// استمع لتغير القيمة في أي مكان
totalQuantity.addEventListener("input", updateQuantity);
displayedQuantity.addEventListener("input", updateQuantity);
  //  document.getElementById("trigger-delete").addEventListener("click", async function () {
  //   const { value: collection } = await Swal.fire({
  //     title: 'Select Collection to Delete',
  //     input: 'select',
  //     inputOptions: {
  //       sales: 'Sales',
  //       logs: 'Logs',
  //       products: 'Products',
  //       employees: 'Employees',
  //       sessions:"Sessions",
  //       storages: "Storages"
  //     },
  //     inputPlaceholder: 'Select a collection',
  //     showCancelButton: true,
  //     confirmButtonText: 'Delete',
  //     confirmButtonColor: '#d33',
  //     cancelButtonColor: '#3085d6',
  //     inputValidator: (value) => {
  //       return !value && 'You need to select a collection!';
  //     }
  //   });

  //   if (collection) {
  //     const confirmResult = await Swal.fire({
  //       title: `Are you sure?`,
  //       text: `This will permanently delete the "${collection}" collection!`,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Yes, delete it!',
  //       confirmButtonColor: '#d33',
  //       cancelButtonText: 'Cancel',
  //       cancelButtonColor: '#3085d6',
  //     });

  //     if (confirmResult.isConfirmed) {
  //       fetch("/deleteCollection", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json"
  //         },
  //         body: JSON.stringify({ collection })
  //       }).then(res => {
  //         if (res.redirected) {
  //           window.location.href = res.url;
  //         } else {
  //           Swal.fire("Error", "Something went wrong.", "error");
  //         }
  //       }).catch(() => {
  //         window.location.href = "/crud"
  //       });
  //     }
  //   }
  // });