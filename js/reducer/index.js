import {combineReducers} from 'redux';
import theme from './theme';
import popular from './popular';
import trending from './trending';
import favorite from './favorite';
import language from './language';
import search from './search';

export default combineReducers({
  theme,
  popular,
  trending,
  favorite,
  language,
  search,
});
