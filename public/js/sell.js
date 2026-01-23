const scannerContainer = document.querySelector("#scanner-container");
  const searchInput = document.getElementById("searchInput");
  const start = document.querySelector(".start");
  const stopScanning = document.querySelector(".stop");
  const reset = document.querySelector(".reset");
  let firstScan = true;
  let videoTrack = null;
  let flashEnabled = true;
  let quaggaInitialized = true;
  const audio = new Audio('../scanner.mp3');
  let currentScannerMode = "";
  let scannedProducts = [];
  let totalPrice = 0;

  function startScanner(mode) {
    currentScannerMode = mode;
    if (start.style.display !== "none") {
      start.style.display = "none";
      stopScanning.style.display = "block";
      reset.style.display = "block";
      scannerContainer.style.display = "block";

      Quagga.init(
        {
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
        },
        (err) => {
          if (err) {
            console.error(err);
            Quagga.stop();
            return;
          }
          Quagga.start();
          quaggaInitialized = true;
        }
      );
    }
  }

  Quagga.onDetected((result) => {
    const barcodeInput = document.getElementById("searchInput");
    const detectedCode = result.codeResult.code;

    if (currentScannerMode === "add") {
      if (/^\d{12,13}$/.test(detectedCode)) {
        audio.play();
        console.log("Barcode detected:", detectedCode);
        firstScan = false;
        barcodeInput.value = detectedCode;
        barcodeInput.disabled = false;
      }
    }
        $.ajax({
  url: "/getProduct",
  method: "POST",
  contentType: 'application/json',
  data: JSON.stringify({ detectedCode }),
  beforeSend: function () {
    $("#loading").show();
  },
  success: function(data) {
    $("#loading").hide();
    if (data.length === 0) {
      console.warn("No products found for this barcode.");
      return false;
    } else {
      let form = document.querySelector("#myForm");
      data.forEach(function(product) {

        // Check if product already exists in scannedProducts
        let existingProductIndex = scannedProducts.findIndex(
          (item) => item.PNAME === product.PNAME
        );
        console.log(existingProductIndex);
        if (existingProductIndex !== -1) {
          // Product exists, increment quantity
          scannedProducts[existingProductIndex].QUANTITY += 1;
          // Update the corresponding row in the table
          let quantityInput = $(`.quantity-input[data-index="${existingProductIndex}"]`);
          quantityInput.val(scannedProducts[existingProductIndex].QUANTITY);
          $(`.hidden-quantity[data-index="${existingProductIndex}"]`).val(
            scannedProducts[existingProductIndex].QUANTITY
          );
          totalPrice += product.price;
        } else {
          // New product, add to scannedProducts and table
          let productRow = `
            <tr class="productsdata">
              <td>${product.PNAME}</td>
              <td>
              <input type="number" class="form-control quantity-input" value="1" min="1" step="1" style="width: 70px;" data-index="${scannedProducts.length}">
              </td>
              <td>${product.price.toFixed(2)}</td>
              <td>${product.PNOTES}</td>
              <td>${moment(product.updatedAt).format('LL')}</td>
            </tr>
          `;
          scannedProducts.push({
            PNAME: product.PNAME,
            QUANTITY: 1,
            PRICE: product.price.toFixed(2),
            PNOTES: product.PNOTES
          });
          $('#tableBody').append(productRow);
          form.insertAdjacentHTML('beforeend', `
            <div style="display: none;">
              <input type="text" value="${product.PNAME}" name="products[${scannedProducts.length - 1}][PNAME]">
              <input type="number" value="1" class="hidden-quantity" data-index="${scannedProducts.length - 1}" name="products[${scannedProducts.length - 1}][QUANTITY]">
              <input type="number" value="${product.price.toFixed(2)}" name="products[${scannedProducts.length - 1}][PRICE]">
              <input type="text" value="${product.PNOTES}" name="products[${scannedProducts.length - 1}][PNOTES]">
            </div>
          `);
          totalPrice += product.price;
        }

        // Update quantity input event listener
        const quantityInput = $(`.quantity-input[data-index="${existingProductIndex !== -1 ? existingProductIndex : scannedProducts.length - 1}"]`);
        quantityInput.data('previous-quantity', scannedProducts[existingProductIndex !== -1 ? existingProductIndex : scannedProducts.length - 1].QUANTITY);
        quantityInput.on('input', function() {
          const quantity = parseInt($(this).val(), 10) || 1;
          const index = $(this).data('index');
          const previousQuantity = parseInt(quantityInput.data('previous-quantity'), 10) || 1;

          totalPrice = totalPrice - (product.price.toFixed(2) * previousQuantity) + (product.price.toFixed(2) * quantity);
          scannedProducts[index].QUANTITY = quantity;
          $(`.hidden-quantity[data-index="${index}"]`).val(quantity);

          $("#totalPrice").text(totalPrice.toFixed(2));
          quantityInput.data('previous-quantity', quantity);
        });
      });
      if (!document.querySelector("#closeDealBtn")) {
        const btn = document.createElement("button");
        const center = document.createElement("center");
        btn.type = "submit";
        btn.id = "closeDealBtn";
        btn.className = "btn btn-success text-center mt-3";
        btn.textContent = "Close the Deal";
        form.appendChild(center);
        center.appendChild(btn);
      }

      $("#totalPriceRow").show();
      $("#totalPrice").text(totalPrice.toFixed(2));
    }
  },
  error: function(err) {
    $("#loading").hide();
    console.error("Error loading products:", err);
    let errorRow = `
      <tr>
        <td colspan="8" class="text-center">An error occurred while loading products.</td>
      </tr>
    `;
    $('#tableBody').append(errorRow);
  }
});
stopScanner()
  })

  async function stopScanner() {
    if (quaggaInitialized) {
      await Quagga.stop();
      quaggaInitialized = false;
    }
    videoTrack = null;
    stopScanning.style.display = "none";
    reset.style.display = "none";
    start.style.display = "block";
    scannerContainer.style.display = "none";
    currentScannerMode = "";
  }

stopScanning.addEventListener("click", () =>{
  stopScanner()
});

reset.addEventListener("click", async () => {
  let current = currentScannerMode;
  await stopScanner(); 
  startScanner(current); 
});

  document.querySelector(".start.add").addEventListener("click", () => {
    startScanner("add");
  });
  