import $ from 'jquery';
import Backbone from 'backbone';
import CartItemCollection from './item/collection';

var CartModel = Backbone.Model.extend({
    url: 'http://cache.local.com/minicart',

    parse(response) {
        response.items = new CartItemCollection(response.items);
        return response;
    },

    syncCart(action, productId, qty) {
        this.save(
            {
                action: action,
                product_id: productId,
                qty: qty
            }
        );
    }
});

export default new CartModel();