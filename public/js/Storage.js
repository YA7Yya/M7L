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