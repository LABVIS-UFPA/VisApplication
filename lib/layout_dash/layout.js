data = {
    id: "000001",//id da div
    direction: "column",//vertical ou horizontal
    children: [
        {
            proportion: 0.2,
            children: [
                {
                    proportion: 0.6,
                    children: []
                },
                {
                    proportion: 0.4,
                    children: []
                }
            ]
        },
        {
            proportion: 0.1,
            children: []
        },
        {
            proportion: 0.1,
            children: []
        },
        {
            proportion: 0.6,
            children: [
                {
                    proportion: 0.6,
                    children: [
                        {
                            proportion: 0.6,
                            children: []
                        },
                        {
                            proportion: 0.4,
                            children: []
                        }
                    ]
                },
                {
                    proportion: 0.4,
                    children: []
                }
            ]
        }
    ],//array partition node
    // parent: "",//outro partition node
    // proportion: 0,//poroprção dentro do grupo
    // isLeaf: true, //é folha ou não
    // html: "",//elemento html


}