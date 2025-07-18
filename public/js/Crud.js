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



// window.onscroll = function() {myFunction()};

// function myFunction() {
//   if (document.body.scrollTop > 190 || document.documentElement.scrollTop > 190) {
//     console.log("It's Working Now");
//   }else return false;
// }
