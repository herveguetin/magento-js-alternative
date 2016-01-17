import Backbone from 'backbone';
import _ from 'lodash';
import $ from 'jquery';
import Handlebars from 'handlebars';

import CartModel from './model';

/**
 * Mini cart
 */
var MiniCartView = Backbone.View.extend({
    el: '[mini-cart]',
    template: Handlebars.compile($('[mini-cart-tpl]').html()),
    usedBtns: [],

    /**
     * Backbone initialize function
     */
    initialize() {
        this.populateButtons();
        this.updateButtons();

        this.listenTo(this.model, 'change', this.render);
        this.model.fetch();

        // Listen to clicks
        _.forEach(this.usedBtns, (btn) => {
            $(btn).click((evt) => this.syncCart(evt));
        });
    },

    /**
     * Find all buttons that we need to listen to
     */
    populateButtons() {
        this.addToCartBtns = $('button.btn-cart');
        this.removeFromCartBtns = $('#cart-sidebar a.btn-remove');
    },

    /**
     * Update buttons in order to be able to use then in our logic
     */
    updateButtons() {

        // Update add to cart buttons
        this.addToCartBtns.each((i, btn) => {
            if (this.canUseBtnForAddToCart(btn)) {
                this.updateButton(btn, 'add');
                this.usedBtns.push(btn);
            }
        });

        // Update remove links
        this.removeFromCartBtns.each((i, a) => {
            this.updateButton(a, 'remove');
            this.usedBtns.push(a);
        });
    },

    /**
     * Update a button by adding some attributes that we will need for further processing
     *
     * @param btn
     * @param type
     */
    updateButton(btn, type) {
        // If product id is present in btn attributes, save it for later use
        var productId = this.getProductIdForBtn(btn, type);
        if (productId) {
            $(btn).attr('data-product-id', productId);
        }

        // Add an action attribute
        $(btn).attr('data-ajaxcart-action', type);

        // Remove native onclick behavior
        $(btn).attr('onclick', 'return false;');
        if ($(btn).attr('href')) {
            $(btn).attr('href', '#');
        }
    },

    /**
     * Check if a button can be used for adding to cart
     *
     * @param btn
     * @returns {boolean}
     */
    canUseBtnForAddToCart(btn) {
        var canUse = false;

        // If product's "onclick" attribute contains 'productAddToCartForm' (on product view), or 'checkout/cart/add' (on product list), it can be used
        var onclick = $(btn).attr('onclick');
        if (onclick
            && (onclick.includes('productAddToCartForm') || onclick.includes('checkout/cart/add'))) {
            canUse = true;
        }

        return canUse;
    },

    /**
     * Helper to retrieve the product ID attached to a button
     *
     * @param btn
     * @param type
     * @returns {undefined}
     */
    getProductIdForBtn(btn, type) {

        // If we already updated the 'data-product-id' of the button, let's use it!
        if ($(btn).data('product-id')) {
            return $(btn).data('product-id');
        }

        // Otherwise, find it!
        var productId = undefined;

        var findId = function (haystack, needle) {
            var productId = undefined;
            if (haystack && needle) {
                var haystackArr = haystack.split('/');
                haystackArr.map((v, i) => {
                    if (v == needle) {
                        productId = haystackArr[i + 1];
                    }
                });
            }
            return productId;
        };

        switch (type) {
            case 'add':
                // Find product preferably from add to cart form
                var form = $(btn).closest('form');
                productId = (form.length && $(form).attr('action').includes('checkout/cart/add')) ?
                    findId($(form).attr('action'), 'product')
                    : findId($(btn).attr('onclick'), 'product');
                break;
            case 'remove':
                var href = $(btn).attr('href');
                productId = findId(href, 'id');
                break;
        }

        return productId;
    },

    syncCart(btn) {
        // Find click el
        var el = $(btn.target).closest('button');
        el = (el.length) ? el : $(btn.target);

        // Find qty to add
        var qty = 1;

        // If we are on product page
        var addToCartArea = el.closest('.add-to-cart');
        if (addToCartArea.length) {
            var qtyInput = addToCartArea.find('#qty');
            if (qtyInput.length) {
                qty = qtyInput.val();
            }
        }

        // Manage validation
        var canSubmit = true;
        var form = el.closest('form');
        if (form.length) {
            var productAjaxAddToCart = new VarienForm($(form).attr('id'));
            canSubmit = productAjaxAddToCart.validator.validate();
        }

        // Submit model change
        if (canSubmit) {
            el.addClass('loading');
            this.model.syncCart(el.data('ajaxcart-action'), el.data('product-id'), qty);
        }
    },

    render() {

        // Remove "loading" class
        _.forEach(this.usedBtns, (btn) => {
            $(btn).removeClass('loading');
        });

        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

export default new MiniCartView({model: CartModel});

/**
 * Qty summary
 */
var QtySummaryView = Backbone.View.extend({
    el: '[qty-summary]',
    template: Handlebars.compile($('[qty-summary-tpl]').html()),

    /**
     * Backbone initialize function
     */
    initialize() {
        this.listenTo(this.model, 'change', this.render);
    },

    render() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }
});

export default new QtySummaryView({model: CartModel});