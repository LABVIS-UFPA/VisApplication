// controle e criação das interfaces ini
const { exec } = require('child_process');
const fs = require('fs');
const ipc = require('electron').ipcRenderer;
const vis = require('@labvis-ufpa/vistechlib');
const d3 = require('d3');
const SvgSaver = require('svgsaver');


console.log(vis);
console.log(ipc);
let _data_;
let data_prep;

let defautColor = d3.scaleOrdinal(d3.schemeTableau10);
let interaction = new Interaction_Chosen();
let inputVis = '';

/** create and add graphic to selected html div. Exemplo de uso **addVis(scatterplotMatrix,contentDiv)** .
 * @param {string} visName - name of graphic selected to be created
 * @param {string} parentElement - div class name where view will be added
 * @event
 * @return {object} svg visualization
 * */
let addVis = (visName, parentElement, select) => {
  let pc = new vis[visName](parentElement)

  layer(false)

  interaction.setElemt(pc)
  interaction.selectInteraction(inputVis);
  interaction.strategy.start();

}

ipc.on('add-vis', function (event, arg) {
  addVis(arg, $('.partition-content').get(0))
})

ipc.on('file-data', function (event, data) {
  _data_ = data
  data_prep = new DataPreparation(_data_);
  clean_menus()
  updatevis()
})

ipc.on('change-datasample', function (event, data) {
  _data_ = data
  clean_menus()
  updatevis()
})

ipc.on('cl', function (event, arg) {
  console.log('from_main: ', arg)
})

const layer = (boolean) => {
  $('.partition-content').each(function () {
    if (this.__vis__) {
      this.__vis__.setInteractionMode(boolean)
    }
  })
}

// --------------------------interface tela inicial---------------------------------------------------------------------------------------
$(document).ready(function () {
  ipc.send('document-ready')
  let $body = $('body')
  let partitionLayout = new PartitionLayout($body.get(0))

  $(window).resize(function () {
    $('.partition-content').each(function () {
      if (this.__vis__) {
        this.__vis__.resize()
      }
    })
  })

  // resize menus ------------------------------------------
  $body.on('layout:resize', '.partition-node', function (e) {
    let content = $(this).children('.partition-content').get(0)

    if (content && content.__vis__) {
      content.__vis__.resize()
    }
  })

  $body.on('layout:created', '.partition-node', function (e) {
    console.log('layout:created', this)
    if (this !== e.target) {
      return
    }
    // verificação para criação dos butões
    if ($(this).children('.partition-content').children().is('button.btn.btn-large.btn-positive')) {
      $(this).children('.partition-content').children().attr('data-nodeid', $(this).attr('id'))
      return
    } else
      // não fazer nada caso existam menus
      if ($(this).children('.partition-content').children('.partition-content').children().is('#menu_settings')) {
        return
      }
    // verificar para abrir apenas um menu de settings
    $('.partition-content').each(function (i, item) {
      $(item).children('.AddSettings').remove()

    })

    if (!$('#menu_settings').length) {
      $(this).children('.partition-content').append($('<button/>')
        .text(' view settings ')
        .addClass('AddSettings')
        .addClass('btn btn-large btn-positive')
        .addClass('icon icon-cog')
        .attr('data-nodeid', $(this).attr('id'))
        .css({ 'float': 'right' }))

      $.contextMenu({
        selector: '.AddSettings',
        trigger: 'left',
        callback: function (key) {
          if (_data_) {
            let content = $('#' + $(this).attr('data-nodeid')).children('.partition-content')
            let partition = $(this).parents('.partition-node').attr('id')
            content.empty()
            addMenu(content)
            updateInterface()
            //ipc.send('update-sampledata', {})
          } else {
            alert('You have to link data first')
            ipc.send('not-data')
          }
        },
        items: {
          'menu settings visualization': { name: 'settings visualization' }
        }

      })
    }

    $(this).children('.partition-content').append($('<button/>')
      .text('Add Visualization')
      .addClass('btn btn-large btn-positive')
      .attr('data-nodeid', $(this).attr('id'))
      .css({ 'float': 'right' }))

    $.contextMenu({
      selector: '.btn.btn-large.btn-positive',
      trigger: 'left',
      build: function ($trigger, e) {
        let options = {
          callback: function (key, opt) {
            if (_data_) {
              let select;
              let name;
              if (key.split(',')) {
                key = key.split(',');
                name = key[0];
                select = key[1];
              }

              let content = $('#' + $(this).attr('data-nodeid')).children('.partition-content')
              content.empty();
              settings_individual_for_views(content.get(0));
              addVis(name, content.get(0));

              ipc.send('update-sampledata', {});
              createVis(content.get(0), select);
              updateInterface();

            } else {
              alert('You have to link data first')
              ipc.send('not-data')
            }

          },
          items: {
            "ParallelCoordinates": {
              name: "Parallel Coordinates",
            },
            "ParallelBundling": {
              name: "Bundled Parallel Coordinates",
            },
            "ScatterplotMatrix": {
              name: "Scatter Plot",
              items: {},
            },
            "BeeswarmPlot": {
              name: "Beeswarm Plot",
              items: {},
            },
            "Treemap": {
              name: "Treemap",
            },
            "Histogram": {
              name: "Histogram ",
              items: {},
            },
            "Sunburst": {
              name: "Sunburst"
            },
            'BarChart': {
              name: 'Bar Chart',
              items: {},
            },
            "CirclePacking": {
              name: "CirclePacking",
            },
            // "PieChart": {
            //   name: "PieChart",
            //   items: {},
            // },
          }
        };

        let keys = data_prep.data_keys;
        let names = [
          "ScatterplotMatrix",
          "BeeswarmPlot",
          "Histogram",
          "BarChart",
          // "PieChart"
        ];

        //function createSubItens(options, names, keys) {
        let i = 0;
        for (let i = 0; i < names.length; i++) {
          options.items[names[i]].items[names[i]] = {
            "name": 'all', className: 'list_collunms'
          }
          for (let j = 0; j < keys.length; j++) {
            options.items[names[i]].items[[names[i], keys[j]]] =
            {
              "name": keys[j],
              "value": names[i],
              "className": 'list_collunms',
            }

          }

        }
        return options;
        //}

        //return createSubItens(options, arrayNames, keys);
      }

    })

    // Download Visualizations ------------------------------------------------------
  })
})

