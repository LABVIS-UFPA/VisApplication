// function update and create dinamic menus
// function update and create dinamic menus
function updateInteface () {
  data_prep = new DataPreparation(_data_);
  let dimension = data_prep.data_keys;
  let d_values = data_prep.data_values;
  let attrs = $('.colorSelector');
  let attrFilter = $('.filter');
  let hierarchyAttrs = $('.selectHierarchy');
  let sizeAttr = $('.selectSize');

  let limit = data_prep.limit_values;
  // input select set values

  let categorical_values = data_prep.getCategorical_values();
  $(hierarchyAttrs).each(function (i, attr) {
    let items = $(attr).children('.optHie').length;
    $.each(categorical_values, function (i, item) {
      if ($(attr).length && items < categorical_values.length) {
        $(attr).append($('<option>', {
          value: categorical_values[i],
          text: categorical_values[i]
        }).addClass('optHie'))
      }
    })
  });

  // input select set values
  $(sizeAttr).each(function (i, attr) {
    let items = $(attr).children('.optSize').length;

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

  // select color attrs
  dimension.unshift('...');
  $(attrs).each(function (i, attr) {
    let items = $(attr).children('.optColor').length;
    $.each(dimension, function (i, item) {
      if ($(attr).length && items < dimension.length) {
        $(attr).append($('<option>', {
          value: dimension[i],
          text: dimension[i]
        }).addClass('optColor'))
      }
    })
  });
  dimension.shift();

  // select filter attrs
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

  $('#sortable').sortable();
  $('#sortable').disableSelection();

  $('select.selectSize').change(function () {
    updateSize()
  });

  $('select.selectHierarchy').change(function () {
    let hie = $('select.selectHierarchy').val();
    let ul = $('.window-content').children('ul');

    let IDs = [];
    $(ul).find('li').each(function () {
      IDs.push($(this).attr('id'))
    });

    if (IDs.indexOf(hie) == -1) {
      $('.menuHie').children('.window-content').children('ul')
        .append($('<li/>')
          .css({'padding': '5px', 'font-size': '12px', 'color': '#414142', 'border': '1px solid #ddd', 'border-radius': '10px'})
          .addClass('list-group-item')
          .attr('id', hie)
          .append($('<div/>').attr('class', 'listH').addClass('media-body')
            .append($('<span/>').addClass('icon icon-arrow-combo'))
            .append($('<strong/>').text(' -' + hie))
            .append($('<span/>').addClass('remove').addClass('icon icon-trash')
              .css('float', 'right')
              .click(function () {
                $(this).parent().parent().remove()
              }))
          ))
    }
  });
  // mudanças hierarquias dinamicas
  $('ul#sortable').on('DOMSubtreeModified', function (event) {
    let ul = $('.window-content').children('ul');
    let IDs = [];
    $(ul).find('li').each(function () {
      IDs.push($(this).attr('id'))
    });
    updateHie(IDs)
  });

  $('input.setColorDefault').change(function () {
    updatevis()
  });

  $('input.setHighlightColor').change(function () {
    updatevis()
  });

  $('input.setHighlightColor').change(function () {
    updatevis()
  });

  function filterCategorcal () {
    let item_key = $('select.filter').val();
    let attr_value = $('select.categoricalFilter').val();

    let i = dimension.indexOf(item_key);
    let listItem = d_values[i];
    filterCategoricalValues(listItem, item_key, attr_value)
  }
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
            .css({margin: '.4rem', float: 'left'})
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
                  .css({height: '40px', float: 'right'})
                  .attr('type', 'color')
                  .addClass('getColor')
                  .attr('value', '#006699')
                  .attr('id', value)
                  .attr('id', 'getColor2')
              ));

  }

}
//menu principal

//limpar o menu quando mudar uma nova base de dados
function clean_menus(){
  let parent = $("#menu_settings").parent();
  $("#menu_settings").remove();
  $(".tab-group").remove();
  $(".menuColor").remove();
  $(".menuHie").remove();
  $(".menuFilter").remove();
  $(".menuDefault").remove();

  addMenu("",parent);
  updateInteface();
}

