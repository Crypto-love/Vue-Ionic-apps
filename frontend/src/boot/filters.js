import Vue from 'vue';
import config from 'src/config';
import store from '../store/index';

Vue.filter('image', (val, size) => {
  if (typeof val === 'string' && val !== '' && size) {
    return `${config.images}/${size}/${val}.png`;
  } else {
    return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png';
  }
});

Vue.filter('imageSupplier', (val, size) => {
  if (typeof val === 'string' && val !== '') {
    return `https://${config.aws_s3_bucket_public}.s3-${config.aws_region}.amazonaws.com/supplier-logos/${val}`;
  } else {
    return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png';
  }
});

Vue.filter('imageCategory', (val) => {
  if (typeof val === 'string' && val !== '') {
    return `https://${config.aws_s3_bucket_public}.s3-${config.aws_region}.amazonaws.com/category-images/${val}`;
  } else {
    return 'https://treedots-statics.s3-ap-southeast-1.amazonaws.com/images/no_image.png';
  }
});

Vue.filter('currency', (value) => {
  if (!value) return `${store.state.currency_symbol} 0`;
  if (value < 0) return 0;
  return `${store.state.currency_symbol} ${value.toFixed(2)}`;
});