//-------------------------- menu de configurações iniciais------------------------------------------------------------------

/**
 * @description - menu setting individual and functions selection,propriets,ands expots
 * @param {object} vis_container - container html for add vis and settings
 * */
let settings_individual_for_views = (vis_container) => {
  let keys = data_prep.data_keys;

  //flag selected
  let keysflag = keys.map(item => { return { [item]: { status: false } } });
  let selections = [];
  let id = $(vis_container).parent().attr('id');
  $(vis_container)
    .append($('<button/>')
      .addClass('config')
      .addClass('config' + id)
      .append($('<img/>').attr('src', './public/css/icons/gear.png'))
      .attr('data-nodeid', $(this).attr('id'))
      .css({
        'position': 'absolute',
        'border': 'none',
        'border-radius': '10px',
        'background-color': 'rgb(0, 0, 0,0)',
      }))

  $.contextMenu({
    selector: '.config' + id,
    trigger: 'left',
    build: function ($trigger, e) {
      let options = {
        callback: function (key) {
          let svg = vis_container.children[1];
          switch (key) {
            case 'svg':
              let svgsaver = new SvgSaver();
              console.log(svg);
              svgsaver.asSvg(svg);

              break;
            // case 'pdf':
            //
            //
            //   break;
            default:
              break;
          }
        },
        items: {
          "collunms": {
            name: "select columns",
            className: 'list_collunms',
            items: {},
            disabled: false
          },
          'chart': { name: 'chart properties' },
          'export': {
            name: "exports",
            items: {
              'svg': {
                name: 'svg'
              },
              // 'pdf': {
              //   name: 'pdf'
              // }
            }

          }
        }
      };

      //create dinaminc itens data colunns
      options.items.collunms.items['all'] = {
        "name": 'all', type: 'checkbox',
        value: 'all',
        className: 'list_collunms',
        selected: false,
        events: {
          click: function (e) {
            if (this.checked === true) {
              createVis(vis_container);
            }
          }
        }
      }
      //save status of colluns selected
      function status(index, name) {
        return keysflag[index][name].status;
      }

      for (let i = 0; i < keys.length; i++) {
        options.items.collunms.items[keys[i]] = {
          "name": keys[i],
          type: 'checkbox',
          value: keys[i],
          className: 'list_collunms',
          checked: status(i, keys[i]),
          selected: status(i, keys[i]),
          events: {
            click: function (e) {
              if (this.checked === true) {
                keysflag[i][this.value].status = true;
                selections.push(this.value);

              } else {
                keysflag[i][this.value].status = false;
                selections = selections.filter(item => { return item !== this.value });
              }
              selectColumnsInVis(vis_container, selections);

            }
          }
        }
      }

      return options;
    }
  });
}


