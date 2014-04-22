(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['moment', 'angular', 'ng-select-link'], factory);
  } else {
    factory(root.moment, root.angular);
  }
}(this, function(moment, angular) {
  angular
    .module('ngDecade', ['NGSelectLink'])
    .directive('ngDecade', [

      function() {
        function getYears() {
          var minYear = moment(this.min).year();
          var maxYear = moment(this.max).year();
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
          var months = [];
          var currentYear = this.y;
          if (undefined === currentYear) {
            return [];
          }
          for (var m = 0; m <= 11; m++) {
            var mom = moment({
              year: currentYear,
              month: m
            });
            if (mom >= this.min && mom <= this.max) {
              months.push({
                id: m,
                name: mom.format('MMMM')
              });
            }
          }
          return months;
        }

        function getDecades(yearMonth) {
          var y = yearMonth[0];
          var m = yearMonth[1];
          if (undefined === y || undefined === m) {
            return [];
          }
          var decades = [];
          var mMin = moment(this.min);
          var mMax = moment(this.max);
          var dec;
          dec = dec1(y, m);
          if (dec.from >= mMin && dec.from <= mMax && dec.to >= mMin && dec.to <= mMax) {
            decades.push(dec);
          }

          dec = dec2(y, m);
          if (dec.from >= mMin && dec.from <= mMax && dec.to >= mMin && dec.to <= mMax) {
            decades.push(dec);
          }

          dec = dec3(y, m);
          if (dec.from >= mMin && dec.from <= mMax && dec.to >= mMin && dec.to <= mMax) {
            decades.push(dec);
          }

          dec = fullMonth(y, m);
          if (dec.from >= mMin && dec.from <= mMax && dec.to >= mMin && dec.to <= mMax) {
            decades.push(dec);
          }

          return decades;
        }

        function dec1(y, m) {
          return {
            id: 1,
            name: '1...10',
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

        function dec2(y, m) {
          return {
            id: 2,
            name: '11...21',
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

        function dec3(y, m) {
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
          dec.name = '21...' + dec.to.date();
          return dec;
        }

        function fullMonth(y, m) {
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
          dec.name = '1...' + dec.to.date() + ' (full month)';
          return dec;
        }

        return {
          template: [
            '<div>',
            ' <div>',
            '  <label>Year</label>',
            '  <select ',
            '    ng-model="y" ',
            '    ng-options="_.id as _.name for _ in years" ',
            '    ng-select-link="getYears(null)"',
            '    ng-select-link-empty="\'Select year...\'"',
            '  ></select>',
            ' </div>',
            ' <div>',
            '  <label>Months</label>',
            '  <select ',
            '    ng-model="m" ',
            '    ng-options="_.id as _.name for _ in months" ',
            '    ng-select-link="getMonths(y)"',
            '    ng-select-link-empty="\'Select month...\'"',
            '  ></select>',
            ' </div>',
            ' <div>',
            '  <label>Decade</label>',
            '  <select ',
            '    ng-model="e" ',
            '    ng-options="_.id as _.name for _ in decades" ',
            '    ng-select-link="getDecades([y,m])"',
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
            min: '=min',
            max: '=max'
          },
          link: function(scope) {
            angular.extend(scope, {
              getYears: getYears,
              getMonths: getMonths,
              getDecades: getDecades
            });
          }
        };
      }
    ]);
}));