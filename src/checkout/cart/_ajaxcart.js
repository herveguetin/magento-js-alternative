/**
 * Ajax Cart JS
 *
 * @category    Soon
 * @copyright    Copyright (c) 2012 Agence Soon. (http://www.agence-soon.fr)
 * @license        http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 * @author        HervÃ© G. - Twitter : @vrnet
 */

var ajaxCart = Class.create();

ajaxCart.prototype = {
    initialize: function (url, messageContainerHost) {
        this.url = url;
        this.cartTopLink = $$('.top-link-cart')[0];
        this.addToCartQty = 1;
        this.messagesContainerId = 'ajaxcart_messages';
        this.messageContainerHost = (messageContainerHost) ? messageContainerHost : '.main .col-main';

        this.onAddBtnClick = this.addToCart.bindAsEventListener(this);
        this.removeBtnClick = this.removeFromCart.bindAsEventListener(this);

        this.createMessagesContainer();
        this.createObservers();

    },

    createObservers: function () {
        this.miniCart = $$('.block-cart')[0];
        this.addToCartBtns = $$('button.btn-cart');
        this.removeFromCartBtns = $$('#cart-sidebar a.btn-remove');

        this.addToCartBtns.each(function (btn) {

            // If we are on product configure page from checkout or if button has no-ajax class
            if ($$('body')[0].hasClassName('checkout-cart-configure') || btn.hasClassName('no-ajax')) {
                return;
            }

            /**
             * If button leads to product view we keep its native behavior
             * Otherwise, we remove its native behavior and set observers
             */
            var onclick = btn.getAttribute('onclick');
            if (onclick && !onclick.include('options=cart')) { // If this is a product without options (if this is a product with options we do nothing as we want the click to go to product view)
                Event.observe(btn, 'click', this.onAddBtnClick);

                // If we are on products list, we get product ID to add to cart and add a class to button
                var onclick = btn.getAttribute('onclick');
                var productId = undefined;
                if (onclick) {
                    productId = this.getProductId(onclick)
                }
                if (productId) {
                    btn.addClassName('add-' + productId);
                }

                btn.setAttribute('onclick', 'return false;'); // Remove native Magento behavior
            }
        }.bind(this));

        this.removeFromCartBtns.each(function (btn) {
            Event.observe(btn, 'click', this.removeBtnClick);

            var onclick = btn.getAttribute('href');
            var productId = undefined;
            if (onclick) {
                productId = this.getProductId(onclick)
            }
            if (productId) {
                btn.addClassName('remove-' + productId);
            }

            btn.setAttribute('onclick', 'return false;'); // Remove native Magento behavior
        }.bind(this));
    },

    addToCart: function (event) {
        var currentBtn = event.findElement('button');

        if ($$('.add-to-cart')[0] != undefined) {
            var qtyInput = $$('.add-to-cart')[0].down('#qty');
            if (qtyInput) {
                this.addToCartQty = $$('.add-to-cart')[0].down('#qty').value;
            }
        }
        if (this.addToCartQty == 0) {
            this.addToCartQty = 1;
        }

        var productAjaxAddToCart = new VarienForm('product_addtocart_form');
        productAjaxAddToCart.submit = function (button, url, ajaxCart) {
            if (this.validator && this.validator.validate()) {
                var form = this.form;
                var oldUrl = form.action;
                if (url) {
                    form.action = url;
                }
                var e = null;
                try {
                    ajaxCart.submitAjax(button, form);
                } catch (e) {
                }
                this.form.action = oldUrl;
                if (e) {
                    throw e;
                }
            }
            else if (!this.validator) {
                ajaxCart.submitAjax(button);
            }
        }.bind(productAjaxAddToCart);

        productAjaxAddToCart.submit(currentBtn, undefined, this);
    },

    removeFromCart: function (event) {
        var currentBtn = event.findElement('a');
        this.submitAjax(currentBtn);
    },

    submitAjax: function (button, form) {
        var removeFromCart = false;

        // Retrieve product ID
        var productId = undefined;
        var btnClassNames = $w(button.className);
        btnClassNames.each(function (className) {
            if (className.include('add-') || className.include('remove-')) {
                productId = className.split('-')[1];
                if (className.include('remove-')) {
                    removeFromCart = true;
                }
            }
        });

        if (productId == undefined && form) { // If we are on product page, there is the add to cart form
            productId = this.getProductId(form.action);
        }

        if (productId != undefined) {
            if (button && button != 'undefined') {
                this.button = button;
            }

            if (form) { // If we are on product page
                form.action = this.getAjaxUrl(productId, removeFromCart);
                form.request({
                    onLoading: this.onAjaxRequest(),
                    onComplete: function (transport) {
                        this.onAjaxResponse(transport);
                    }.bind(this)
                });
            }

            else { // We are on a products list
                new Ajax.Request(this.getAjaxUrl(productId, removeFromCart), {
                    method: 'get',
                    onLoading: function () {
                        this.onAjaxRequest()
                    }.bind(this),
                    onSuccess: function (transport) {
                        this.onAjaxResponse(transport);
                    }.bind(this)
                });
            }
        }
    },

    onAjaxRequest: function () {
        this.button.disabled = true;
        $(this.messagesContainerId).update('');
    },

    onAjaxResponse: function (transport) {
        var json = transport.responseText.evalJSON();

        $(this.messagesContainerId).update(json.messages);

        var previousBlock = this.miniCart.previous('div');
        if (previousBlock != undefined) {
            previousBlock.insert({after: json.mini_cart});
        }

        else {
            previousBlock = this.miniCart.up();
            previousBlock.insert({top: json.mini_cart});
        }
        this.miniCart.remove();

        this.cartTopLink.update(json.cart_top_link);

        this.button.disabled = false;
        this.createObservers();
    },

    getProductId: function (string) {
        var productId = undefined;
        var stringArray = string.split('/');
        for (var i = 0; i < stringArray.length; i++) {
            if (stringArray[i] == 'product') {
                productId = stringArray[i + 1];
            }
            if (stringArray[i] == 'delete') {
                productId = stringArray[i + 2];
            }
        }
        return productId;
    },

    getAjaxUrl: function (productId, removeFromCart) {
        var url = this.url;
        if (removeFromCart) {
            url += 'id/' + productId + '/remove/1';
        }
        else {
            url += 'product/' + productId + '/qty/' + this.addToCartQty;
        }
        return url;
    },

    createMessagesContainer: function () {
        var colMain = $$(this.messageContainerHost)[0];

        if ($(this.messagesContainerId)) {
            $(this.messagesContainerId).remove();
        }

        var html = '<div id="' + this.messagesContainerId + '"></div>';
        if (colMain !== undefined) {
            colMain.insert({top: html});
        }
    }
}