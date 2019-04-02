function updateInteface () {
  data_prep = new DataPreparation(_data_);
  const dimension = data_prep.data_keys;
  const d_values = data_prep.data_values;
  const attrs = $('.colorSelector');
  const limit = data_prep.limit_values;
  let attrFilter = $('.filter');
  let hierarchyAttrs = $('.selectHierarchy');
  let sizeAttr = $('.selectSize');


  colors(dimension,d_values,attrs,limit);
  hierarchies();
  size(data_prep);
  filter();
  defaultMenu();
  details();

}

//limpar o menu quando mudar uma nova base de dados
function clean_menus(){
  let parent = $("#menu_settings").parent();
  $("#menu_settings").remove();

  parent.empty();
  addMenu(parent);
  updateInteface();
}

//list item menu
let addMenu = (parentElement) => {
  $(parentElement).load("public/html/menu-icons.html")

  $(document).ready(function() {

  $(".Color").click(function () {
      $(".color-header").children("button").children("#plus-minus").remove();
    if ($(".color-header").is(':visible')) {
      $(".color-header").hide();
      $(".menuColor").hide();
    } else {
      $("button.color-header").append($("<span/>").addClass("icon icon-minus").attr("id", "plus-minus").css("float", "right"))
      $(".color-header").show();
      $(".menuColor").show();
    }
  })

  $(".Hie").click(function () {
    $(".hierarchy-header").children("button").children("#plus-minus").remove();
    if ($(".hierarchy-header").is(':visible')) {
      $(".hierarchy-header").hide();
      $(".menuHie").hide();
    } else {
      $("button.hierarchy-header").append($("<span/>").addClass("icon icon-minus").attr("id", "plus-minus").css("float", "right"))
      $(".hierarchy-header").show();
      $(".menuHie").show();
    }
  })

  $(".Filter").click(function () {
    $(".filter-header").children("button").children("#plus-minus").remove();
    if ($(".filter-header").is(':visible')) {
      $(".filter-header").hide();
      $(".menuFilter").hide();
    } else {
      $("button.filter-header").append($("<span/>").addClass("icon icon-minus").attr("id", "plus-minus").css("float", "right"))
      $(".filter-header").show();
      $(".menuFilter").show();
    }
  })

  $(".Default").click(function () {
    $(".default-header").children("button").children("#plus-minus").remove();
    if ($(".default-header").is(':visible')) {
      $(".default-header").hide();
    } else {
      $("button.default-header").append($("<span/>").addClass("icon icon-minus").attr("id", "plus-minus").css("float", "right"))
      $(".default-header").show();
      $(".menuDefault").show();
    }
  })

  $(".demmandDetails").click(function () {
      $(".Details-header").children("button").children("#plus-minus").remove();
      if ($(".Details-header").is(':visible')) {
        $(".Details-header").hide();
      } else {
        $("button.Details-header").append($("<span/>").addClass("icon icon-minus").attr("id", "plus-minus").css("float", "right"))
        $(".Details-header").show();
        $(".menu-details").show();
      }

    });


  $("button.color-header , button.hierarchy-header,button.default-header,button.filter-header, button.Details-header").click(function () {
    let acordion =  $(this).parent().children(".menu-acordion");
    $(this).children("#plus-minus").remove();
    if($(acordion).is(':visible')){
      $(this).append($("<span/>").addClass("icon icon-plus").attr("id","plus-minus").css("float","right"))
      $(acordion).hide();
    }else {
      $(this).append($("<span/>").addClass("icon icon-minus").attr("id", "plus-minus").css("float", "right"))
      $(acordion).show();
    }
  });

    updateInteface();

  });

}
