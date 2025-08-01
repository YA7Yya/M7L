let button = document.querySelectorAll(".delete");
let pNameInput = document.querySelector("#puname");
let wholePriceInput = document.querySelector("#puprice");
let pNotesInput = document.querySelector("#punotes");
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

getEmp.addEventListener("click", (e) => {
  if (!hasFetchedData) {
    fetchEmployeeData();
  }
});

check.addEventListener("click", (e) => {
  const selectedUsername = selectElement.value;
  if (selectedUsername) {
    location.href = `/dashboard/${selectedUsername}`;
  }
});
reloadEmployees.addEventListener("click", (e) => {
fetchEmployeeData()
});

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", function(e) {
    if (e.target.closest(".delete")) {
      let deleteId = e.target.closest(".delete").getAttribute("data-idlink");
      if (!deleteId) {
        console.error("No delete ID found.");
        return;
      }
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger",
        },
        buttonsStyling: false,
      });

      swalWithBootstrapButtons
        .fire({
          title: "Are you sure?",
          text: "لن تستطيع الرجوع عن ذلك !",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "نعم متأكد في حذف ذلك",
          cancelButtonText: "لا تراجع في الامر",
          reverseButtons: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            loading();
            $.ajax({
              url: `/crud/delete/${deleteId}`,
              type: "DELETE",
              success: function (result) {
                Swal.mixin({
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 1000,
                  timerProgressBar: false,
                  background: "#07bc0c",
                }).fire({ icon: "success", title: `تم حذف المنتج بنجاح` });
                setTimeout(() => {
                  window.location.reload();
                }, 2000);
              },
              error: function (err) {
                console.log(err); // Debugging statement
                Swal.fire({
                  title: "Error",
                  text: "Error While Deleting Product ...",
                  icon: "error",
                });
              },
            });
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire({
              title: "Cancelled",
              text: "لم يتم حذف المنتج !",
              icon: "error",
            });
          }
        });
    }
  });
});


function search_animal() {
  let input = document.getElementById("searchbar").value;
  input = input.toLowerCase();
  let x = document.getElementsByClassName("productsdata");

  for (i = 0; i < x.length; i++) {
    if (!x[i].innerHTML.toLowerCase().includes(input)) {
      x[i].style.display = "none";
    } else {
      x[i].style.display = "block";
    }
  }
}
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

 document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", function(e) {
    if (e.target.closest(".update")) {
      let updateId = e.target.closest(".update").getAttribute("data-updateid");
      console.log("Update ID:", updateId); // Debugging statement
      updateP(updateId);
    }
  });

  function updateP(updateId) {
    if (!updateId) {
      alert("Error While Getting updateid");
      return;
    }
    loading();
    $.ajax({
      url: `/crud/update/${updateId}`,
      type: "GET",
      success: function (response) {
        console.log("Response:", response); // Debugging statement
        pNameInput.value = response.PNAME;
        wholePriceInput.value = response.WHOLEPRICE;
        pNotesInput.value = response.PNOTES;
        $(".swal2-container").css("display", "none");
        $(".swal2-shown").css("overflow", "visible");
        document.querySelector(".addingForm").style.display =
          "none";
        document.querySelector(
          "#updateForm"
        ).style.display = "block";
          document.querySelector(
            "#updateBtn"
          ).style.display = "block";
        document.querySelector(
          "#addBtn"
        ).style.display = "none";
        document.getElementById(
          "updateForm"
        ).action = `/crud/update/${updateId}`;
      },

      error: function (err) {
        console.log(err);
        Swal.fire({
          title: "Error",
          text: "Error While Getting Product Data !",
          icon: "error",
        });
      },
    });
  }
});

 $(document).ready(function() {
    $('#searchInput').on('keyup', function() {
      var value = $(this).val().toLowerCase();
      $('#tableBody tr').filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
    });
  });
  const scannerContainer = document.querySelector("#scanner-container");
  const barcodeResult = document.querySelector("#barcode");
  const barcodeContainer = document.querySelector("#barcodeContainer");
  const start = document.querySelector(".start");
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
      search.style.display = "none";
      stopScanning.style.display = "block";
      reset.style.display = "block";
      barcodeResult.style.display = "block";
      barcodeContainer.style.display = "block";
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
      } else {
        console.warn("Invalid barcode detected:", detectedCode);
        return;
      }
      sendPostRequest(detectedCode);
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
    document.getElementById("loading").style.display = "flex";
    document.getElementById("loading").style.justifyContent = "center";
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
    start.style.display = "block";
    search.style.display = "block";
    scannerContainer.style.display = "none";
    currentScannerMode = "";
  }

  document.querySelector(".start.add").addEventListener("click", () => {
     if(currentScannerMode === ''){
      startScanner("add");
    }
  });

  document.querySelector(".start.search").addEventListener("click", () => {
    if(currentScannerMode === ''){
      startScanner("search");
    }
  });
  $(document).ready(function() {
    let offset = 3;
    let isLoading = false;

    $(window).on('scroll', function() {
      if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
        if (!isLoading) {
          loadMoreProducts();
        }
      }
    });

    function loadMoreProducts() {
      isLoading = true;
      $.ajax({
        url: "/loadMoreProducts",
        method: "GET",
        data: { offset: offset },
        success: function(data) {
          if (data.length > 0) {
            data.forEach(function(product) {
              let price = product.WHOLEPRICE * 1.50;
              let productRow = `
                <tr class="productsdata">
                  <td>${product.PNAME}</td>
                  <td>${product.WHOLEPRICE}</td>
                  <td>${price}</td>
                  <td>${price - product.WHOLEPRICE}</td>
                  <td>${product.PNOTES}</td>
                  <td>${moment(product.updatedAt).format('LL')}</td>
                  <td>
                    <button class="btn btn-outline-warning update" data-updateid="${product._id}">
                      <i class="fa fa-edit"></i>
                    </button>
                  </td>
                  <td class="delete">
                    <button class="btn btn-outline-danger delete" data-idlink="${product._id}">
                      <i class="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              `;
              $('#tableBody').append(productRow);
            });
            offset += 3;
            isLoading = false;
          } else {
            $(window).off('scroll');
          }
        },
        error: function(err) {
          console.error("Error loading more products:", err);
          isLoading = false;
        }
      });
    }
  });


   document.getElementById("trigger-delete").addEventListener("click", async function () {
    const { value: collection } = await Swal.fire({
      title: 'Select Collection to Delete',
      input: 'select',
      inputOptions: {
        sales: 'Sales',
        logs: 'Logs',
        products: 'Products',
        employees: 'Employees',
        sessions:"Sessions",
        storages: "Storages"
      },
      inputPlaceholder: 'Select a collection',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      inputValidator: (value) => {
        return !value && 'You need to select a collection!';
      }
    });

    if (collection) {
      const confirmResult = await Swal.fire({
        title: `Are you sure?`,
        text: `This will permanently delete the "${collection}" collection!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        confirmButtonColor: '#d33',
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#3085d6',
      });

      if (confirmResult.isConfirmed) {
        fetch("/deleteCollection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ collection })
        }).then(res => {
          if (res.redirected) {
            window.location.href = res.url;
          } else {
            Swal.fire("Error", "Something went wrong.", "error");
          }
        }).catch(() => {
          window.location.href = "/crud"
        });
      }
    }
  });