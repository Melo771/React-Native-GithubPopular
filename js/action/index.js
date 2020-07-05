import {onThemeChange, onThemeInit, onShowCustomThemeView} from './theme';
import {
  onRefreshPopular,
  onLoadMorePopular,
  onFlushPopularFavorite,
} from './popular';
import {
  onRefreshTrending,
  onLoadMoreTrending,
  onFlushTrendingFavorite,
} from './trending';
import {onLoadFavoriteData} from './favorite';
import {onLoadLanguage} from './language';
import {onSearch, onLoadMoreSearch, onSearchCancel} from './search';

export default {
  onThemeChange,
  onRefreshPopular,
  onLoadMorePopular,
  onFlushPopularFavorite,
  onFlushTrendingFavorite,
  onRefreshTrending,
  onLoadMoreTrending,
  onLoadFavoriteData,
  onLoadLanguage,
  onThemeInit,
  onShowCustomThemeView,
  onSearch,
  onLoadMoreSearch,
  onSearchCancel,
};