let addMenu = (name, parentElement) => {
  $(parentElement).css("backgroundColor","#f1f1f1");
  $(parentElement)
    .append($("<header/>")
      .addClass("toolbar toolbar-header")
      .attr("id","menu_settings")
      .append($("<h1/>").addClass("title")
        .text("visualization settings")
        .css("backgroundColor","#f1f1f1")))
    .append($("<div/>")
      .addClass("tab-group")
      .append($("<div/>")
        .addClass("tab-item")
        .attr("id","menuColor")
        .text("Colors"))
      .append($("<div/>")
        .addClass("tab-item")
        .attr("id","menuHie")
        .text("Hierarchy"))
      .append($("<div/>")
        .addClass("tab-item")
        .attr("id","menuSelection")
        .text("Selection"))
      .append($("<div/>")
        .addClass("tab-item")
        .attr("id","menuDefault")
        .text("Default")));

  //menu colors
  let id = $(parentElement).parent().attr('id');
  $(parentElement).append($('<div/>')
    .addClass('menuColor')
    .text('Color')
    .css({'width': '100%', 'position': 'relative', 'text-align': 'left'})
    .append($('<select/>')
      .addClass('form-control')
      .addClass('colorSelector')
      .attr('id', id + '-colorSelector'))
  );
//menu hieraquies
  $(parentElement).append($('<div/>')
    .addClass('menuHie')
    .text('Hierarchy')
    .css({'width': '100%', 'position': 'relative', 'text-align': 'left'})
    .append($('<select/>')
      .addClass('form-control')
      .addClass('selectHierarchy')
    )
    .append($('<div>/')
      .addClass('window-content')
      .append($('<ul/>')
        .addClass('list-group')
        .attr('id', 'sortable'))));

$(".menuHie").append($('<div/>')
    .addClass('menuSize')
    .text('size')
    .css({'width': '100%', 'position': 'relative', 'text-align': 'left'})
    .append($('<select/>')
      .addClass('form-control')
      .addClass('selectSize')
    ));
  $(parentElement).append($('<div/>')
    .addClass('menuFilter')
    .text('Select attribute')
    .css({'width': '100%', 'position': 'relative', 'text-align': 'left'})
    .append($('<select/>')
      .addClass('form-control')
      .addClass('filter'))
  );
//defaul visualizations
  $(parentElement).append($('<div/>')
      .addClass('menuDefault')
      .append($('<div/>')
        .append($('<label/>')
          .text('Default color')
          .css({margin: '.4rem', float: 'initial'})
          .append($('<input/>')
            .css({height: '40px', float: 'initial'})
            .attr('type', 'color')
            .addClass('setColorDefault')
            .attr('value', '#006699'))))
      .append($('<div/>')
        .append($('<label/>')
          .text(' Highlight Color')
          .addClass('HighlightColor')
          .css({margin: '.4rem', float: 'initial'})
          .append($('<input/>')
            .css({height: '40px', float: 'initial'})
            .attr('type', 'color')
            .addClass('setHighlightColor')
            .attr('id', 'setHighlightColor')
            .attr('value', '#FF1122'))))
  );

  //hiden and show menus
  // $(".menuColor").hide();
  $(".menuHie").hide();
  $('.menuFilter').hide();
  $('.menuDefault').hide();

  $("#menuColor").click(function () {
    $(".menuColor").show();
    $(".menuHie").hide();
    $(".menuFilter").hide();
    $(".menuDefault").hide();
  });
  $("#menuHie").click(function () {
    $(".menuHie").show();
    $(".menuColor").hide();
    $(".menuFilter").hide();
    $(".menuDefault").hide();
  });
  $("#menuSelection").click(function () {
    $(".menuFilter").show();
    $(".menuHie").hide();
    $(".menuColor").hide();
    $(".menuDefault").hide();
  });

  $("#menuDefault").click(function () {
    $(".menuDefault").show();
    $(".menuHie").hide();
    $(".menuColor").hide();
    $(".menuFilter").hide();
  })

};