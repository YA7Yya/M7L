let pNameInput = document.getElementById("puname");
let priceInput = document.getElementById("puprice");
let pQuantity = document.getElementById("puquantity");
let pUnit = document.getElementById("puunit");
let pStatus = document.getElementById("pustatus");
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
  let addForStorage = document.querySelector(".addForStorage").style.display = "none"

          // Select elements correctly
         
          // Make sure elements are found
          if (!pNameInput || !priceInput || !pQuantity || !pUnit || !pStatus) {
            console.error("One or more input elements are not found");
            return;
          }
  
          // Set values to elements
          pNameInput.value = response.productName;
          priceInput.value = response.price;
          pQuantity.value = response.quantity;
          pUnit.value = response.unit;
          pStatus.value = response.status;
  
          $(".swal2-container").css("display", "none");
          $(".swal2-shown").css("overflow", "visible");
          document.querySelector(".addingForm").style.display = "none";
          document.querySelector("#updateForm").style.display = "block";
          
          document.getElementById("updateForm").action = `/storage/update/${updateId}`;
        },
        error: function (err) {
          console.log(err);
          Swal.fire({
            title: "Error",
            text: "Error While Getting Product Data!",
            icon: "error",
          });
        },
      });
    }
  });
    $(document).ready(function() {
        let offset = 5;
        let isLoading = false; // Flag to track loading state
      
        $(window).on('scroll', function() {
          if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
            if (!isLoading) {
              loadMoreProducts();
            }
          }
        });
      
        function loadMoreProducts() {
          isLoading = true; // Set loading state to true to prevent more requests
      
          $.ajax({
            url: "/loadMoreStorageProducts",
            method: "GET",
            data: { offset: offset },
            success: function(data) {
              if (data.length > 0) {
                data.forEach(function(product) {
                  let price = product.price * 1.50;
                  let productRow = `
                    <tr class="productsdata">
                      <td>${product.productName}</td>
                      <td>${product.quantity} / ${product.unit}</td>
                      <td style="text-align: center;font-weight: bold;">${product.price}</td>
                      <td>${product.status}</td>
                      <td>${moment(product.updatedAt).format('LL')}</td>
                      <td>
                              <button class="btn btn-outline-danger delete" data-productId="${product._id}">
                                  <i class="fa fa-trash"></i>
                                </button>
                                  <button class="btn btn-outline-warning update" data-productId="${product._id}">
                                  <i class="fa fa-edit" ></i>
                                </button>
                          </td>
                    </tr>
                  `;
                  $('#tableBody').append(productRow);
                });
                offset += 5; // Increase the offset for the next batch
                isLoading = false; // Reset loading state after content is loaded
              } else {
                // No more products to load, you can remove the scroll event listener or handle it differently
                $(window).off('scroll');
              }
            },
            error: function(err) {
              console.error("Error loading more products:", err);
              isLoading = false; // Reset loading state even on error
            }
          });
        }
      });
      let quantity = document.querySelector("#itemQuantity");
  let available = document.querySelector(".available");
  let notAvailable = document.querySelector(".notAvailable");
  document.addEventListener('DOMContentLoaded', () => {
    if (isNaN(quantity)) {
      $(notAvailable).attr("selected", true);  // Set 'غير متوفر' as selected
    }
  quantity.addEventListener('input', (event) => {  // Use 'input' event

    let changedValue = Number(event.target.value); // Convert the input value to a number
    if (changedValue === 0) {
      $(notAvailable).attr("selected", true);  // Set 'غير متوفر' as selected
    } else {
      $(available).attr("selected", true);  // Set 'متوفر' as selected if the value is not 0
    }
  });
  });



  document.getElementById('addItemForm').addEventListener('submit', function() {
          // Disable the submit button after form submission
          document.getElementById('submitButton').disabled = true;
      });
         $(document).ready(function() {
                    $('#searchInput').on('keyup', function() {
                      var value = $(this).val().toLowerCase();
                      $('#tableBody tr').filter(function() {
                        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
                      });
                    });
                  });