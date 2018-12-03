angular.module('todos', ['firebase', 'ngAnimate', 'ngRoute', 'ngCookies']).
    value('fbURL', 'https://marx.firebaseio.com/').
    factory('Tasks', function (angularFireCollection, fbURL, $routeParams, $rootScope) {
        if ($routeParams.uid) {
            $rootScope.$broadcast('loading', true);
            return angularFireCollection(fbURL + $routeParams.uid + '/tasks/', function () {
                $rootScope.$broadcast('loading', false);
            });
        }
        return {};
    }).
    value('num2Id', function (number) {
        var result = [];

        while (number > 0) {
            result.push(number % 64);
            number = Math.floor(number / 64);
        }

        return result.map(function (number) {
            return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+_'[number];
        }).join('');
    }).
    factory('newId', function (num2Id) {
        var t = Date.now();
        var r = Math.random();

        return num2Id((t + r) * 10000);
    }).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: NewCtrl, template: '<h1><a href="#/{{uniqueID}}">START</a></h1>'}).
            when('/:uid', {controller: ListCtrl, templateUrl: 'list.html'}).
            when('/:uid/new', {controller: CreateCtrl, templateUrl: 'detail.html'}).
            when('/:uid/edit/:taskid', {controller: EditCtrl, templateUrl: 'detail.html'}).
            otherwise({redirectTo: '/'});
    });

function HeaderCtrl($scope, $rootScope) {
    $scope.$on('uid', function (evt, uid) {
        $scope.uniqueID = uid;
    });
    $scope.toggle = function () {
        $rootScope.$broadcast('toggle');
    };
}

function NewCtrl($scope, $location, newId) {
    $location.path(newId);
    $location.replace();
}
function ListCtrl($scope, $rootScope, $routeParams, $timeout, Tasks) {
    $rootScope.$broadcast('uid', $routeParams.uid);
    $scope.uniqueID = $routeParams.uid;
    $scope.list = Tasks;
    $scope.loading = true;
    $scope.$on('loading', function (evt, flag) {
        $timeout(function () {
            $scope.loading = flag;
        }, 1000);
    });
}
function CreateCtrl($scope, $rootScope, $routeParams, $location, $timeout, Tasks) {
    $rootScope.$broadcast('uid', $routeParams.uid);
    $scope.uniqueID = $routeParams.uid;
    $scope.save = function () {
        Tasks.add($scope.task, function () {
            $timeout(function () {
                $location.path('/' + $scope.uniqueID);
            });
        });
    };
}
function EditCtrl($scope, $rootScope, $location, $routeParams, angularFire, fbURL) {
    $rootScope.$broadcast('uid', $routeParams.uid);
    $scope.uniqueID = $routeParams.uid;
    $scope.taskId = $routeParams.taskid;

    angularFire(fbURL + $routeParams.uid + '/tasks/' + $scope.taskId, $scope, 'remote', {}).
        then(function () {
            $scope.task = angular.copy($scope.remote);
            $scope.task.$id = $scope.taskId;
            $scope.isClean = function () {
                return angular.equals($scope.remote, $scope.task);
            };
            $scope.destroy = function () {
                $scope.remote = null;
                $location.path('/' + $scope.uniqueID);
            };
            $scope.save = function () {
                $scope.remote = angular.copy($scope.task);
                $location.path('/' + $scope.uniqueID);
            };
        });
}

function MessageCtrl($scope, $routeParams, $cookieStore, fbURL, angularFireCollection, dateFilter) {
    var Messages;

    $scope.$on('toggle', function (evt) {
        $scope.shown = !$scope.shown;
    });

    if (!$scope.msg) {
        $scope.msg = {};
    }
    $scope.msg.nickname = $cookieStore.get('nickname');

    $scope.$on('uid', function (evt, uid) {
        Messages = angularFireCollection(fbURL + $routeParams.uid + '/messages/');
        $scope.list = Messages;
    });

    $scope.send = function () {
        $scope.msg.time = dateFilter(new Date(), 'M/d/yy h:mm:ss a');
        $cookieStore.put('nickname', $scope.msg.nickname);
        Messages.add($scope.msg);
        $scope.msg.content = '';
    };
}