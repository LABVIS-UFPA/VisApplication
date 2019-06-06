// controle e criação das interfaces ini
const { exec } = require('child_process')
const fs = require('fs')
const ipc = require('electron').ipcRenderer
const vis = require('@labvis-ufpa/vistechlib')
const d3 = require('d3')
const DataPreparation = require('./models/DataPreparation.js')
const Interaction_Chosen = require('./models/Interaction_Chosen.js')
console.log(vis)
console.log(ipc)

let _data_
let data_prep
let defautColor = ['#006699', '#24d068', '#C53A10', '#ff27ac',
  '#DBE70D', '#08821e', '#1135b2', '#ff7043',
  '#78909c', '#ECEDF0', '#4D8000', '#B33300',
  '#CC80CC', '#66664D', '#991AFF', '#E666FF',
  '#4DB3FF', '#1AB399', '#E666B3', '#33991A',
  '#CC9999', '#B3B31A', '#00E680', '#4D8066',
  '#809980', '#E6FF80', '#1AFF33', '#999933']
let interaction = new Interaction_Chosen()
let addVis
  = (visName, parentElement) => {
    let pc = new vis[visName](parentElement)
    interaction.setElemt(pc)

    layer(false);
    pc
    .on('highlightstart', function (d, i) {
      $('.partition-content').each(function () {
        if (this.__vis__ && this.__vis__ !== pc) {
          this.__vis__.highlight(d, i)
        }
      })
    })
    .on('highlightend', function (d, i) {
      $('.partition-content').each(function () {
        if (this.__vis__ && this.__vis__ !== pc) {
          this.__vis__.removeHighlight(d, i)
        }
      })
    })
    .on('datamouseover', function (d, i) {
      // interaction.chosen();
    })
    .on('datamouseout', function (d, i) {
      pc.removeHighlight(d, i)
    })
    .on('dataclick', function (d, i) {
      $('.partition-content').each(function () {
        if (this.__vis__) {
          console.log('clicou', d, i)
          let elem = this.__vis__.getHighlightElement(i)
          this.__vis__.annotate(elem)
        }
      })
    })
  }

ipc.on('add-vis', function (event, arg) {
  addVis(arg, $('.partition-content').get(0))
})

ipc.on('file-data', function (event, data) {
  _data_ = data
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
            // let content = $("#"+$(this).attr("data-nodeVis")).children(".partition-content");
            let partition = $(this).parents('.partition-node').attr('id')
            content.empty()
            addMenu(content)
            ipc.send('update-sampledata', {})
            updateInteface()
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
      .css({'float': 'right'}))

    // $(this).children(".partition-content").append($("<button/>")
    //   .text("Maps")
    //   .addClass("btn btn-large btn-default")
    //   // .attr("data-nodeid", $(this).attr("id"))
    //   .css({"float": "right"}));

    $.contextMenu({
      selector: '.btn.btn-large.btn-positive',
      trigger: 'left',
      callback: function (key) {
        if (_data_) {
          let content = $('#' + $(this).attr('data-nodeid')).children('.partition-content')
          content.empty()
          addVis(key, content.get(0))
          ipc.send('update-sampledata', {})
          updatevis()
        } else {
          alert('You have to link data first')
          ipc.send('not-data')
        }
      },
      items: {
        'ParallelCoordinates': {name: 'Parallel Coordinates'},
        'ParallelBundling': {name: 'Bundled Parallel Coordinates'},
        'ScatterplotMatrix': {name: 'Scatter Plot'},
        'BeeswarmPlot': {name: 'Beeswarm Plot'},
        'Treemap': {name: 'Treemap'},
        'Histogram': {name: 'Histogram'},
        'Sunburst': {name: 'Sunburst'},
        'BarChart': {name: 'Bar Chart'}
      }
    })

    // Download Visualizations ------------------------------------------------------
    $(this).children('.partition-content').append($('<button/>')
      .text('Download Visualizations')
      .addClass('btn btn-large btn-default')
      .attr('data-nodeid', $(this).attr('id'))
      .css({'float': 'right'})
      .click(() => {
        let viss = ['ParallelCoordinates', 'ScatterplotMatrix', 'BeeswarmPlot', 'Histogram', 'BarChart']
        for (let v of viss) {
          let element = document.createElement('div')
          $(element).css({
            'position': 'fixed',
            'width': '801px',
            'height': '601px',
            'opacity': '0'
          })
          document.body.appendChild(element)

          let pc = new vis[v](element, {
            size_type: 'absolute',
            width: '800px',
            height: '600px'
          })
          pc.data(_data_)
          pc.redraw()
          let file = new Blob([element.innerHTML], {type: 'image/svg+xml'})
          let a = document.createElement('a')
          let url = URL.createObjectURL(file)
          a.href = url
          a.download = v + '.svg'
          document.body.appendChild(a)
          // a.click();

          let locationFile = __dirname.replace('pages', 'svgExported\\')

          fs.writeFile(locationFile + v + '.svg', element.innerHTML, function (err) {
            if (err) {
              return console.log(err)
            }
            console.log('The file was saved!')
          })

          exec('"C:\\Program Files\\Inkscape\\inkscape.exe" ' + locationFile + v + '.svg' + ' --export-area-page --without-gui --export-pdf=' + locationFile + v + '.pdf', (err, stdout, stderr) => {
            if (err) {
              console.log(err)
              return
            }
            console.log(`stdout: ${stdout}`)
            console.log(`stderr: ${stderr}`)
          })

          setTimeout(function () {
            document.body.removeChild(a)
            document.body.removeChild(element)
            window.URL.revokeObjectURL(url)
          }, 0)
        }
      }))
  })
})

