var beautyApp = angular.module('beautyApp')
    .controller('ProductListController', ['$scope', '$state', '$location', 'productAPI', 'productService', 'usSpinnerService',
        function ($scope, $state, $location, productAPI, productService, usSpinnerService) {

            $scope.itemsPerPage = 10;
            $scope.currentPage = 1;
            $scope.maxSize = 5;
            $scope.brands = [];
            $scope.merchants = [];
            $scope.categories = [];
            var SearchQuery = {};
            var filters = [];
            var query = {};
            query.term = '';
            query.page = 1;
            query.rpp = 10;
            SearchQuery.query = query;
            SearchQuery.query.filters = filters;
            $scope.storeSelection = [];
            $scope.brandSelection = [];
            $scope.categorySelection = [];

            $scope.myModel = {
                Name: "BeautySupermarket", // text for tweet and pinIt buttons
                FbLikeUrl: "http://www.beautysupermarket.co.uk"
            };

            $scope.clearFilters = function () {
                $scope.storeSelection.length = 0;
                $scope.brandSelection.length = 0;
                $scope.categorySelection.length = 0;
                $scope.categorySelection.push('13000');
                filters.length = 0;
            };

            $scope.clearFilter = function (filterType) {
                if (filterType == 'merchant') {
                    $scope.storeSelection.length = 0;
                    rebuildFilters();
                    // run new search
                    if ($scope.keyword)
                        query.term = $scope.keyword;
                    resetQuery();
                    doSearch(SearchQuery);
                } else if (filterType == 'brand') {
                    $scope.brandSelection.length = 0;
                    rebuildFilters();
                    // run new search
                    if ($scope.keyword)
                        query.term = $scope.keyword;
                    resetQuery();
                    doSearch(SearchQuery);
                }
            };

            $scope.filter = function (filterId, filterType) {
                var idx;
                if (filterType == 'brand') {
                    // check if brand filter already selected
                    idx = $scope.brandSelection.indexOf(filterId);

                    if (idx > -1) {
                        $scope.brandSelection.splice(idx, 1);
                    } else { // else is not selected so select it
                        $scope.brandSelection.push(filterId);
                    }
                } else if (filterType == 'merchant') {
                    // check if a merchant filter is already selected, if so remove it
                    $scope.clearFilter('merchant');
                    idx = $scope.storeSelection.indexOf(filterId);
                    if (idx > -1) {
                        $scope.storeSelection.splice(idx, 1);
                    } else { // else is not selected so select it
                        $scope.storeSelection.push(filterId);
                    }
                } else if (filterType == 'category') {
                    $scope.categorySelection.length = 0;
                    $scope.categorySelection.push(filterId);
                }

                if ($scope.keyword)
                    query.term = $scope.keyword;

                query.page = 1;
                $scope.currentPage = 1;

                rebuildFilters();
                doSearch(SearchQuery);
            };

            function rebuildFilters() {
                filters.length = 0;

                if ($scope.storeSelection.length > 0)
                    filters.push({
                        'filter': $scope.storeSelection.join(),
                        'filterType': 'merchant'
                    });

                if ($scope.brandSelection.length > 0)
                    filters.push({
                        'filter': $scope.brandSelection.join(),
                        'filterType': 'brand'
                    });

                if ($scope.categorySelection.length > 0)
                    filters.push({
                        'filter': $scope.categorySelection.join(),
                        'filterType': 'category'
                    });
            }

            $scope.search = function (q) {
                console.log('searching for: ' + q);
                query.term = q;
                query.page = 1;
                query.rpp = 10;
                $scope.keyword = query.term;
                $scope.currentPage = 1;
                $scope.clearFilters();
                doSearch(SearchQuery);
            };


            function doSearch(searchQuery) {
                $scope.startSpin();

                productAPI.fetchProducts(searchQuery).then(function (res) {
                    // need to check that some results were actually set before passing them to the scope
                    if (res.data.results) {

                        $scope.products = res.data.results.products;
                        $scope.product_arr = res.data.results.products.product;
                        $scope.num_merchants = res.data.resources.merchants.count;
                        $scope.total = res.data.results.products.count;
                        $scope.totalItems = res.data.results.products.count;
                        $scope.merchants = res.data.resources.merchants;
                        $scope.merchant_arr = res.data.resources.merchants.merchant;
                        $scope.brands = res.data.resources.brands.brand;
                        $scope.prices = res.data.filters.filter;
                        $scope.context = res.data.resources.categories.context.category;

                        _.remove($scope.context, function (item) {
                            return item.id == 1 || item.id == 13000
                        });

                        $scope.current = _.last($scope.context);

                        if (res.data.resources.categories.matches) {
                            $scope.categories = res.data.resources.categories.matches.category;
                        } else {
                            $scope.categories.length = 0;
                        }
                        productService.setMerchants(res.data.resources.merchants.merchant);

                        $scope.stopSpin();
                        $state.go('products.list');
                    } else {
                        $scope.product_arr.length = 0;
                        $scope.totalItems = 0;
                        $scope.stopSpin();
                    }
                }, function (result) {
                    $scope.stopSpin();
                });
            }


            $scope.selectItem = function (product) {
                // use the productService to select the item
                productService.selectProduct(product);
                var url = '/products/' + product.id;
                $location.path(url);
            };

            $scope.reset = function () {
                resetQuery();
                $scope.clearFilters();
                doSearch(SearchQuery);
            };

            $scope.startSpin = function () {
                usSpinnerService.spin('spinner-1');
            };

            $scope.stopSpin = function () {
                usSpinnerService.stop('spinner-1');
            };

            function resetQuery() {
                query.term = '';
                query.page = 1;
                query.rpp = 10;
                $scope.searchTerm = '';
                $scope.my_object = {};
                angular.copy($scope.my_object, $scope.searchTerm);
                $scope.setPage(1);
            }


            $scope.isChecked = false;

            /* Pagination logic */
            $scope.range = function () {
                var rangeSize = 5;
                var ret = [];
                var start;
                start = $scope.currentPage;
                if (start > $scope.pageCount() - rangeSize) {
                    start = $scope.pageCount() - rangeSize;
                    console.log('start:' + start);
                }

                if (start < 1) {
                    start = 1;
                }

                if (rangeSize > $scope.pageCount()) {
                    rangeSize = $scope.pageCount();
                }
                for (var i = start; i < start + rangeSize; i++) {
                    ret.push(i);
                }
                return ret;
            };

            $scope.prevPage = function () {
                if ($scope.currentPage > 1) {
                    $scope.currentPage--;
                }
            };

            $scope.prevPageDisabled = function () {
                return $scope.currentPage === 1 ? "disabled" : "";
            };

            $scope.nextPage = function () {
                if ($scope.currentPage < $scope.pageCount()) {
                    $scope.currentPage++;
                }
            };

            $scope.nextPageDisabled = function () {
                return $scope.currentPage === $scope.pageCount() ? "disabled" : "";
            };

            $scope.pageCount = function () {
                return Math.ceil($scope.total / $scope.itemsPerPage);
            };

            $scope.setPage = function (pageNo) {
                $scope.currentPage = pageNo;
            };

            $scope.pageChanged = function () {
            };

            $scope.$watch("currentPage", function (newValue, oldValue) {
                query.page = newValue;
                doSearch(SearchQuery);
            });

            /* End pagination logic */
        }])
    .controller('ProductDetailController', ['$scope', '$location', 'product', 'productAPI',
        function ($scope, $location, product, productAPI) {
            var AppEvent = {};
            var event = {};
            AppEvent.event = event;

            $scope.myModel = {
                Name: "BeautySupermarket", // text for tweet and pinIt buttons
                FbLikeUrl: "http://www.beautysupermarket.co.uk"
            };

            $scope.product_info = product.info();
            $scope.product = $scope.product_info.product;
            $scope.merchants = $scope.product_info.merchants;
            console.log('name:' + $scope.product_info.product.name);

            $scope.event = function (e, params) {
                if (e) {
                    switch (e) {
                        case 'visitMerchant':
                            event.eventType = 'visitMerchant';
                            event.url = params;
                            break;
                    }
                    if (event.eventType) {
                        productAPI.pushEvent(AppEvent);
                        if (e == 'visitMerchant') {
                            window.open(params, '_blank');
                        }
                    }
                }
            }
        }])
    .controller('DealsController', ['$scope', '$state', '$location', 'productAPI', 'usSpinnerService', 'sale_deals', 'percent_off_deals', 'free_gift_deals',
        function ($scope, $state, $location, productAPI, usSpinnerService, sale_deals, percent_off_deals, free_gift_deals) {

            var merchants;

            $scope.sale_deals = sale_deals.results.deals.deal;
            $scope.sale_deals_count = sale_deals.results.deals.count;
            $scope.sale_deal_merchants = sale_deals.resources.merchants.merchant;

            $scope.percent_deals = percent_off_deals.results.deals.deal;
            $scope.percent_deals_count = percent_off_deals.results.deals.count;
            $scope.percent_merchants = percent_off_deals.resources.merchants.merchant;

            $scope.gift_deals = free_gift_deals.results.deals.deal;
            $scope.gift_deals_count = free_gift_deals.results.deals.count;
            $scope.gift_deal_merchants = free_gift_deals.resources.merchants.merchant;

            merchants = _.union($scope.sale_deal_merchants, $scope.percent_merchants, $scope.gift_deal_merchants);

            $scope.getMerchantLogo = function (merchant_id) {

                var merchant_logo_url = _.result(_.findWhere(merchants, {'id': merchant_id}), 'logo_url');

                if (merchant_logo_url.length)
                    return merchant_logo_url;
                return '';
            };

            $scope.getMerchantName = function (merchant_id) {

                var merchant_name = _.result(_.findWhere(merchants, {'id': merchant_id}), 'name');

                if (merchant_name.length)
                    return merchant_name;
                return '';
            }
        }])
    .controller('TermsController', ['$scope', '$routeParams',
        function ($scope, $routeParams) {

        }])
    .controller('AboutController', ['$scope', '$routeParams',
        function ($scope, $routeParams) {

        }])
    .controller('PrivacyController', ['$scope', '$routeParams',
        function ($scope, $routeParams) {

        }])
    .controller('CookiesController', ['$scope', '$routeParams',
        function ($scope, $routeParams) {

        }])
    .controller('ContactController', ['$scope', '$routeParams',
        function ($scope, $routeParams) {

        }]);