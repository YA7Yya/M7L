const ssad = document.querySelector(".delete") 
const id = ssad.getAttribute("data-idlink");
ssad.addEventListener("click", (eo) => {

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger"
    },
    buttonsStyling: false
  });
  swalWithBootstrapButtons.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true
  }).then((result) => {
    if (result.isConfirmed) {
      $.ajax({
        url: `http://localhost:80/crud/delete/${id}`,
        type: 'DELETE',
    
        success: function(result) {
       
          Swal.fire({
            title: "Good job!",
            text: "Product Has Been Deleted !",
            icon: "success",
            confirmButtonText: "Ok"
          }).then((result) => {
            if(result.isConfirmed){
              window.location.href = "/crud";
            }
          });

        }
      ,
      error: function(err){
       
        Swal.fire({
          title: "Error",
          text: "Product Isn't Deleted !",
          icon: "error"
        });
      }
    
    });
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire({
        title: "Cancelled",
        text: "Your imaginary file is safe :)",
        icon: "error"
      });
    }
  });
  });