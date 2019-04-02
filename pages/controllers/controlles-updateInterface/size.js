let size = (data_prep)=>{
  let sizeAttr = $('.selectSize');

  let items = $(sizeAttr).children('.optSize').length;
  $(sizeAttr).each(function (i, attr) {
    let numeric_value = data_prep.getNumeric_values();
    $.each(numeric_value, function (i, item) {
      if ($(attr).length && items < numeric_value.length) {
        $(attr).append($('<option>', {
          value: numeric_value[i],
          text: numeric_value[i]
        }).addClass('optSize'))
      }
    })
  });
  $('select.selectSize').change(function () {
    updateSize()
  });

}

