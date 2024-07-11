let button = document.querySelectorAll(".delete");
let pNameInput = document.querySelector(".puname");
let wholePriceInput = document.querySelector(".puwholeprice");
let pNotesInput = document.querySelector(".punotes");
let updateBtns = document.querySelectorAll(".update");

document.addEventListener("DOMContentLoaded", () => {
  const deleteBtns = document.querySelectorAll(".delete");

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      let deleteId = this.getAttribute("data-idlink");
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
            $.ajax({
              url: `http://localhost:80/crud/delete/${deleteId}`,
              type: "DELETE",
              success: function (result) {
                Swal.fire({
                  title: "Success !",
                  text: "تم حذف المنتج بنجاح",
                  icon: "success",
                  confirmButtonText: "Ok",
                }).then((result) => {
                  if (result.isConfirmed) {
                    window.location.reload();
                  }
                });
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
    });
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

updateBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    let updateId = this.getAttribute("data-updateid");
    console.log("Update ID:", updateId); // Debugging statement
    updateP(updateId);
  });

  function updateP(updateId) {
    if (!updateId) {
      alert("Error While Getting updateid")
      return;
    }

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

    $.ajax({
      url: `http://localhost:80/crud/update/${updateId}`,
      type: "GET",
      success: function (response) {
        console.log("Response:", response); // Debugging statement
        pNameInput.value = response.PNAME;
        wholePriceInput.value = response.WHOLEPRICE;
        pNotesInput.value = response.PNOTES;
        $(".swal2-container").css("display", "none");
        $(".swal2-shown").css("overflow", "visible");
      let addingForm = document.querySelector(".addingForm").style.display = "none"
      let updatingForm = document.querySelector(".updatingForm").style.display = "block"
      document.getElementById("updateForm").action = `/productUpdate/${updateId}`;
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
