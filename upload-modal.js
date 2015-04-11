(function () {
  'use strict';

  angular.module('upload-modal', [])

  .directive('uploadModal', ['$http', function ($http) {
    return {
      restrict: 'E',

      compile: function(elem, attrs) {

        var $targetImage = elem.next('img');
        var $dropzoneModal = $('#dropzone-modal');
        var dropzone;
        var jcrop;

        $targetImage.attr('data-toggle', 'modal');
        $targetImage.attr('data-target', '#dropzone-modal');
        $targetImage.css('cursor', 'pointer');

        return function(scope, elem, attrs) {
          dropzone = new Dropzone("#dropzone-form", {
            url: '/upload',
            maxFilesize: 4, // MB
            clickable: '#dropzone-button',
            autoProcessQueue: false,
            previewTemplate: '<div><img id="dropzone-img" data-dz-thumbnail></div>',
            previewsContainer: "#dropzone-preview",
            thumbnailWidth: null,
            thumbnailHeight: null,
            maxFiles: 1,
            maxfilesexceeded: function(file) {
              this.removeFile(file);
            },
            init: function() {
              this.on('thumbnail', function(file) {
                dropzone.disable();
                scope.added = true;
                scope.$apply();

                attachJcrop();
              });
            }
          });

          var attachJcrop = function() {
            $('#dropzone-img').Jcrop({
              bgOpacity: 0.25,
              bgColor: 'white',
              addClass: 'jcrop-light',
              aspectRatio: 1,
              minSize: [100, 100],
              keySupport: false
            }, function() {
              jcrop = this;
              jcrop.animateTo([50,50,300,300]);
            });
          };

          $dropzoneModal.on('hidden.bs.modal', function () {
            scope.resetDropzone();
            scope.$apply();
          });

          $dropzoneModal.mousedown(function (e) {
            var $this = $(this);

            if( ! $this.has(e.target).length) {
              $this.modal('hide');
            }
          });

          scope.uploadImage = function () {
            var params = {
              selection: jcrop.tellSelect(),
              image: $('#dropzone-img').prop('src'),
              size: jcrop.getBounds()
            };

            $http.post(dropzone.options.url, params).then(function (response) {
              if (response.data == 0) {
                // TODO show error alert
                return;
              }

              $targetImage.attr('src', $targetImage.attr('src') + '?' + (new Date).getTime());
            });

            $dropzoneModal.modal('hide');
          };

          scope.resetDropzone = function () {
            if(!jcrop) return;

            jcrop.destroy();

            dropzone.removeAllFiles();
            dropzone.enable();
            scope.added = false;
          };
        }
      },

      templateUrl: '/templates/upload-modal.html'
    };
  }]);
})();
