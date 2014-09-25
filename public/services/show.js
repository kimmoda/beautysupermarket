angular.module("beautyApp")
    .service('productService', function () {
        var selectedProduct;
        var brands = new Array();
        var merchants = new Array();

        var selectProduct = function (newObj) {
            selectedProduct = newObj;
        }

        var getSelectedProduct = function () {
            return selectedProduct;
        }

        var setMerchants = function (newObj) {
            //console.log('setting merchants:'+JSON.stringify(newObj));
            merchants = newObj;
            //console.log('pservice merchants length:'+merchants.length);
        }

        var getMerchants = function () {
            return merchants;
        }

        return {
            selectProduct: selectProduct,
            getSelectedProduct: getSelectedProduct,
            setMerchants: setMerchants,
            getMerchants: getMerchants
        }
    })
    .factory("productAPI", function ($http, $resource, $q) {

        var base_url = '/api/products/';

        var resource = $resource('/api/search/', {
            page: '@page',
            rpp: '@rpp',
            keyword: '@keyword'
            /*,
            filterId: '@filterId',
            filterType: '@filterType'
            */
        });

        return {

            fetchProducts: function ($params) {
                return $http({
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        url: base_url,
                        method: "POST",
                        data: $params,
                    })
                    .success(function () {
                        console.log('fetchProducts ran');
                    })
                    .error(function () {
                        console.log('fetchProducts call resulted in an error');
                    });
            },
            fetchPage: function (SearchParams) {
                var deferred = $q.defer();
                resource.get({
                        page: SearchParams.page,
                        rpp: SearchParams.rpp,
                        keyword: SearchParams.keyword
                        /*,
                        filterId: SearchParams.filterId,
                        filterType: SearchParams.filterType
                        */
                    },
                    function (event) {
                        deferred.resolve(event);
                    },
                    function (response) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            }
        };
    });