let pNameInput = document.getElementById("puname");
let pQuantity = document.getElementById("puquantity");
let pUnit = document.getElementById("puunit");
let pStatus = document.getElementById("pustatus");
let wholePriceInput = document.getElementById("puprice");
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
      if (e.target.closest(".delete")) {
        let deleteId = e.target.closest(".delete").getAttribute("data-productId");
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
                url: `/storage/delete/${deleteId}`,
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
  let updateBtns = document.querySelectorAll(".update");
updateBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    let updateId = this.getAttribute("data-updateid");
    console.log("Update ID:", updateId); // Debugging statement
    updateP(updateId);
  });

 document.addEventListener("DOMContentLoaded", () => {

  document.addEventListener("click", function(e) {
    if (e.target.closest(".update")) {
      let updateId = e.target.closest(".update").getAttribute("data-productId");
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
      url: `/storage/update/${updateId}`,
      type: "GET",
      success: function (response) {
        console.log("Response:", response); // Debugging statement
        pNameInput.value = response.productName;
        wholePriceInput.value = response.wholePrice;
        pQuantity.value = response.quantity;
        pUnit.value = response.unit;
        pStatus.value = response.status;
        $(".swal2-container").css("display", "none");
        $(".swal2-shown").css("overflow", "visible");
        let addingForm = document.querySelector(".addingForm").style.display =
          "none";
        let updatingForm = document.querySelector(
          "#updateForm"
        ).style.display = "block";
        document.getElementById(
          "updateForm"
        ).action = `/storage/update/${updateId}`;
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

});