// import { thresholdFreedmanDiaconis } from "d3";

// class PartitionLayout {

//     /**
//      *@param root_html - onde vai ficar no html
//      */
//     constructor(root_html) {
//         this.root = root_html;
//     };


//     createLayoutbyJson(json){

//     };

//     random_id() {
//         return Math.floor(Math.random() * 1000);
//     };

//     addPartitionDiv(){
//         let container = document.createElement("div").classList.add("partition-node").style("background-color","grey");
//         return container;
//     };

//     createRootIfNotExists() {
//         let $root = $(this.root);
//         if ($(".partition-root").length === 0 && $root.length > 0) {
//             $root.append($("<div/>").addClass("partition-root"));
//         }
//     };

//     removePartitionDiv(ContainerId){
//         document.querySelectorAll("#"+ContainerId);

//     };

//     addRowLayout(){

//     };

//     removeRowLayout(){

//     };

//     removeCollumLayout(){

//     };



// };


class PartitionLayout {
    constructor(html_container) {
        this.html_container = html_container

    }

    export() {

    }

    create_Json() {

    }

    import(json) {
        const add_child_tree = function (item, item_json) {
            let container_selection = $(this.html).append(item.html);

            console.log("par1",item);
            // this.width = container_selection.width();
            // this.height = container_selection.height();

            this.addChild(item);

            for (let i = 0; i < item_json.children.length; i++) {
               // console.log("par2",item);
                add_child_tree.call(item, new Partition(item_json.children[i]), item_json.children[i] );
            }

        }

        this.root = new Partition(json);
        let container_selection = $(this.html_container).append(this.root.html);


        $(this.root.html).width(this.root.width = container_selection.width());
        $(this.root.html).height(this.root.height = container_selection.height());

        for (let i = 0; i < json.children.length; i++) {
            add_child_tree.call(this.root, new Partition(json.children[i]), json.children[i]);
        }

    }



}


class Partition {

    constructor(json) {
        // this.parent = 
        this.id = json.id || random_id();
        this.direction = json.direction || "row";
        this.children = [];
        this.proportion =  json.proportion ||1;
        this.isLeaf = json.isLeaf || true;

            this.html = $("<div/>").attr("id", this.id).css({
                "flex-direction": this.direction
                // "width":this.proportion,
                // "height":this.proportion
            });
        // direction:"",//vertical ou horizontal
        // children:[],//array partition node
        // parent:"",//outro partition node
        // proportion:0,//poroprção dentro do grupo

        // html:"",//elemento html
    }

    addChild(partition) {
        this.children.push(partition);
        partition.parent = this;
        if (this.direction === "row") {
            partition.width = this.width * partition.proportion;
            partition.height = this.height;
        } else {
            partition.width = this.width;
            partition.height = this.height * partition.proportion;
        }
    }
}



const random_id = () => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";

    let text = "";
    for (var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;


};










