const deleteProduct = btn => {
  const productId = btn.parentNode.querySelector("[name=_id]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  console.log(productId);
  const productCard = btn.closest(`.col-4`)

  // eslint-disable-next-line no-undef
  fetch("/admin/delete-product/"+productId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf
    }
  })
    .then(result => {
      console.log(result);
    })
    .then((data)=>{
      productCard.remove()
    }) 
    .catch(err => {
      console.log(err);
    });
};
