angular.module('task', ['firebase']).
    value('fbURL', 'https://marx.firebaseio.com/').
    factory('Tasks', function (angularFireCollection, fbURL) {
        return angularFireCollection(fbURL);
    }).
    config(function ($routeProvider) {
        $routeProvider.
            when('/', {controller: ListCtrl, templateUrl: 'list.html'}).
            when('/edit/:taskId', {controller: TaskCtrl, templateUrl: 'detail.html'}).
            when('/new', {controller: CreateCtrl, templateUrl: 'detail.html'}).
            otherwise({redirectTo: '/'});
    });

function ListCtrl($scope, Tasks) {
    $scope.title = 'Hello!';
    $scope.tasks = Tasks;
}

function CreateCtrl($scope, $location, $timeout, Tasks) {
    $scope.title = 'Hello!';

    $scope.save = function () {
        Tasks.add($scope.task, function () {
            $timeout(function () {
                $location.path('/');
            });
        });
    };
}

function TaskCtrl($scope, $location, $routeParams, angularFire, fbURL) {
    $scope.title = 'Hello!';

    angularFire(fbURL + $routeParams.taskId, $scope, 'remote', {}).
    then(function () {
        $scope.task = angular.copy($scope.remote);
        $scope.task.$id = $routeParams.taskId;
        $scope.isClean = function () {
            return angular.equals($scope.remote, $scope.task);
        };
        $scope.destroy = function () {
            $scope.remote = null;
            $location.path('/');
        };
        $scope.save = function () {
            $scope.remote = angular.copy($scope.task);
            $location.path('/');
        };
    });
}