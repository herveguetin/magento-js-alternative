import Backbone from 'backbone';

var CartItemModel = Backbone.Model.extend({
    getInfo() {
        return 'Item info'
    }
});

export default CartItemModel;