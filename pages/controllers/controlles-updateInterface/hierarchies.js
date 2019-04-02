let hierarchies = () =>{

  let hierarchyAttrs = $('.selectHierarchy');
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


  $('#sortable').sortable();
  $('#sortable').disableSelection();


}

