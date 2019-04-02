colors = (dimension,d_values,attrs,limit) =>{
  let items = $(".colorSelector").children('.optColor').length;
  $.each(dimension, function (i, item) {
    if ($(".colorSelector").length && items < dimension.length) {
      $(".colorSelector").append($('<option>', {
        value: dimension[i],
        text: dimension[i]
      }).addClass('optColor'))
    }
  })

// input colors dinamicamente
$('select.colorSelector').change(function () {
  let valor = $('select.colorSelector').val();
  for (let i = 0; i < dimension.length; i++) {
    if ((valor == dimension[i] && !isNaN(d_values[i][0])) && d_values[i].length > 10) {
      let j = limit.indexOf(dimension[i]);
      addColorsSelector(dimension[i], limit[j + 1], limit[j + 2]);
      return
    }
    if (valor == dimension[i]) {
      addColorCat(d_values[i]);
      return
    }
  }
});

// alter menu select color attr
$('div.menuColor').change(function () {
  let inputs = $('div.menuColor').children('label').children('input');
  let dataHeader = $('select.colorSelector').val();
  let index = (dimension.indexOf(dataHeader));
  let colors = [];
  let attrs = [];
  $.each(inputs, function (i, item) {
    attrs.push(inputs.get(i).id);
    colors.push(inputs.get(i).value)
  });
  if (isNaN(d_values[index][0])) {
    return updateCategoricalColor(d_values[index], dataHeader, colors)
  } else if (!isNaN(d_values[index][1]) && d_values[index].length > 10) {
    let k = limit.indexOf(dataHeader);
    return updateColorContinues(d_values[index], dataHeader, limit[k + 1], limit[k + 2])
  } else {
    return updateCategoricalColor(d_values[index], dataHeader, colors)
  }
});

// itens color pic data categorical
function addColorCat (values) {
  $('div.menuColor').children('div#legend').remove();
  $('div.menuColor').children('input').remove();
  $('div.menuColor').children('label').remove();
  // $("div#legendColor").remove();
  $.each(values, function (i, item) {
    console.log(i);
    $('div.menuColor')
      .append($('<label/>').text(item)
        .append($('<input/>')
          .css({margin: '.4rem', height: '40px'})
          .attr('type', 'color')
          .addClass('getColor')
          .attr('value', defautColor[i])
          .attr('id', item))
      )
  })
}
// itens color selector para  dados continuos
function addColorsSelector (value, min, max) {
  $('div.menuColor').children('input').remove();
  $('div.menuColor').children('label').remove();
  $('div.menuColor').children('div.legendColor').remove();
  $('div.menuColor').children('div#legend').remove();

  $('div.menuColor').append($("<div/>").attr("id","legend"));

  $('div.menuColor')
    .append($('<label/>').text(min)
      .css({margin: '.4rem'})
      .append($('<input/>')
        .css({height: '40px'})
        .attr('type', 'color')
        .addClass('getColor')
        .attr('value', '#f7f9f9')
        .attr('id', value)
        .attr('id', 'getColor1')
      ));
  $('div.menuColor')
    .append($('<label/>').text(max)
      .css({margin: '.4rem', float: 'right'})
      .append($('<input/>')
        .css({height: '40px'})
        .attr('type', 'color')
        .addClass('getColor')
        .attr('value', '#006699')
        .attr('id', value)
        .attr('id', 'getColor2')
      ));

}
}
// export {colors};
