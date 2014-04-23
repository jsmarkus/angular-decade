(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['moment', 'angular', 'ng-select-link'], factory);
  } else {
    factory(root.moment, root.angular);
  }
}(this, function(moment, angular) {
  angular
    .module('ngDecade', ['NGSelectLink'])
    .constant('ngDecadeConfig', {})
    .directive('ngDecade', [
      '$timeout',
      'ngDecadeConfig',

      function($timeout, ngDecadeConfig) {
        var utcMoment = moment.utc.bind(moment);

        function getOptions(scope) {
          var defaultOptions = {
            utc: false,
            min: new Date((new Date()) - 10 /*years*/ * 365 * 24 * 3600 * 1000),
            max: new Date()
          };
          var scopeOptions = {};
          if (undefined !== scope.min) {
            scopeOptions.min = scope.min;
          }
          if (undefined !== scope.max) {
            scopeOptions.max = scope.max;
          }
          if (undefined !== scope.utc) {
            scopeOptions.utc = scope.utc;
          }

          var options = angular.extend(
            defaultOptions,
            ngDecadeConfig,
            scopeOptions);
          if (options.utc) {
            options.moment = utcMoment;
          } else {
            options.moment = moment;
          }
          return options;
        }

        function encode(y, m, e) {
          if (undefined === y || undefined === m || undefined === e) {
            return undefined;
          }
          return e + 4 * m + 48 * (y - 1970);
        }

        function onChange(modelController) {
          var decadeCode = encode(this.y, this.m, this.e);
          if (undefined !== decadeCode) {
            this.decade = this.decadeObject;
          } else {
            this.decade = undefined;
          }
          modelController.$setViewValue(decadeCode);
        }

        function getYears() {
          var options = getOptions(this);

          var minYear = options.moment(options.min).year();
          var maxYear = options.moment(options.max).year();
          if (maxYear < minYear) {
            throw new Error('illegal (min,max)');
          }
          var years = [];
          for (var y = minYear; y <= maxYear; y++) {
            years.push({
              id: y,
              name: y
            });
          }
          return years;
        }

        function getMonths(year) {
          var options = getOptions(this);

          var months = [];
          var currentYear = this.y;
          if (undefined === currentYear) {
            return [];
          }
          for (var m = 0; m <= 11; m++) {
            var mom = options.moment({
              year: currentYear,
              month: m
            });
            if (mom >= options.min && mom <= options.max) {
              months.push({
                id: m,
                name: mom.format('MMMM')
              });
            }
          }
          return months;
        }

        function getDecades(yearMonth) {
          var options = getOptions(this);

          var y = yearMonth[0];
          var m = yearMonth[1];
          if (undefined === y || undefined === m) {
            return [];
          }
          var decades = [];
          var mMin = options.moment(options.min);
          var mMax = options.moment(options.max);

          function isInRange(dec) {
            return dec.from >= mMin &&
              dec.from <= mMax &&
              dec.to >= mMin &&
              dec.to <= mMax;
          }

          var dec;
          isInRange(dec = dec1(options.moment, y, m)) && decades.push(dec);
          isInRange(dec = dec2(options.moment, y, m)) && decades.push(dec);
          isInRange(dec = dec3(options.moment, y, m)) && decades.push(dec);
          isInRange(dec = fullMonth(options.moment, y, m)) && decades.push(dec);

          return decades;
        }

        function dec1(moment, y, m) {
          return {
            id: 1,
            name: '01...10 (decade 1)',
            from: moment({
              year: y,
              month: m,
              day: 1
            }),
            to: moment({
              year: y,
              month: m,
              day: 10
            })
          };
        }

        function dec2(moment, y, m) {
          return {
            id: 2,
            name: '11...21 (decade 2)',
            from: moment({
              year: y,
              month: m,
              day: 11
            }),
            to: moment({
              year: y,
              month: m,
              day: 21
            })
          };
        }

        function dec3(moment, y, m) {
          var dec = {
            id: 3,
            from: moment({
              year: y,
              month: m,
              day: 21
            }),
            to: moment({
              year: y,
              month: m
            }).endOf('month')
          };
          dec.name = '21...' + dec.to.date() + ' (decade 3)';
          return dec;
        }

        function fullMonth(moment, y, m) {
          var dec = {
            id: 4,
            from: moment({
              year: y,
              month: m,
              day: 1
            }),
            to: moment({
              year: y,
              month: m
            }).endOf('month')
          };
          dec.name = '01...' + dec.to.date() + ' (full month)';
          return dec;
        }


        return {
          template: [
            '<div>',
            ' <div>',
            '  <label>Year</label>',
            '  <select ',
            '    ng-change="onChange()" ',
            '    ng-model="y" ',
            '    ng-options="_.id as _.name for _ in years" ',
            '    ng-select-link="getYears(null)"',
            '    ng-select-link-empty="\'Select year...\'"',
            '  ></select>',
            ' </div>',
            ' <div>',
            '  <label>Months</label>',
            '  <select ',
            '    ng-change="onChange()" ',
            '    ng-model="m" ',
            '    ng-options="_.id as _.name for _ in months" ',
            '    ng-select-link="getMonths(y)"',
            '    ng-select-link-empty="\'Select month...\'"',
            '  ></select>',
            ' </div>',
            ' <div>',
            '  <label>Decade</label>',
            '  <select ',
            '    ng-change="onChange()" ',
            '    ng-model="e" ',
            '    ng-options="_.id as _.name for _ in decades" ',
            '    ng-select-link="getDecades([y,m])"',
            '    ng-select-link-item="decadeObject"',
            '    ng-select-link-empty="\'Select period...\'"',
            '  ></select>',
            ' </div>',
            '</div>',
          ].join('\n'),
          replace: true,
          restrict: 'E',
          require: 'ngModel',
          scope: {
            model: '=ngModel',
            decade: '=decade',
            min: '=min',
            max: '=max',
            utc: '=utc'
          },
          link: function(scope, attrs, element, modelController) {
            angular.extend(scope, {
              getYears: getYears,
              getMonths: getMonths,
              getDecades: getDecades,
              onChange: $timeout.bind(null, onChange.bind(scope, modelController))
            });
          }
        };
      }
    ]);
}));