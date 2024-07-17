let button = document.querySelectorAll(".delete");
let pNameInput = document.querySelector("#puname");
let wholePriceInput = document.querySelector("#puprice");
let pNotesInput = document.querySelector("#punotes");
let empname = document.getElementById("empname");
let check = document.querySelector(".check");
let getEmp = document.querySelector(".getEmp");
let opt = document.querySelector(".opt");
let selectElement = document.querySelector(".sel");
let updateBtns = document.querySelectorAll(".update");
getEmp.addEventListener("click", (e) => {
  async function fetchEmployeeData() {
    // Clear existing options and show loading message
    selectElement.innerHTML = `<option >Loading...⏳</option>`;

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
      // Create a new option element
      let option = document.createElement("option");
      option.text = emp.username;
      option.value = emp.username; // Assuming each employee has a unique username
      // Append the option to the select element
      selectElement.appendChild(option);
    });
  }

  fetchEmployeeData();
});

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
            loading()
            $.ajax({
              url: `/crud/delete/${deleteId}`,
              type: "DELETE",
              success: function (result) {
                Swal.mixin({
                  toast: !0,
                  position: "top-end",
                  showConfirmButton: !1,
                  timer: 1000,
                  timerProgressBar: !1,
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
updateBtns.forEach((btn) => {
  btn.addEventListener("click", function () {
    let updateId = this.getAttribute("data-updateid");
    console.log("Update ID:", updateId); // Debugging statement
    updateP(updateId);
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
        let addingForm = document.querySelector(".addingForm").style.display =
          "none";
        let updatingForm = document.querySelector(
          "#updateForm"
        ).style.display = "block";
        document.getElementById(
          "updateForm"
        ).action = `/productUpdate/${updateId}`;
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
