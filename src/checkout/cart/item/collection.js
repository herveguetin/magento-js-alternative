import Backbone from 'backbone';
import CartItemModel from './model';

var CartItemCollection = Backbone.Collection.extend({
    model: CartItemModel
});

export default CartItemCollection;