// --atualizar interface tools ferramentas de interação -------------------------------------------------------------------------------------------

/** import html structure from folder settings menu **public / html /**
 * @param {string} parentElement - parent div id title where element will be added
 * @interface
 * */
let menu_tools = async (parentElement) => {
  await $(parentElement).load('public/html/menu-tools.html')

}

function updateTools() {
  const details = () => {
    const dimension = data_prep.data_keys

    for (let i = 0; i < dimension.length; i++) {
      $('div.menu-details')
        .append($('<input/>')
          .attr('class', 'myCheckbox')
          .attr('type', 'checkbox')
          .attr('value', dimension[i]))
        .append($('<label/>')
          .css({
            'text-align': 'center',
            'display': 'initial',
            'font-size': '13px'
          })
          .text(dimension[i]).append($('<br/>')))
    }
  }
  details()
}

/**
 * Refresh the interface as you enter data and create submenus with interactions and click changes, function responsible for updating color menu options, filter, hierarchies, demand details and all other menus use **updateInteface()** .
 * @event
 * @return {object} updated html element
 * */
function updateInterface() {
  data_prep = new DataPreparation(_data_);
  const dimension = data_prep.data_keys;
  const d_values = data_prep.data_values;
  const limit = data_prep.limit_values;

  // --------------parte dinamica dos menus---------
  // ------colors-----------------
  /**
   * use **colors()** To create options in the html color menu and add the color selection inputs as needed, you can add various inputs or color range. Use the html element in the html **colorSelector** class to select and update options.
   * @interface
   * @tutorial menu-color
   * */
  const colors = () => {
    let items = $('.colorSelector').children('.optColor').length
    $.each(dimension, function (i, item) {
      if ($('.colorSelector').length && items < dimension.length) {
        $('.colorSelector').append($('<option>', {
          value: dimension[i],
          text: dimension[i]
        }).addClass('optColor'))
      }
    });

    // input colors dinamicamente
    $('select.colorSelector').change(function () {
      let valor = $('select.colorSelector').val()
      for (let i = 0; i < dimension.length; i++) {
        if ((valor == dimension[i] && !isNaN(d_values[i][0])) && d_values[i].length > 10) {
          let j = limit.indexOf(dimension[i])
          addColorsSelector(dimension[i], limit[j + 1], limit[j + 2])
          return
        }
        if (valor == dimension[i]) {
          addColorCat(d_values[i])
          return
        }
      }
    });

    // alter menu select color attr
    $('div.menuColor').change(function () {
      let inputs = $('div.menuColor').children('label').children('input')
      let dataHeader = $('select.colorSelector').val()
      let index = (dimension.indexOf(dataHeader))
      let colors = []
      let attrs = []
      $.each(inputs, function (i, item) {
        attrs.push(inputs.get(i).id)
        colors.push(inputs.get(i).value)
      })
      if (isNaN(d_values[index][0])) {
        updateCategoricalColor(d_values[index], dataHeader, colors)
      } else if (!isNaN(d_values[index][1]) && d_values[index].length > 10) {
        let k = limit.indexOf(dataHeader)
        console.log("teste:", dataHeader);
        console.log("teste:2", d_values[index])
        let color1 = $("#getColor1").val();
        let color2 = $("#getColor2").val();
        updateColorContinues(dataHeader, limit[k + 1], limit[k + 2], color1, color2)
      } else {
        updateCategoricalColor(d_values[index], dataHeader, colors)
      }
    })

    // itens color pic data categorical
    function addColorCat(values) {
      $('div.menuColor').children('div#legend').remove()
      $('div.menuColor').children('input').remove()
      $('div.menuColor').children('label').remove()
      // $("div#legendColor").remove();
      $.each(values, function (i, item) {
        $('div.menuColor')
          .append($('<label/>').text(item)
            .append($('<input/>')
              .css({ margin: '.4rem', height: '40px' })
              .attr('type', 'color')
              .addClass('getColor')
              .attr('value', defautColor(i))
              .attr('id', item))
          )
      })
    }
    // itens color selector para  dados continuos
    function addColorsSelector(value, min, max) {
      $('div.menuColor').children('input').remove()
      $('div.menuColor').children('label').remove()
      $('div.menuColor').children('div.legendColor').remove()
      $('div.menuColor').children('div#legend').remove()

      $('div.menuColor').append($('<div/>').attr('id', 'legend'))

      //mimimo
      $('div.menuColor')
        .append($('<label/>').text(min)
          .css({ margin: '.4rem' })
          .append($('<input/>')
            .css({ height: '40px' })
            .attr('type', 'color')
            .addClass('getColor')
            .attr('value', '#e9e9e9')
            .attr('id', value)
            .attr('id', 'getColor1')
          ))

      //maximo
      $('div.menuColor')
        .append($('<label/>').text(max)
          .css({ margin: '.4rem', float: 'right' })
          .append($('<input/>')
            .css({ height: '40px' })
            .attr('type', 'color')
            .addClass('getColor')
            .attr('value', '#4e79a7')
            .attr('id', value)
            .attr('id', 'getColor2')
          ))
    }
  }

  /**
   * use **filter()** To create options in the html menu and filter according to the data, selector can be created for categorical attributes or numeric range for continuous attributes. and use the html **filter** class to add options and interactions
   * @interface
   * @tutorial filter
   * */
  // filter-------------------
  const filter = () => {
    data_prep = new DataPreparation(_data_)
    let dimension = data_prep.data_keys
    let d_values = data_prep.data_values
    let attrFilter = $('.filter')
    let limit = data_prep.limit_values

    dimension.unshift('...')
    $(attrFilter).each(function (i, attr) {
      let items = $(attr).children('.optFilter').length
      $.each(dimension, function (i, item) {
        if ($(attr).length && items < dimension.length) {
          $(attr).append($('<option>', {
            value: dimension[i],
            text: dimension[i]
          }).addClass('optFilter'))
        }
      })
    })
    dimension.shift()

    // input filter
    $('select.filter').change(function () {
      let valor = $('select.filter').val()
      for (let i = 0; i < dimension.length; i++) {
        if ((valor == dimension[i] && !isNaN(d_values[i][0])) && d_values[i].length > 10) {
          let j = limit.indexOf(dimension[i])
          $('div.menuFilter').children('div').remove()
          $('select.categoricalFilter').remove()

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
                .css({
                  'width': '90%',
                  'margin': 'auto',
                  'margin-top': '10px'
                }))

              .append($('<input/>')
                .attr('type', 'text')
                .attr('id', 'amount')
                .attr('readonly', false)
                .css({
                  'margin-top': '25px',
                  'border': 0,
                  'color': '#0fa0f6',
                  'font-weight': 'bold'
                })))

          $(function () {
            $('#slider-range').slider({
              range: true,
              min: limit[j + 1],
              max: limit[j + 2],
              values: [limit[j + 1], limit[j + 2]],
              slide: function (event, ui) {
                $('#amount').val('min: ' + ui.values[0] + ' ~max: ' + ui.values[1])
                filterColorContinues(
                  valor,
                  limit[j + 1],
                  limit[j + 2]
                  , ui.values[0],
                  ui.values[1])
              }
            })
            $('#amount').val(' ' + $('#slider-range').slider('values', 0) +
              ' ~ ' + $('#slider-range').slider('values', 1))
          })
          return
        } else if (valor == dimension[i]) {
          $('div.menuFilter').children('div').remove()
          $('select.categoricalFilter').remove()

          $('select.filter').parent()
            .append($('<select/>')
              .addClass('categoricalFilter')
              .addClass('form-control')
              .css('marginTop', '10px'))

          let index = dimension.indexOf(valor)

          $('.categoricalFilter')
            .append($('<option>').text('...'))

          $(d_values[index]).each(function (i, attr) {
            $('.categoricalFilter').append($('<option>', {
              value: d_values[index][i],
              text: d_values[index][i]
            }).addClass('opt Categorical Filter'))

            $('.categoricalFilter').change(function () {
              filterCategorcal()
            })
          })
          return
        }
      }
    })

    function filterCategorcal() {
      let item_key = $('select.filter').val()
      let attr_value = $('select.categoricalFilter').val()

      filterCategoricalValues(item_key, attr_value)
    }
  }

  /**
   * use **hierarchies()** create data hierarchies for hierarchical viewing, and drag and drop control, the hierarchy options html interface is created and multiple hierarchies can also be added or removed through interactions. html **selectHierarchy** class is used to create html elements
   * @interface
   * @tutorial hierarchy
   * */
  // hieraquies----------

  const hierarchies = () => {
    let hierarchyAttrs = $('.selectHierarchy');
    let categorical_values = data_prep.data_keys;

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

    $('select.selectHierarchy').change(function () {
      let hie = $('select.selectHierarchy').val()
      let ul = $('.window-content').children('ul')

      let IDs = []
      $(ul).find('li').each(function () {
        IDs.push($(this).attr('id'))
      })

      if (IDs.indexOf(hie) == -1) {
        $('.menuHie').children('.window-content').children('ul')
          .append($('<li/>')
            .css({ 'padding': '5px', 'font-size': '12px', 'color': '#414142', 'border': '1px solid #ddd', 'border-radius': '10px' })
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
    })

    // mudanças hierarquias dinamicas
    $('ul#sortable').on('DOMSubtreeModified', function (event) {
      let IDs = []
      let ul = $('.window-content').children('ul')
      $(ul).find('li').each(function () {
        IDs.push($(this).attr('id'))
      })
      updateHie(IDs)
    })

    $('#sortable').sortable()
    $('#sortable').disableSelection()
  }

  // ---size--------------
  /**
   * use **size()** to create and size select options to display items. use html select **selectSize** to create elements
   * @interface
   * */
  const size = () => {
    let sizeAttr = $('.selectSize')

    let items = $(sizeAttr).children('.optSize').length
    $(sizeAttr).each(function (i, attr) {
      let numeric_value = data_prep.getNumeric_values()
      $.each(numeric_value, function (i, item) {
        if ($(attr).length && items < numeric_value.length) {
          $(attr).append($('<option>', {
            value: numeric_value[i],
            text: numeric_value[i]
          }).addClass('optSize'))
        }
      })
    })
    $('select.selectSize').change(function () {
      updateSize(this.value);
    })
  }
  // ---------------default menu--------------------
  /**
   * use **defaultMenu()** to create the default item creation color control html and higlight. use html select **input.setColorDefault** and **input.setHighlightColor** to create elements and changes
   * @interface
   * @tutorial default-colors
   * */
  const defaultMenu = () => {
    $('input.setColorDefault').change(function () {
      updatevis()
    })

    $('input.setHighlightColor').change(function () {
      updatevis()
    })

    $('input.setHighlightColor').change(function () {
      updatevis()
    })
  }
  /**
   * use **filter_by_dimension()** create html data dimension filter options, create filter option checbox and use html class **menu-filter_dimension** to add checkboxes
   * @interface
   * @tutorial filter-dimension
   * */
  // -------filtro nas dimensões--------------------------------------------------
  const filter_by_dimension = () => {
    data_prep = new DataPreparation(_data_)
    const dimension = data_prep.data_keys

    let props = elements['filter_by_dimension']
    $('div.menu-filter_dimension')
      .append($('<div>')
        .text(props[0].text))

    for (let i = 0; i < dimension.length; i++) {
      $('div.menu-filter_dimension')
        .append($('<input>')
          .attr('type', props[0].type)
          .attr('value', dimension[i])
          .addClass('myCheckboxDimension')
        )
        .append($('<label>')
          .text(dimension[i]))
        .append($('<br>'))
    }
    $('.myCheckboxDimension').change(function () {
      updateFilter_by_dimension()
    })
  }

  colors()
  hierarchies()
  size()
  filter()
  defaultMenu()
  filter_by_dimension()
}

// -----------------limpar o menu quando mudar uma nova base de dados------------------------------------------------------------
/**
 *event to clear settings menu interface use  **clean_menus()** .
 *function to clear html from application settings menu
 * @event
 * @return {object} html element
 */
function clean_menus() {
  let parent = $('#menu_settings').parent().parent();
  $('#menu_settings').remove();

  parent.empty();
  addMenu(parent)
  updateInterface()
}
// ----------------list item menu----------------------------------------------------------------------------------

/**
 * create html menu of settings and control of interfaces of submenus hiden and show
 * @param {string} parentElement - parent element id title where the menu will be added
 * @interface
 * @tutorial menu-settings
 */
let addMenu = async (parentElement) => {
  await $(parentElement).load('public/html/menu-settings-vis.html')
  $(document).ready(function () {

    //resumir essa parte
    $('.Color').click(function () {
      $('.color-header').children('button').children('#plus-minus').remove()
      if ($('.color-header').is(':visible')) {
        $('.color-header').hide()
        $('.menuColor').hide()
      } else {
        $('button.color-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.color-header').show()
        $('.menuColor').show()
      }
    })

    $('.Hie').click(function () {
      $('.hierarchy-header').children('button').children('#plus-minus').remove()
      if ($('.hierarchy-header').is(':visible')) {
        $('.hierarchy-header').hide()
        $('.menuHie').hide()
      } else {
        $('button.hierarchy-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.hierarchy-header').show()
        $('.menuHie').show()
      }
    })

    $('.Filter').click(function () {
      $('.filter-header').children('button').children('#plus-minus').remove()
      if ($('.filter-header').is(':visible')) {
        $('.filter-header').hide()
        $('.menuFilter').hide()
      } else {
        $('button.filter-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.filter-header').show()
        $('.menuFilter').show()
      }
    })

    $('.Default').click(function () {
      $('.default-header').children('button').children('#plus-minus').remove()
      if ($('.default-header').is(':visible')) {
        $('.default-header').hide()
      } else {
        $('button.default-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.default-header').show()
        $('.menuDefault').show()
      }
    })

    $('.Filter_Dimension').click(function () {
      $('.filter_dimension-header').children('button').children('#plus-minus').remove()
      if ($('.filter_dimension-header').is(':visible')) {
        $('.filter_dimension-header').hide()
      } else {
        $('button.filter_dimension-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.filter_dimension-header').show()
        $('.menu-filter_dimension').show()
      }
    })

    $('button.color-header , button.hierarchy-header,button.default-header,button.filter-header, button.Details-header,button.filter_dimension-header,button.Details-header,button.highlight-header,button.selection-header,button.anottation-header').click(function () {
      let acordion = $(this).parent().children('.menu-acordion')
      $(this).children('#plus-minus').remove()
      if ($(acordion).is(':visible')) {
        $(this).append($('<span/>').addClass('icon icon-plus').attr('id', 'plus-minus').css('float', 'right'))
        $(acordion).hide()
      } else {
        $(this).append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $(acordion).show()
      }
    })

    $(".cancel").click(function () {
      $(this).parent().parent().hide();
    });

    $('.chosen').click(function () {
      inputVis = $(this).attr('value');
      interaction.selectInteraction(inputVis);
      return interaction.strategy.start();
    })

    $('.Anottation').click(function () {

    })

    $('.selection').click(function () {

    })

    $('.zoom').click(function () {

    })

    $('.Selection').click(function () {
      $('.selection-header').children('button').children('#plus-minus').remove()
      if ($('.selection-header').is(':visible')) {
        $('.selection-header').hide()
      } else {
        $('button.selection-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.selection-header').show()
        $('.menuSelection').show()
      }
    })

    $('.Anottation').click(function () {
      $('.anottation-header').children('button').children('#plus-minus').remove()
      if ($('.anottation-header').is(':visible')) {
        $('.anottation-header').hide()
      } else {
        $('button.anottation-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.anottation-header').show()
        $('.menuAnottation').show()
      }
    })

    $('.demmandDetails').click(function () {
      $('.Details-header').children('button').children('#plus-minus').remove()
      if ($('.Details-header').is(':visible')) {
        $('.Details-header').hide()
      } else {
        $('button.Details-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.Details-header').show()
        $('.menu-details').show()
      }
    })

    $('.highlighted').click(function () {
      $('.highlight-header').children('button').children('#plus-minus').remove()
      if ($('.highlight-header').is(':visible')) {
        $('.highlight-header').hide()
      } else {
        $('button.highlight-header').append($('<span/>').addClass('icon icon-minus').attr('id', 'plus-minus').css('float', 'right'))
        $('.highlight-header').show()
        $('.menu-highlight').show()
      }
    })

    $('#highlight_selection').change(function () {
      if ($('#highlight_selection').is(':checked')) {
        layer(false)
      } else {
        layer(true)
      }
    })


    updateTools()
    updateInterface()
  })
}
// ------gerar conteudo do input dinamicamente------------------------------------------------------------------------------

const comentclear = () => {
  $('.boxComment').remove();
}

const elements = {
  'filter_by_dimension': [
    {
      'text': 'Filter By Dimension',
      'type': 'checkbox',
      'checked': false
    }
  ]
}