// --atualizar interface tools ferramentas de interação -------------------------------------------------------------------------------------------
let menu_tools = (parentElement) => {
  $(parentElement).load('public/html/menu-tools.html')

  $(document).ready(function () {
      // strategia alteração da interação com mouse
  })
}

function updateTools () {
  const details = () => {
    data_prep = new DataPreparation(_data_)
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
            'font-size': '13px'})
          .text(dimension[i]).append($('<br/>')))
    }
  }
  details()
}

function updateInteface () {
  data_prep = new DataPreparation(_data_)
  const dimension = data_prep.data_keys
  const d_values = data_prep.data_values
  const limit = data_prep.limit_values

// --------------parte dinamica dos menus---------
// ------colors-----------------
  const colors = () => {
    let items = $('.colorSelector').children('.optColor').length
    $.each(dimension, function (i, item) {
      if ($('.colorSelector').length && items < dimension.length) {
        $('.colorSelector').append($('<option>', {
          value: dimension[i],
          text: dimension[i]
        }).addClass('optColor'))
      }
    })

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
    })

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
        return updateCategoricalColor(d_values[index], dataHeader, colors)
      } else if (!isNaN(d_values[index][1]) && d_values[index].length > 10) {
        let k = limit.indexOf(dataHeader)
        return updateColorContinues(d_values[index], dataHeader, limit[k + 1], limit[k + 2])
      } else {
        return updateCategoricalColor(d_values[index], dataHeader, colors)
      }
    })

// itens color pic data categorical
    function addColorCat (values) {
      $('div.menuColor').children('div#legend').remove()
      $('div.menuColor').children('input').remove()
      $('div.menuColor').children('label').remove()
      // $("div#legendColor").remove();
      $.each(values, function (i, item) {
        console.log(i)
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
      $('div.menuColor').children('input').remove()
      $('div.menuColor').children('label').remove()
      $('div.menuColor').children('div.legendColor').remove()
      $('div.menuColor').children('div#legend').remove()

      $('div.menuColor').append($('<div/>').attr('id', 'legend'))

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
          ))
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
          ))
    }
  }

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
                  'font-weight': 'bold'})))

          $(function () {
            $('#slider-range').slider({
              range: true,
              min: limit[j + 1],
              max: limit[j + 2],
              values: [ limit[j + 1], limit[j + 2]],
              slide: function (event, ui) {
                $('#amount').val('min: ' + ui.values[ 0 ] + ' ~max: ' + ui.values[ 1 ])
                console.log(ui.values[ 0 ])
                console.log(ui.values[ 1 ])
                filterColorContinues(
                  valor,
                  limit[j + 1],
                  limit[j + 2]
                  , ui.values[ 0 ],
                  ui.values[ 1 ])
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

    function filterCategorcal () {
      let item_key = $('select.filter').val()
      let attr_value = $('select.categoricalFilter').val()

      let i = dimension.indexOf(item_key)
      let listItem = d_values[i]
      filterCategoricalValues(listItem, item_key, attr_value)
    }
  }

// hieraquies----------
  const hierarchies = () => {
    let hierarchyAttrs = $('.selectHierarchy')
    let categorical_values = data_prep.getCategorical_values()

    $(hierarchyAttrs).each(function (i, attr) {
      let items = $(attr).children('.optHie').length
      $.each(categorical_values, function (i, item) {
        if ($(attr).length && items < categorical_values.length) {
          $(attr).append($('<option>', {
            value: categorical_values[i],
            text: categorical_values[i]
          }).addClass('optHie'))
        }
      })
    })

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
    })

// mudanças hierarquias dinamicas
    $('ul#sortable').on('DOMSubtreeModified', function (event) {
      let ul = $('.window-content').children('ul')
      let IDs = []
      $(ul).find('li').each(function () {
        IDs.push($(this).attr('id'))
      })
      updateHie(IDs)
    })

    $('#sortable').sortable()
    $('#sortable').disableSelection()
  }

// ---size--------------
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
      updateSize()
    })
  }
// ---------------default menu--------------------
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
function clean_menus () {
  let parent = $('#menu_settings').parent().parent();
  $('#menu_settings').remove();

  parent.empty();
  addMenu(parent)
  updateInteface()
}

// ----------------list item menu----------------------------------------------------------------------------------
let addMenu = async(parentElement) => {
  await $(parentElement).load('public/html/menu-settings-vis.html')

  $(document).ready(function () {
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

    $('button.color-header , button.hierarchy-header,button.default-header,button.filter-header, button.Details-header,button.filter_dimension-header,button.Details-header,button.highlight-header,button.selection-header').click(function () {
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
      return interaction.selectInteraction($(this).attr('value'))
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
      console.log($('#highlight_selection').is(':checked'))

      if ($('#highlight_selection').is(':checked')) {
        layer(false)
      } else {
        layer(true)
      }
    })

    updateTools()
    updateInteface()
  })
}
// ------gerar conteudo do input dinamicamente------------------------------------------------------------------------------

const elements = {
  'filter_by_dimension': [
    {
      'text': 'Filter By Dimension',
      'type': 'checkbox',
      'checked': false
    }
  ]
}

