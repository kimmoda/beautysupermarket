angular.module("beautyApp")
    .service('productService', function () {
        var selectedProduct;
        var merchants = [];

        var selectProduct = function (newObj) {
            selectedProduct = newObj;
        };

        var getSelectedProduct = function () {
            return selectedProduct;
        };

        var setMerchants = function (newObj) {
            merchants = newObj;
        };

        var getMerchants = function () {
            return merchants;
        };

        return {
            selectProduct: selectProduct,
            getSelectedProduct: getSelectedProduct,
            setMerchants: setMerchants,
            getMerchants: getMerchants
        }
    })
    .factory("productAPI", function ($http) {

        var base_url = '/api/';

        return {

            fetchProducts: function ($params) {
                return $http({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        url: base_url+'products/',
                        method: "POST",
                        data: $params
                    });
            },
            pushEvent: function($params){
                console.log('sending event');
                return $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: base_url+'event',
                    method: "POST",
                    data: $params
                });
            },
            getDeals: function ($params) {
                return $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: base_url+'deals',
                    method: "POST",
                    data: $params
                });
            },
            fetchProduct: function (){
                console.log('fetching product:');
                return $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: base_url+'products/1466988',
                    method: "GET"
                });
            },
            fetchCategories: function () {
                return $http({
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    url: base_url+'categories/',
                    method: "GET"
                    })
                    .success(function () {
                        console.log('fetchCategories ran');
                    })
                    .error(function () {
                        console.log('fetchCategories call resulted in an error');
                    });
            }
        };
    });