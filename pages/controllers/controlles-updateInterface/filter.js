const filter =()=>{
  data_prep = new DataPreparation(_data_);
  let dimension = data_prep.data_keys;
  let d_values = data_prep.data_values;
  let attrFilter = $('.filter');
  let limit = data_prep.limit_values;



  dimension.unshift('...');
  $(attrFilter).each(function (i, attr) {
    let items = $(attr).children('.optFilter').length;
    $.each(dimension, function (i, item) {
      if ($(attr).length && items < dimension.length) {
        $(attr).append($('<option>', {
          value: dimension[i],
          text: dimension[i]
        }).addClass('optFilter'))
      }
    })
  });
  dimension.shift();


// input filter
  $('select.filter').change(function () {
    let valor = $('select.filter').val();
    for (let i = 0; i < dimension.length; i++) {
      if ((valor == dimension[i] && !isNaN(d_values[i][0])) && d_values[i].length > 10) {
        let j = limit.indexOf(dimension[i]);
        $('div.menuFilter').children('div').remove();
        $('select.categoricalFilter').remove();

        $('select.filter').parent()
          .append($('<div/>')
            .append($('<div/>')
              .append($('<p/>')
                .text('min:' + limit[j + 1])
                .css('float', 'left'))
              .append($('<p/>')
                .text('max:' + limit[j + 2])
                .css('float', 'right')))

            .append($('<div/>')
              .attr('id', 'slider-range')
              .css({'width': '90%',
                'margin': 'auto',
                'margin-top': '10px'}))

            .append($('<input/>')
              .attr('type', 'text')
              .attr('id', 'amount')
              .attr('readonly', false)
              .css({'margin-top': '25px',
                'border': 0,
                'color': '#0fa0f6',
                'font-weight': 'bold'})));

        $(function () {
          $('#slider-range').slider({
            range: true,
            min: limit[j + 1],
            max: limit[j + 2],
            values: [ limit[j + 1], limit[j + 2]],
            slide: function (event, ui) {
              $('#amount').val('min: ' + ui.values[ 0 ] + ' ~max: ' + ui.values[ 1 ]);
              console.log(ui.values[ 0 ]);
              console.log(ui.values[ 1 ]);
              filterColorContinues(
                valor,
                limit[j + 1],
                limit[j + 2]
                , ui.values[ 0 ],
                ui.values[ 1 ])
            }
          });
          $('#amount').val(' ' + $('#slider-range').slider('values', 0) +
            ' ~ ' + $('#slider-range').slider('values', 1))
        });
        return
      } else if (valor == dimension[i]) {
        $('div.menuFilter').children('div').remove();
        $('select.categoricalFilter').remove();

        $('select.filter').parent()
          .append($('<select/>')
            .addClass('categoricalFilter')
            .addClass('form-control')
            .css('marginTop', '10px'));

        let index = dimension.indexOf(valor);

        $('.categoricalFilter')
          .append($('<option>').text('...'));

        $(d_values[index]).each(function (i, attr) {
          $('.categoricalFilter').append($('<option>', {
            value: d_values[index][i],
            text: d_values[index][i]
          }).addClass('opt Categorical Filter'));

          $('.categoricalFilter').change(function () {
            filterCategorcal()
          })
        });
        return
      }
    }
  });



  function filterCategorcal () {
    let item_key = $('select.filter').val();
    let attr_value = $('select.categoricalFilter').val();

    let i = dimension.indexOf(item_key);
    let listItem = d_values[i];
    filterCategoricalValues(listItem, item_key, attr_value)
  }

}

