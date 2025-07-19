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
          confirmButtonText: "نعم متأكد في حذف الفاتورة",
          cancelButtonText: "لا تراجع في الامر",
          reverseButtons: true,
        })
        .then((result) => {
          if (result.isConfirmed) {
            loading();
            $.ajax({
              url: `/receipt/delete/${deleteId}`,
              type: "DELETE",
              success: function (result) {
                Swal.mixin({
                  toast: true,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 1000,
                  timerProgressBar: false,
                  background: "#07bc0c",
                }).fire({ icon: "success", title: `تم حذف الفاتورة بنجاح` });
                setTimeout(() => {
                  window.location.href = "/allreceipts";
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
              text: "لم يتم حذف الفاتورة !",
              icon: "error",
            });
          }
        });
    }
  });
});
document.getElementById('employeeFilter').addEventListener('change', function () {
    const employeeId = this.value;

    fetch('/receipts/filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ employeeId: employeeId })
    })
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('receiptBody');
      tbody.innerHTML = '';

      if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 5;
        td.textContent = 'No receipts found.';
        td.className = 'text-center text-muted';
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        for (let i = 0; i < data.length; i++) {
          const receipt = data[i];
          const tr = document.createElement('tr');
          tr.className = 'receipt-row';
          tr.onclick = function () {
            window.location.href = '/receipts/' + receipt._id;
          };


          const date = document.createElement('td');
          date.textContent = moment(receipt.date).format("LL");
          tr.appendChild(date);

          const emp = document.createElement('td');
          emp.textContent = receipt.username;
          tr.appendChild(emp);

          const total = document.createElement('td');
          total.textContent = 'EGP ' + parseFloat(receipt.TOTAL).toFixed(2);
          tr.appendChild(total);

          const action = document.createElement('td');
          const link = document.createElement('a');
          link.href = '/receipts/' + receipt._id;
          link.className = 'btn btn-sm btn-outline-primary';
          link.textContent = 'View';
          action.appendChild(link);
          tr.appendChild(action);

          tbody.appendChild(tr);
        }
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