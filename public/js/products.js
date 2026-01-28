let button = document.querySelectorAll(".delete");
let pNameInput = document.querySelector("#editName");
let barcodeInput = document.querySelector("#editBarcode");
let costPriceInput = document.querySelector("#editCostPrice");
let priceInput = document.querySelector("#price");
let unitInput = document.querySelector("#editUnit");
let totalQuantityInput = document.querySelector("#editTotalQuantity");
let displayedInput = document.querySelector("#editDisplayedQuantity");
let storedInput = document.querySelector("#editStoredQuantity");
let pNotesInput = document.querySelector("#editNotes");
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
        barcodeInput.value = response.barcode;
        costPriceInput.value = response.costPrice;
        priceInput.value = response.price;
        unitInput.value = response.unit;
        totalQuantityInput.value = response.totalQuantity;
        displayedInput.value = response.displayedQuantity;
        storedInput.value = response.storedQuantity;
        pNotesInput.value = response.PNOTES;
        $(".swal2-container").css("display", "none");
        $(".swal2-shown").css("overflow", "visible");
        document.querySelector(
          "#updateForm"
        ).style.display = "block";


          document.querySelector(
            "#updateBtn"
          ).style.display = "block";
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
  const page = document.body.dataset.page;

$(document).ready(function() {
        let offset = 5;
    let isLoading = false;
    if (page === "products") {
    $(window).on('scroll', function() {
      if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
        if (!isLoading) {
          loadMoreProducts();
        }
      }
    });
} else {
return false;
}


    function loadMoreProducts() {
      isLoading = true;
      $.ajax({
        url: "/loadMoreProducts",
        method: "GET",
        data: { offset: offset },
        success: function(data) {
          if (data.length > 0) {
            data.forEach(function(product) {
              let price = product.price * 1.50;
              let productRow = `
                <tr class="productsdata">
                  <td>${product.PNAME}</td>
                  <td>${product.price}</td>
                  <td>${price}</td>
                  <td>${price - product.price}</td>
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
            offset += 5;
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
 document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", function(e) {
    if (e.target.closest(".update")) {
      let updateId = e.target.closest(".update").getAttribute("data-updateid");
      console.log("Update ID:", updateId); // Debugging statement
      updateP(updateId);
    }
  });


});

// مش فاهم الجزء دا كلههههههههه
function openModal(modal) {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("active");
  setTimeout(() => {
    document.body.style.overflow = "";
  }, 250);
}

document.addEventListener("click", function (e) {
  const btn = e.target.closest(".update");
  if (!btn) return;

  const id = btn.dataset.modalId;
  const modal = document.querySelector(
    `.editModal[data-modal-id="${id}"]`
  );

  if (modal) openModal(modal);
});

document.addEventListener("click", function (e) {
  if (e.target.matches(".closeModal, .cancelEdit")) {
    const modal = e.target.closest(".editModal");
    if (modal) closeModal(modal);
  }
});


const costPrice = document.querySelector("#editCostPrice");
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

const totalQuantity = document.querySelector("#editTotalQuantity");
const displayedQuantity = document.querySelector("#editDisplayedQuantity");
const storedQuantity = document.querySelector("#editStoredQuantity");

function updateQuantity() {
  const total = parseInt(totalQuantity.value) || 0;
  const displayed = parseInt(displayedQuantity.value) || 0;

  const calculatedQuantity = total - displayed;
  
  storedQuantity.value = calculatedQuantity >= 0 ? calculatedQuantity : 0; // منع السالب
}

// استمع لتغير القيمة في أي مكان
totalQuantity.addEventListener("input", updateQuantity);
displayedQuantity.addEventListener("input", updateQuantity);