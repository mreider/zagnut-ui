import _get from 'lodash/get';

export default {
  install (Vue, options = {}) {
    Vue.prototype.$errorMessage = {
      show (error, callback, defaultMessage = 'Server error occurs') {
        let status = _get(error, 'response.data.statusCode');
        if (status === 401) return (window.location = '/');

        let message = _get(error, 'response.data.message');
        if (!message) message = _get(error, 'response.details[0]');
        if (!message) message = error.message;
        if (!message && typeof error === 'string') message = error;
        if (!message) message = defaultMessage;

        const doc = new DOMParser().parseFromString(message, 'text/html');
        message = doc.body.textContent || '';

        Vue.notify({
          group: 'error',
          text: message,
          type: 'error'
        });
      }
    };
  }
};
