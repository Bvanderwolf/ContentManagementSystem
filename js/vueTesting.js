Vue.component('accordion', {
    props: ['item'],

    template: `
      <div>
        <p>{{item.title}}</p>
        <p @click="toggle = ! toggle">Details</p>
        <p v-if="toggle">{{item.description}}</p>
      </div>
    `,

    data: function () {
        return {
            toggle: false,
        }
    }
})

new Vue({
    el: '#app',

    data: {
        item: "",
        items: [
            "Simple list item 1",
            "Simple list item 2"
        ],
        hidden: false,
        objects: [
            { text: "medium list item 1", checked: true },
            { text: "medium list item 2", checked: true },
            { text: "medium list item 3", checked: false },
            { text: "medium list item 4", checked: true }
        ],

        componentItems: [
            { id: 1, title: "Title 1", description: "description for tab 1" },
            { id: 2, title: "Title 2", description: "description for tab 2" }
        ],

        price: 100,
        taxPerc: 0.2
    },

    methods: {
        moneyFormat: function (ammount) {
            return "$" + ammount;
        }
    },

    computed: {
        tax: function () {
            return this.price * this.taxPerc;
        },

        total: function () {
            return parseInt(this.price) + parseInt(this.price * this.taxPerc);
        }
    }
});